import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Select, message, Tag, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Users = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const { user: me } = useAuth();

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize);
    }, []);

    const fetchUsers = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users?page=${page}&limit=${limit}`);
            setUsers(data.data);
            setPagination({
                current: data.page,
                pageSize: data.limit,
                total: data.total
            });
        } catch (error) {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        fetchUsers(newPagination.current, newPagination.pageSize);
    };

    const handleEditRole = (user) => {
        setCurrentUser(user);
        setSelectedRole(user.role);
        setIsRoleModalVisible(true);
    };

    const handleRoleUpdate = async () => {
        try {
            await api.put(`/users/${currentUser.id}/role`, { role: selectedRole });
            message.success('User role updated');
            setIsRoleModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error('Failed to update role');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            message.success('User deleted');
            fetchUsers();
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const columns = [
        {
            title: t('tables.username'),
            dataIndex: 'username',
            key: 'username',
            render: (text) => <span><UserOutlined /> {text}</span>
        },
        {
            title: t('tables.role'),
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'gold';
                if (role === 'IT_SUPPORT') color = 'blue';
                if (role === 'VIEWER') color = 'green';
                if (role === 'EMPLOYEE') color = 'default';
                return <Tag color={color}>{t(`common.role.${role}`)}</Tag>;
            }
        },
        {
            title: t('tables.employee'),
            key: 'employee',
            render: (_, record) => record.employee?.name || '-'
        },
        {
            title: t('tables.company'),
            key: 'company',
            render: (_, record) => record.company?.name || '-'
        },
        {
            title: t('tables.actions'),
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditRole(record)}
                        disabled={record.id === me?.id}
                    >
                        {t('users.editRole')}
                    </Button>
                    <Popconfirm
                        title={t('tables.confirmDelete')}
                        onConfirm={() => handleDeleteUser(record.id)}
                        disabled={record.id === me?.id}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.id === me?.id}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '24px' }}>{t('users.title')}</h2>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => t('tables.totalItems', { total })
                }}
                onChange={handleTableChange}
                className="premium-card"
                style={{ borderRadius: '12px', overflow: 'hidden' }}
            />

            <Modal
                title={`${t('users.changeRoleFor')} ${currentUser?.username}`}
                open={isRoleModalVisible}
                onOk={handleRoleUpdate}
                onCancel={() => setIsRoleModalVisible(false)}
                okText={t('users.update')}
                cancelText={t('users.cancel')}
            >
                <div style={{ padding: '20px 0' }}>
                    <p>{t('users.selectNewRole')}</p>
                    <Select
                        style={{ width: '100%' }}
                        value={selectedRole}
                        onChange={(value) => setSelectedRole(value)}
                    >
                        {['ADMIN', 'IT_SUPPORT', 'VIEWER', 'EMPLOYEE'].map((key) => (
                            <Select.Option key={key} value={key}>{t(`common.role.${key}`)}</Select.Option>
                        ))}
                    </Select>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
