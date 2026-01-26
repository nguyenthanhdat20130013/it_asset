import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag, Tooltip, Checkbox, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DesktopOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { exportToExcel } from '../utils/exportUtils';

const { Option } = Select;

const Employees = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterCompany, setFilterCompany] = useState(null);
    const [filterDepartment, setFilterDepartment] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showHasAssetsOnly, setShowHasAssetsOnly] = useState(false);

    // Modal & Drawer
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [viewingEmployee, setViewingEmployee] = useState(null); // Separate state for drawer viewing? Or reuse editingEmployee
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const [c, d] = await Promise.all([
                api.get('/companies'),
                api.get('/departments')
            ]);
            setCompanies(c.data);
            setDepartments(d.data);
        } catch (error) {
            message.error('Failed to load companies/departments');
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterCompany) params.companyId = filterCompany;
            if (filterDepartment) params.departmentId = filterDepartment;
            if (searchText) params.search = searchText;
            // Client-side filtering for assets might be easier if backend doesn't support filtering by relation count yet
            // Or we handle it after fetch if the dataset is small.
            // Let's modify the fetch to handle it or filter setEmployees(data)

            const { data } = await api.get('/employees', { params });
            let filteredData = data;
            if (showHasAssetsOnly) {
                filteredData = data.filter(e => e._count?.currentAssets > 0);
            }
            setEmployees(filteredData);
        } catch (error) {
            message.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEmployees();
        }, 300);
        return () => clearTimeout(timer);
    }, [filterCompany, filterDepartment, searchText, showHasAssetsOnly]);

    useEffect(() => {
        if (editingEmployee && isModalOpen) {
            form.setFieldsValue({
                ...editingEmployee,
                joinDate: editingEmployee.joinDate ? dayjs(editingEmployee.joinDate) : null,
            });
        }
    }, [editingEmployee, isModalOpen, form]);

    const handleEdit = (record) => {
        setEditingEmployee(record);
        setIsModalOpen(true);
    };

    const handleViewAssets = async (record) => {
        try {
            const { data } = await api.get(`/employees/${record.id}`);
            setEditingEmployee(data); // Using editingEmployee to store full details for detail modal
            setIsDetailModalOpen(true);
        } catch (error) {
            message.error('Failed to load employee details');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: t('tables.confirmDelete'),
            onOk: async () => {
                try {
                    await api.delete(`/employees/${id}`);
                    message.success('Employee deleted');
                    fetchEmployees();
                } catch (error) {
                    message.error('Failed to delete employee');
                }
            }
        });
    };

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                joinDate: values.joinDate ? values.joinDate.toISOString() : null,
            };

            if (editingEmployee) {
                await api.put(`/employees/${editingEmployee.id}`, payload);
                message.success('Employee updated');
            } else {
                await api.post('/employees', payload);
                message.success('Employee created');
            }
            setIsModalOpen(false);
            setEditingEmployee(null);
            form.resetFields();
            fetchEmployees();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    // Roles
    const isAdmin = user?.role === 'ADMIN';

    const columns = [
        {
            title: t('tables.code'),
            dataIndex: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: t('tables.name'),
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: t('tables.email'),
            dataIndex: 'email',
        },
        {
            title: t('tables.company'),
            render: (r) => r.company?.name,
            filters: companies.map(c => ({ text: c.name, value: c.id })),
            onFilter: (value, record) => record.companyId === value,
        },
        {
            title: t('tables.department'),
            render: (r) => r.department?.name,
        },
        {
            title: t('tables.position'),
            dataIndex: 'jobTitle',
        },
        {
            title: t('tables.status'),
            dataIndex: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'RESIGNED') color = 'red';
                if (status === 'ON_LEAVE') color = 'orange';
                return <Tag color={color}>{t(`status.${status}`)}</Tag>
            }
        },
        {
            title: t('tables.assets'),
            render: (_, record) => (
                <Tag color="cyan" style={{ cursor: 'pointer' }} onClick={() => handleViewAssets(record)}>
                    <DesktopOutlined /> {record._count?.currentAssets || 0}
                </Tag>
            )
        },
        ...(isAdmin ? [{
            title: t('tables.actions'),
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }] : [])
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Input.Search
                        placeholder="Search employees..."
                        allowClear
                        onSearch={val => setSearchText(val)}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Filter Company"
                        style={{ width: 200 }}
                        allowClear
                        onChange={setFilterCompany}
                    >
                        {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                    <Select
                        placeholder="Filter Department"
                        style={{ width: 200 }}
                        allowClear
                        onChange={setFilterDepartment}
                    >
                        {departments
                            .filter(d => !filterCompany || d.companyId === filterCompany)
                            .map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                    </Select>
                    <Checkbox checked={showHasAssetsOnly} onChange={e => setShowHasAssetsOnly(e.target.checked)}>
                        Has Assets Only
                    </Checkbox>
                </Space>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={() => exportToExcel(employees, 'Employees')}>
                        Export
                    </Button>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingEmployee(null); form.resetFields(); setIsModalOpen(true); }}>
                            Add Employee
                        </Button>
                    )}
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={employees}
                rowKey="id"
                loading={loading}
                onRow={(record) => ({
                    onClick: () => handleViewAssets(record),
                    style: { cursor: 'pointer' }
                })}
            />

            {/* Asset Detail Drawer */}
            {/* Asset Detail Modal */}
            <Modal
                title="Employee Details"
                width={800}
                onCancel={() => { setEditingEmployee(null); setIsDetailModalOpen(false); }}
                open={isDetailModalOpen}
                footer={[
                    <Button key="close" onClick={() => { setEditingEmployee(null); setIsDetailModalOpen(false); }}>
                        Close
                    </Button>
                ]}
            >
                {editingEmployee && (
                    <>
                        <Descriptions title="Personal & Work Info" bordered column={2} size="small">
                            <Descriptions.Item label={t('tables.name')}>{editingEmployee.name}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.code')}>{editingEmployee.code}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.email')}>{editingEmployee.email}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.position')}>{editingEmployee.jobTitle || '-'}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.company')}>{editingEmployee.company?.name}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.department')}>{editingEmployee.department?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.purchased')}>{editingEmployee.joinDate ? dayjs(editingEmployee.joinDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={editingEmployee.status === 'ACTIVE' ? 'green' : 'red'}>{editingEmployee.status}</Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h3>Assigned Assets ({editingEmployee.currentAssets?.length || 0})</h3>
                            {editingEmployee.currentAssets?.length > 0 ? (
                                <Table
                                    dataSource={editingEmployee.currentAssets}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        { title: t('tables.tag'), dataIndex: 'tag' },
                                        { title: t('tables.name'), dataIndex: 'name' },
                                        { title: t('tables.type'), render: (_, r) => r.deviceType?.name || r.type || 'Unknown' },
                                        { title: t('tables.serial'), dataIndex: 'serialNumber' },
                                        { title: t('tables.dateAssigned'), render: (_, r) => r.assignedDate ? dayjs(r.assignedDate).format('DD/MM/YYYY') : '-' }
                                    ]}
                                />
                            ) : <p>No assets assigned.</p>}
                        </div>
                    </>
                )}
            </Modal>

            <Modal
                title={editingEmployee ? "Edit Employee" : "Add Employee"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
                        <Select onChange={() => form.setFieldValue('departmentId', null)}>
                            {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.companyId !== currentValues.companyId}
                    >
                        {({ getFieldValue }) => (
                            <Form.Item name="departmentId" label="Department">
                                <Select disabled={!getFieldValue('companyId')}>
                                    {departments
                                        .filter(d => d.companyId === getFieldValue('companyId'))
                                        .map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                                </Select>
                            </Form.Item>
                        )}
                    </Form.Item>
                    <Form.Item name="code" label="Employee Code" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                    <Form.Item name="jobTitle" label="Position"><Input /></Form.Item>
                    <Form.Item name="joinDate" label="Join Date"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                    <Form.Item name="status" label="Status" initialValue="ACTIVE">
                        <Select>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="RESIGNED">Resigned</Option>
                            <Option value="ON_LEAVE">On Leave</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Employees;
