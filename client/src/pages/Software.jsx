import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Typography, Row, Col, Card, Statistic, Drawer, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, KeyOutlined, LaptopOutlined } from '@ant-design/icons';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import LoadingSpinner from '../components/LoadingSpinner';

const { Option } = Select;
const { Title, Text } = Typography;

const Software = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);

    // Modals
    const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState(false);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const [editingSoftware, setEditingSoftware] = useState(null);
    const [targetSoftware, setTargetSoftware] = useState(null);
    const [targetLicense, setTargetLicense] = useState(null); // For assignment
    const [editingLicense, setEditingLicense] = useState(null); // For editing license details
    const [viewingSoftware, setViewingSoftware] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [softwareForm] = Form.useForm();
    const [licenseForm] = Form.useForm();
    const [assignForm] = Form.useForm();

    useEffect(() => {
        fetchSoftware();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (viewingSoftware) {
            const updated = softwareList.find(s => s.id === viewingSoftware.id);
            if (updated) setViewingSoftware(updated);
        }
    }, [softwareList]);

    const fetchSoftware = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/software');
            setSoftwareList(data);
        } catch (error) {
            message.error('Failed to fetch software');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/employees');
            setEmployees(data);
        } catch (error) {
            message.error('Failed to load employees');
        }
    };

    const handleSaveSoftware = async (values) => {
        try {
            if (editingSoftware) {
                await api.put(`/software/${editingSoftware.id}`, values);
                message.success('Software updated');
            } else {
                await api.post('/software', values);
                message.success('Software added');
            }
            setIsSoftwareModalOpen(false);
            fetchSoftware();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSaveLicense = async (values) => {
        try {
            const payload = {
                ...values,
                purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : null,
                expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
            };

            if (editingLicense) {
                await api.put(`/software/licenses/${editingLicense.id}`, payload);
                message.success('License updated');
            } else {
                await api.post(`/software/${targetSoftware.id}/licenses`, payload);
                message.success('License added');
            }
            setIsLicenseModalOpen(false);
            setEditingLicense(null); // Reset
            fetchSoftware();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleAssignLicense = async (values) => {
        try {
            await api.post(`/software/licenses/${targetLicense.id}/assign`, values);
            message.success('License assigned');
            setIsAssignModalOpen(false);
            fetchSoftware();
        } catch (error) {
            message.error('Assignment failed');
        }
    };

    const handleDeleteSoftware = (id) => {
        Modal.confirm({
            title: t('tables.confirmDelete'),
            content: 'This will remove the software and all associated licenses.',
            onOk: async () => {
                try {
                    await api.delete(`/software/${id}`);
                    message.success('Software deleted');
                    fetchSoftware();
                } catch (error) {
                    message.error('Deletion failed');
                }
            }
        });
    };

    // Roles
    const canManage = user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT';

    const columns = [
        {
            title: t('tables.name'),
            dataIndex: 'name',
            render: (text) => (
                <Space>
                    <LaptopOutlined />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: t('tables.category'),
            dataIndex: 'category',
            render: (cat) => <Tag color="blue">{cat || t('tables.uncategorized')}</Tag>
        },
        {
            title: t('tables.licenses'),
            render: (_, record) => {
                const totalSeats = record.licenses.reduce((acc, curr) => acc + curr.seats, 0);
                const assigned = record.licenses.reduce((acc, curr) =>
                    acc + curr.assignments.filter(a => !a.returnDate).length, 0);
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <Text style={{ fontSize: '12px' }}>{assigned} / {totalSeats} {t('tables.seatsUsed')}</Text>
                        <Tag color={assigned >= totalSeats ? 'red' : 'green'}>
                            {totalSeats - assigned} {t('tables.available')}
                        </Tag>
                    </div>
                );
            }
        },
        ...(canManage ? [{
            title: t('tables.actions'),
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Button icon={<EditOutlined />} onClick={() => { setEditingSoftware(record); softwareForm.setFieldsValue(record); setIsSoftwareModalOpen(true); }} />
                    <Button icon={<KeyOutlined />} type="primary" onClick={() => { setTargetSoftware(record); setEditingLicense(null); licenseForm.resetFields(); setIsLicenseModalOpen(true); }}>Add License</Button>
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteSoftware(record.id)} />
                </Space>
            )
        }] : [])
    ];

    const handleViewDetails = (record) => {
        setViewingSoftware(record);
        setIsDetailModalOpen(true);
    };

    const licenseColumns = [
        { title: t('tables.licenseKey'), dataIndex: 'licenseKey', render: (k) => k || 'N/A' },
        { title: t('tables.type'), dataIndex: 'type' },
        { title: t('tables.seats'), dataIndex: 'seats' },
        {
            title: t('tables.used'),
            render: (r) => (
                <Space wrap>
                    {r.assignments.filter(a => !a.returnDate).map(a => (
                        <Tag key={a.id} color="processing" closable={canManage} onClose={async (e) => {
                            e.preventDefault();
                            try {
                                await api.delete(`/software/assignments/${a.id}`);
                                message.success('Assignment removed');
                                fetchSoftware();
                                // Update viewingSoftware if it's the one being viewed
                                if (viewingSoftware && viewingSoftware.id === viewingSoftware.id) {
                                    // We need to re-fetch or update local state.
                                    // For simplicity, fetching software updates the list, but not viewingSoftware object directly unless we re-find it.
                                    // Let's handle this in useEffect or a helper.
                                }
                            } catch (err) {
                                message.error('Failed to remove assignment');
                            }
                        }}>
                            {a.employee?.name || 'Unknown Employee'}
                        </Tag>
                    ))}
                    {canManage && r.assignments.filter(a => !a.returnDate).length < r.seats && (
                        <Button size="small" type="dashed" icon={<UserAddOutlined />} onClick={() => { setTargetLicense(r); setIsAssignModalOpen(true); }}>Assign</Button>
                    )}
                </Space>
            )
        },
        { title: t('tables.expiry'), dataIndex: 'expiryDate', render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : 'Never' },
        { title: t('tables.purchaseDate'), dataIndex: 'purchaseDate', render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
        {
            title: t('tables.status'),
            dataIndex: 'status',
            render: (s) => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{t(`status.${s}`)}</Tag>
        },
        ...(canManage ? [{
            title: t('tables.actions'),
            render: (_, r) => (
                <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                        setEditingLicense(r);
                        setTargetSoftware(viewingSoftware); // Keep reference
                        licenseForm.setFieldsValue({
                            ...r,
                            purchaseDate: r.purchaseDate ? dayjs(r.purchaseDate) : null,
                            expiryDate: r.expiryDate ? dayjs(r.expiryDate) : null,
                        });
                        setIsLicenseModalOpen(true);
                    }}
                />
            )
        }] : [])
    ];

    return (
        <div>
            {loading && <LoadingSpinner fullPage />}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Software Asset Management</Title>
                {canManage && (
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingSoftware(null); softwareForm.resetFields(); setIsSoftwareModalOpen(true); }}>
                        Add Software
                    </Button>
                )}
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card><Statistic title="Total Software" value={softwareList.length} /></Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Seats"
                            value={softwareList.reduce((acc, s) => acc + s.licenses.reduce((la, l) => la + l.seats, 0), 0)}
                        />
                    </Card>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={softwareList}
                rowKey="id"
                loading={loading}
                onRow={(record) => ({
                    onClick: () => handleViewDetails(record),
                    style: { cursor: 'pointer' }
                })}
            />

            {/* Software Modal */}
            <Modal
                title={editingSoftware ? "Edit Software" : "Add New Software"}
                open={isSoftwareModalOpen}
                onCancel={() => setIsSoftwareModalOpen(false)}
                onOk={() => softwareForm.submit()}
            >
                <Form form={softwareForm} layout="vertical" onFinish={handleSaveSoftware}>
                    <Form.Item name="name" label="Software Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Zoom, Microsoft 365" />
                    </Form.Item>
                    <Form.Item name="category" label="Category">
                        <Select placeholder="Select category">
                            <Option value="Communication">Communication</Option>
                            <Option value="SaaS">SaaS</Option>
                            <Option value="Design">Design</Option>
                            <Option value="Development">Development</Option>
                            <Option value="OS">Operating System</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="developer" label="Developer">
                        <Input placeholder="e.g. Microsoft, Adobe" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* License Modal */}
            <Modal
                title={editingLicense ? "Edit License" : `Add License for ${targetSoftware?.name}`}
                open={isLicenseModalOpen}
                onCancel={() => setIsLicenseModalOpen(false)}
                onOk={() => licenseForm.submit()}
            >
                <Form form={licenseForm} layout="vertical" onFinish={handleSaveLicense}>
                    <Form.Item name="licenseKey" label="License Key / Account ID">
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="License Type" initialValue="SUBSCRIPTION">
                                <Select>
                                    <Option value="SUBSCRIPTION">Subscription</Option>
                                    <Option value="PERPETUAL">Perpetual</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="seats" label="Seats / Accounts" initialValue={1}>
                                <Input type="number" min={1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="purchaseDate" label="Purchase Date">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="expiryDate" label="Expiry Date">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="cost" label="Cost">
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="currency" label="Currency" initialValue="VND">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Assignment Modal */}
            <Modal
                title="Assign License to Employee"
                open={isAssignModalOpen}
                onCancel={() => setIsAssignModalOpen(false)}
                onOk={() => assignForm.submit()}
            >
                <Form form={assignForm} layout="vertical" onFinish={handleAssignLicense}>
                    <Form.Item name="employeeId" label="Select Employee" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {employees.map(e => <Option key={e.id} value={e.id}>{e.name} ({e.code})</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>


            {/* Software Detail Modal */}
            <Modal
                title="Software Details"
                width={900}
                open={isDetailModalOpen}
                onCancel={() => { setViewingSoftware(null); setIsDetailModalOpen(false); }}
                footer={[
                    canManage && <Button key="edit" icon={<EditOutlined />} onClick={() => { setEditingSoftware(viewingSoftware); softwareForm.setFieldsValue(viewingSoftware); setIsSoftwareModalOpen(true); }}>Edit</Button>,
                    canManage && <Button key="addLicense" icon={<KeyOutlined />} type="primary" onClick={() => { setTargetSoftware(viewingSoftware); setEditingLicense(null); licenseForm.resetFields(); setIsLicenseModalOpen(true); }}>Add License</Button>,
                    <Button key="close" onClick={() => { setViewingSoftware(null); setIsDetailModalOpen(false); }}>Close</Button>
                ].filter(Boolean)}
            >
                {viewingSoftware && (
                    <>
                        <Descriptions title="Info" bordered column={1} size="small">
                            <Descriptions.Item label="Name">{viewingSoftware.name}</Descriptions.Item>
                            <Descriptions.Item label="Category">{viewingSoftware.category}</Descriptions.Item>
                            <Descriptions.Item label="Developer">{viewingSoftware.developer || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Description">{viewingSoftware.description || '-'}</Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h4>Licenses</h4>
                            <Table
                                dataSource={viewingSoftware.licenses || []}
                                rowKey="id"
                                pagination={false}
                                columns={licenseColumns}
                                size="small"
                            />
                        </div>
                    </>
                )}
            </Modal>
        </div >
    );
};

export default Software;
