import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Tooltip, Descriptions, Row, Col, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, UndoOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { exportToExcel } from '../utils/exportUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const { Option } = Select;
const { Title } = Typography;

const Assets = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Filters
    const [filterCompany, setFilterCompany] = useState(null);
    const [filterDepartment, setFilterDepartment] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [searchText, setSearchText] = useState('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [assigningAsset, setAssigningAsset] = useState(null);
    const [viewingAsset, setViewingAsset] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [assignForm] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchAssets(1, pagination.pageSize);
    }, [filterCompany, filterDepartment, filterType, searchText]);

    const fetchData = async () => {
        try {
            const params = { limit: 1000 };
            const [c, d, t, e] = await Promise.all([
                api.get('/companies', { params }),
                api.get('/departments', { params }),
                api.get('/device-types', { params }),
                api.get('/employees', { params })
            ]);
            setCompanies(c.data.data || []);
            setDepartments(d.data.data || []);
            setDeviceTypes(t.data.data || []);
            setEmployees(e.data.data || []);
        } catch (error) {
            message.error('Failed to load initial data');
        }
    };

    const fetchAssets = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (filterCompany) params.companyId = filterCompany;
            if (filterDepartment) params.departmentId = filterDepartment;
            if (filterType) params.typeId = filterType;
            if (searchText) params.search = searchText;

            const { data } = await api.get('/assets', { params });
            setAssets(data.data || []);
            setPagination({
                current: data.page,
                pageSize: data.limit,
                total: data.total
            });
        } catch (error) {
            message.error('Failed to fetch assets');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        fetchAssets(newPagination.current, newPagination.pageSize);
    };

    const handleExport = async () => {
        try {
            message.loading({ content: 'Preparing data export...', key: 'exporting' });
            const params = { limit: 1000000 };
            if (filterCompany) params.companyId = filterCompany;
            if (filterDepartment) params.departmentId = filterDepartment;
            if (filterType) params.typeId = filterType;
            if (searchText) params.search = searchText;

            const { data } = await api.get('/assets', { params });
            const exportData = (data.data || []).map(item => ({
                'Tag': item.tag,
                'Name': item.name,
                'Serial Number': item.serialNumber,
                'Type': item.deviceType?.name || '-',
                'Company': item.company?.name || '-',
                'Department': item.department?.name || '-',
                'Assigned To': item.employee?.name || '-',
                'Status': t(`status.${item.status}`),
                'Purchase Date': item.purchaseDate ? dayjs(item.purchaseDate).format('YYYY-MM-DD') : '-',
                'Warranty Expiry': item.warrantyExpiry ? dayjs(item.warrantyExpiry).format('YYYY-MM-DD') : '-',
                'Value': item.value ? `$${item.value}` : '-',
                'Notes': item.notes || '-'
            }));

            exportToExcel(exportData, 'Assets_Full_Report');
            message.success({ content: 'Export complete!', key: 'exporting' });
        } catch (error) {
            message.error({ content: 'Export failed!', key: 'exporting' });
        }
    };

    const handleEdit = (record) => {
        setEditingAsset(record);
        form.setFieldsValue({
            ...record,
            purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
            warrantyExpiry: record.warrantyExpiry ? dayjs(record.warrantyExpiry) : null,
            ...record.customAttributes // Flatten custom attributes for form if field names don't collide
        });
        setIsModalOpen(true);
    };

    const handleViewDetails = async (record) => {
        try {
            const { data } = await api.get(`/assets/${record.id}`);
            setViewingAsset(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            message.error('Failed to load asset details');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: t('tables.confirmDelete'),
            content: 'This action cannot be undone.',
            onOk: async () => {
                try {
                    await api.delete(`/assets/${id}`);
                    message.success('Asset deleted');
                    fetchAssets();
                } catch (error) {
                    const errorMsg = error.response?.data?.error || 'Failed to delete asset';
                    message.error(errorMsg);
                }
            }
        });
    };

    const handleSave = async (values) => {
        try {
            // Extract custom attributes based on device type schema
            const selectedType = (deviceTypes || []).find(t => t.id === values.typeId);
            let customAttributes = {};
            if (selectedType && selectedType.schema) {
                // For simplicity, we grab all fields that match schema keys
                const schema = typeof selectedType.schema === 'string' ? JSON.parse(selectedType.schema) : (selectedType.schema || []);
                schema.forEach(field => {
                    if (values[field.key]) customAttributes[field.key] = values[field.key];
                });
            }

            const payload = {
                companyId: values.companyId,
                departmentId: values.departmentId,
                tag: values.tag,
                name: values.name,
                typeId: values.typeId,
                brand: values.brand,
                serialNumber: values.serialNumber,
                value: values.value,
                status: values.status,
                config: values.config,
                customAttributes,
                purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : null,
                warrantyExpiry: values.warrantyExpiry ? values.warrantyExpiry.toISOString() : null,
            };

            if (editingAsset) {
                await api.put(`/assets/${editingAsset.id}`, payload);
                message.success('Asset updated');
            } else {
                await api.post('/assets', payload);
                message.success('Asset created');
            }
            setIsModalOpen(false);
            setEditingAsset(null);
            form.resetFields();
            fetchAssets();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleAssign = async (values) => {
        try {
            await api.post(`/assets/${assigningAsset.id}/assign`, values);
            message.success('Asset assigned');
            setIsAssignModalOpen(false);
            setAssigningAsset(null);
            assignForm.resetFields();
            fetchAssets();
        } catch (error) {
            message.error('Assignment failed');
        }
    };

    const handleReturn = async (asset) => {
        try {
            await api.post(`/assets/${asset.id}/return`, {});
            message.success('Asset returned');
            fetchAssets();
        } catch (error) {
            message.error('Return failed');
        }
    };

    // Roles
    const canManage = user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT';

    // Columns
    const columns = [
        {
            title: t('tables.tag'),
            dataIndex: 'tag',
            sorter: (a, b) => a.tag.localeCompare(b.tag),
        },
        {
            title: t('tables.name'),
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: t('tables.type'),
            render: (r) => r.deviceType?.name || r.type,
        },
        {
            title: t('tables.brand'),
            dataIndex: 'brand',
        },
        {
            title: t('tables.company'),
            render: (r) => r.company?.name,
        },
        {
            title: t('tables.department'),
            render: (r) => r.department?.name || '-',
        },
        {
            title: t('tables.assignedTo'),
            render: (r) => r.employee ? <Tag color="blue">{r.employee.name}</Tag> : <Tag>{t('tables.unassigned')}</Tag>,
        },
        {
            title: t('tables.status'),
            dataIndex: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'IN_USE') color = 'processing';
                if (status === 'IN_STOCK') color = 'success';
                if (status === 'BROKEN') color = 'error';
                return <Tag color={color}>{t(`status.${status}`)}</Tag>
            }
        },
        ...(canManage ? [{
            title: t('tables.actions'),
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    {record.employee ? (
                        <Button icon={<UndoOutlined />} size="small" type="primary" danger onClick={() => handleReturn(record)} title="Return" />
                    ) : (
                        <Button icon={<UserAddOutlined />} size="small" type="primary" onClick={() => { setAssigningAsset(record); setIsAssignModalOpen(true); }} title="Assign" />
                    )}
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        }] : [])
    ];

    // Dynamic Form Fields renderer
    const selectedTypeId = Form.useWatch('typeId', form);
    const selectedType = (deviceTypes || []).find(t => t.id === selectedTypeId);

    const renderDynamicFields = () => {
        if (!selectedType || !selectedType.schema) return null;
        let schema = [];
        try {
            schema = typeof selectedType.schema === 'string' ? JSON.parse(selectedType.schema) : selectedType.schema;
        } catch (e) { return null; }

        return (
            <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                <h4>{selectedType.name} Details</h4>
                <Row gutter={16}>
                    {schema.map(field => (
                        <Col span={12} key={field.key}>
                            <Form.Item name={field.key} label={field.label}>
                                <Input />
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    return (
        <div>
            {loading && <LoadingSpinner fullPage type="dual" />}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <Space wrap>
                    <Input.Search
                        placeholder="Search assets..."
                        onSearch={val => setSearchText(val)}
                        style={{ width: 200 }}
                        allowClear
                    />
                    <Select
                        placeholder="Filter Company"
                        style={{ width: 150 }}
                        allowClear
                        onChange={setFilterCompany}
                    >
                        {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                    <Select
                        placeholder="Filter Department"
                        style={{ width: 150 }}
                        allowClear
                        onChange={setFilterDepartment}
                    >
                        {departments
                            .filter(d => !filterCompany || d.companyId === filterCompany)
                            .map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                    </Select>
                    <Select
                        placeholder="Filter Type"
                        style={{ width: 150 }}
                        allowClear
                        onChange={setFilterType}
                    >
                        {deviceTypes.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
                    </Select>
                </Space>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Export
                    </Button>
                    {canManage && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingAsset(null); form.resetFields(); setIsModalOpen(true); }}>
                            Add Asset
                        </Button>
                    )}
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={assets}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => t('tables.totalItems', { total })
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
                onRow={(record) => ({
                    onClick: () => handleViewDetails(record),
                    style: { cursor: 'pointer' }
                })}
            />

            {/* Asset Detail Modal */}
            <Modal
                title="Asset Details"
                width={700}
                open={isDetailModalOpen}
                onCancel={() => { setViewingAsset(null); setIsDetailModalOpen(false); }}
                footer={[
                    <Button key="close" onClick={() => { setViewingAsset(null); setIsDetailModalOpen(false); }}>
                        Close
                    </Button>
                ]}
            >
                {viewingAsset && (
                    <>
                        <Descriptions title="Key Information" bordered column={2} size="small">
                            <Descriptions.Item label="Tag">{viewingAsset.tag}</Descriptions.Item>
                            <Descriptions.Item label="Name">{viewingAsset.name}</Descriptions.Item>
                            <Descriptions.Item label="Type">{viewingAsset.deviceType?.name || viewingAsset.type || 'Unknown'}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={viewingAsset.status === 'IN_USE' ? 'blue' : viewingAsset.status === 'IN_STOCK' ? 'green' : 'default'}>
                                    {viewingAsset.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Brand">{viewingAsset.brand || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Model">{viewingAsset.model || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Serial">{viewingAsset.serialNumber || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Purchased">{viewingAsset.purchaseDate ? dayjs(viewingAsset.purchaseDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Warranty">{viewingAsset.warrantyExpiry ? dayjs(viewingAsset.warrantyExpiry).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Current User">{viewingAsset.employee?.name || 'Unassigned'}</Descriptions.Item>
                        </Descriptions>

                        {/* Device Specs */}
                        {(() => {
                            const type = (deviceTypes || []).find(t => t.id === viewingAsset.typeId);
                            if (type && type.schema) {
                                let schema = [];
                                try {
                                    schema = typeof type.schema === 'string' ? JSON.parse(type.schema) : (type.schema || []);
                                } catch (e) { }

                                if (schema.length > 0) {
                                    return (
                                        <div style={{ marginTop: 24 }}>
                                            <h3>{type.name} Details</h3>
                                            <Descriptions bordered column={2} size="small">
                                                {schema.map(field => (
                                                    <Descriptions.Item key={field.key} label={field.label}>
                                                        {viewingAsset.customAttributes?.[field.key] || '-'}
                                                    </Descriptions.Item>
                                                ))}
                                            </Descriptions>
                                        </div>
                                    );
                                }
                            }
                            return null;
                        })()}

                        <div style={{ marginTop: 24 }}>
                            <h3>Assignment History</h3>
                            <Table
                                dataSource={viewingAsset.history || []}
                                rowKey="id"
                                size="small"
                                pagination={false}
                                columns={[
                                    { title: t('tables.employee'), render: (r) => r.employee?.name || t('tables.unknown') },
                                    { title: t('tables.dateAssigned'), render: (r) => dayjs(r.assignedDate).format('DD/MM/YYYY HH:mm') },
                                    { title: t('tables.dateReturned'), render: (r) => r.returnDate ? dayjs(r.returnDate).format('DD/MM/YYYY HH:mm') : t('tables.current') },
                                    { title: t('tables.notes'), dataIndex: 'notes' }
                                ]}
                            />
                        </div>
                    </>
                )}
            </Modal>

            {/* Create/Edit Modal */}
            <Modal
                title={editingAsset ? "Edit Asset" : "Add Asset"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
                                <Select onChange={() => form.setFieldValue('departmentId', null)}>
                                    {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                noStyle
                                dependencies={['companyId']}
                            >
                                {({ getFieldValue }) => (
                                    <Form.Item name="departmentId" label="Department">
                                        <Select disabled={!getFieldValue('companyId')} placeholder="Select Department">
                                            {departments
                                                .filter(d => d.companyId === getFieldValue('companyId'))
                                                .map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="tag" label="Asset Tag" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="name" label="Asset Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="typeId" label="Device Type">
                                <Select
                                    popupRender={(menu) => (
                                        <>
                                            {menu}
                                            <div style={{ padding: '8px', textAlign: 'center' }}>
                                                {/* Placeholder for Add Type feature in future */}
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>Manage in Settings</Typography.Text>
                                            </div>
                                        </>
                                    )}
                                >
                                    {deviceTypes.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Dynamic Fields */}
                    {renderDynamicFields()}

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="brand" label="Brand"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="serialNumber" label="Serial Number"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="value" label="Value"><Input type="number" /></Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="purchaseDate" label="Purchase Date"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="warrantyExpiry" label="Warranty Expiry"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status" label="Status" initialValue="IN_STOCK">
                                <Select>
                                    <Option value="IN_STOCK">In Stock</Option>
                                    <Option value="IN_USE">In Use</Option>
                                    <Option value="BROKEN">Broken</Option>
                                    <Option value="DISPOSED">Disposed</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="config" label="Additional Config/Notes">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Assignment Modal */}
            <Modal
                title={`Assign ${assigningAsset?.name}`}
                open={isAssignModalOpen}
                onCancel={() => setIsAssignModalOpen(false)}
                onOk={() => assignForm.submit()}
            >
                <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
                    <Form.Item name="employeeId" label="Select Employee" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {employees
                                .filter(e => !assigningAsset || e.companyId === assigningAsset.companyId)
                                .map(e => <Option key={e.id} value={e.id}>{e.name} - {e.code}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
};

export default Assets;
