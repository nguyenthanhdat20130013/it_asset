import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Tabs, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

const Companies = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingCompany, setEditingCompany] = useState(null);

    // Detail Modal (View Only)
    const [viewingCompany, setViewingCompany] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchCompanies(pagination.current, pagination.pageSize);
    }, []);

    const fetchCompanies = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/companies?page=${page}&limit=${limit}`);
            setCompanies(data.data);
            setPagination({
                current: data.page,
                pageSize: data.limit,
                total: data.total
            });
        } catch (error) { message.error('Failed to fetch companies'); }
        finally { setLoading(false); }
    };

    const handleTableChange = (newPagination) => {
        fetchCompanies(newPagination.current, newPagination.pageSize);
    };

    const handleSave = async (values) => {
        try {
            if (editingCompany) {
                await api.put(`/companies/${editingCompany.id}`, values);
                message.success('Company updated');
            } else {
                await api.post('/companies', values);
                message.success('Company created');
            }
            setIsModalOpen(false);
            setEditingCompany(null);
            form.resetFields();
            fetchCompanies();
        } catch (error) { message.error('Operation failed'); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/companies/${id}`);
            message.success('Company deleted');
            fetchCompanies();
        } catch (error) { message.error('Failed to delete'); }
    };

    const handleViewDetails = async (record) => {
        try {
            const { data } = await api.get(`/companies/${record.id}`);
            setViewingCompany(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            message.error('Failed to load company details');
        }
    };

    // Roles
    const isAdmin = user?.role === 'ADMIN';

    const columns = [
        { title: t('tables.code'), dataIndex: 'code', sorter: (a, b) => a.code.localeCompare(b.code) },
        { title: t('tables.name'), dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: t('tables.address'), dataIndex: 'address' },
        { title: t('tables.phone'), dataIndex: 'phone' },
        { title: t('tables.status'), dataIndex: 'status', render: s => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{t(`status.${s}`)}</Tag> },
        ...(isAdmin ? [{
            title: t('tables.actions'),
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Button icon={<EditOutlined />} onClick={() => { setEditingCompany(record); form.setFieldsValue(record); setIsModalOpen(true); }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }] : [])
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                {isAdmin && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCompany(null); form.resetFields(); setIsModalOpen(true); }}>
                        Add Company
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={companies}
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
                title={editingCompany ? "Edit Company" : "Add Company"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="address" label="Address"><Input /></Form.Item>
                    <Form.Item name="phone" label="Phone"><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item>
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
                title="Company Details"
                width={800}
                open={isDetailModalOpen}
                onCancel={() => { setViewingCompany(null); setIsDetailModalOpen(false); }}
                footer={[
                    <Button key="close" onClick={() => { setViewingCompany(null); setIsDetailModalOpen(false); }}>
                        Close
                    </Button>
                ]}
            >
                {viewingCompany && (
                    <>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Code">{viewingCompany.code}</Descriptions.Item>
                            <Descriptions.Item label="Name">{viewingCompany.name}</Descriptions.Item>
                            <Descriptions.Item label="Address">{viewingCompany.address}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{viewingCompany.phone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{viewingCompany.email}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={viewingCompany.status === 'ACTIVE' ? 'green' : 'red'}>{viewingCompany.status}</Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: '1',
                                    label: `Departments (${viewingCompany.departments?.length || 0})`,
                                    children: (
                                        <Table
                                            dataSource={viewingCompany.departments || []}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                            columns={[
                                                { title: t('tables.code'), dataIndex: 'code' },
                                                { title: t('tables.name'), dataIndex: 'name' },
                                                { title: t('tables.status'), dataIndex: 'status', render: s => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{t(`status.${s}`)}</Tag> }
                                            ]}
                                        />
                                    )
                                },
                                {
                                    key: '2',
                                    label: `Employees (${viewingCompany.employees?.length || 0})`,
                                    children: (
                                        <Table
                                            dataSource={viewingCompany.employees || []}
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
                                    key: '3',
                                    label: `Assets (${viewingCompany.assets?.length || 0})`,
                                    children: (
                                        <Table
                                            dataSource={viewingCompany.assets || []}
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

export default Companies;
