import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Tabs, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

const Departments = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [form] = Form.useForm();
    const [filterCompany, setFilterCompany] = useState(null);

    // Detail Modal (View Only)
    const [viewingDept, setViewingDept] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        fetchDepartments(1, pagination.pageSize);
    }, [filterCompany]);

    const fetchCompanies = async () => {
        try {
            const { data } = await api.get('/companies', { params: { limit: 1000 } });
            setCompanies(data.data);
        } catch (error) { message.error('Failed to load companies'); }
    };

    const fetchDepartments = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (filterCompany) params.companyId = filterCompany;
            const { data } = await api.get('/departments', { params });
            setDepartments(data.data);
            setPagination({
                current: data.page,
                pageSize: data.limit,
                total: data.total
            });
        } catch (error) { message.error('Failed to fetch departments'); }
        finally { setLoading(false); }
    };

    const handleTableChange = (newPagination) => {
        fetchDepartments(newPagination.current, newPagination.pageSize);
    };

    const handleSave = async (values) => {
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, values);
                message.success('Department updated');
            } else {
                await api.post('/departments', values);
                message.success('Department created');
            }
            setIsModalOpen(false);
            setEditingDept(null);
            form.resetFields();
            fetchDepartments();
        } catch (error) { message.error('Operation failed'); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/departments/${id}`);
            message.success('Department deleted');
            fetchDepartments();
        } catch (error) { message.error('Failed to delete'); }
    };

    const handleViewDetails = async (record) => {
        try {
            const { data } = await api.get(`/departments/${record.id}`);
            setViewingDept(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            message.error('Failed to load department details');
        }
    };

    // Roles
    const isAdmin = user?.role === 'ADMIN';

    const columns = [
        { title: t('tables.code'), dataIndex: 'code', sorter: (a, b) => a.code.localeCompare(b.code) },
        { title: t('tables.name'), dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: t('tables.company'), render: (r) => r.company?.name },
        { title: t('tables.status'), dataIndex: 'status', render: s => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{t(`status.${s}`)}</Tag> },
        ...(isAdmin ? [{
            title: t('tables.actions'),
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Button icon={<EditOutlined />} onClick={() => { setEditingDept(record); form.setFieldsValue(record); setIsModalOpen(true); }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }] : [])
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Select
                    placeholder="Filter by Company"
                    style={{ width: 200 }}
                    allowClear
                    onChange={setFilterCompany}
                >
                    {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
                {isAdmin && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDept(null); form.resetFields(); setIsModalOpen(true); }}>
                        Add Department
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={departments}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => t('tables.totalItems', { total })
                }}
                onChange={handleTableChange}
                onRow={(record) => ({
                    onClick: () => handleViewDetails(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <Modal
                title={editingDept ? "Edit Department" : "Add Department"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
                        <Select>
                            {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="status" label="Status" initialValue="ACTIVE">
                        <Select>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Department Details"
                width={800}
                open={isDetailModalOpen}
                onCancel={() => { setViewingDept(null); setIsDetailModalOpen(false); }}
                footer={[
                    <Button key="close" onClick={() => { setViewingDept(null); setIsDetailModalOpen(false); }}>
                        Close
                    </Button>
                ]}
            >
                {viewingDept && (
                    <>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label={t('tables.code')}>{viewingDept.code}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.name')}>{viewingDept.name}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.company')}>{viewingDept.company?.name}</Descriptions.Item>
                            <Descriptions.Item label={t('tables.status')}>
                                <Tag color={viewingDept.status === 'ACTIVE' ? 'green' : 'red'}>{t(`status.${viewingDept.status}`)}</Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: '1',
                                    label: `Employees (${viewingDept.employees?.length || 0})`,
                                    children: (
                                        <Table
                                            dataSource={viewingDept.employees || []}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                            columns={[
                                                { title: t('tables.code'), dataIndex: 'code' },
                                                { title: t('tables.name'), dataIndex: 'name' },
                                                { title: t('tables.email'), dataIndex: 'email' }
                                            ]}
                                        />
                                    )
                                },
                                {
                                    key: '2',
                                    label: `Assets (${viewingDept.assets?.length || 0})`,
                                    children: (
                                        <Table
                                            dataSource={viewingDept.assets || []}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                            columns={[
                                                { title: t('tables.tag'), dataIndex: 'tag' },
                                                { title: t('tables.name'), dataIndex: 'name' },
                                                { title: t('tables.status'), dataIndex: 'status', render: s => t(`status.${s}`) || s }
                                            ]}
                                        />
                                    )
                                }
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div >
    );
};

export default Departments;
