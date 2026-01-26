import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const DeviceTypes = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [types, setTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const { data } = await api.get('/device-types');
            setTypes(data);
        } catch (error) {
            message.error('Failed to load device types');
        }
    };

    const handleCreate = async (values) => {
        try {
            // Schema is array of objects { key, label }
            const schema = values.fields || [];
            await api.post('/device-types', {
                name: values.name,
                schema: schema
            });
            message.success('Device Type created');
            setIsModalOpen(false);
            form.resetFields();
            fetchTypes();
        } catch (error) {
            message.error('Failed to create device type');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/device-types/${id}`);
            fetchTypes();
        } catch (error) { message.error('Failed'); }
    };

    // Roles
    const isAdmin = user?.role === 'ADMIN';

    const columns = [
        { title: t('tables.name'), dataIndex: 'name' },
        {
            title: t('tables.fields'),
            dataIndex: 'schema',
            render: (schema) => {
                const fields = Array.isArray(schema) ? schema : [];
                return fields.map(f => f.label).join(', ');
            }
        },
        ...(isAdmin ? [{
            title: t('tables.actions'),
            render: (_, record) => <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        }] : [])
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                {isAdmin && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Add Device Type
                    </Button>
                )}
            </div>

            <Table columns={columns} dataSource={types} rowKey="id" />

            <Modal
                title="Create Device Type"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="name" label="Type Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Laptop, Printer" />
                    </Form.Item>

                    <Form.List name="fields">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'key']}
                                            rules={[{ required: true, message: 'Missing key' }]}
                                        >
                                            <Input placeholder="Field Key (e.g. cpu)" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'label']}
                                            rules={[{ required: true, message: 'Missing label' }]}
                                        >
                                            <Input placeholder="Label (e.g. CPU Model)" />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Custom Field
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default DeviceTypes;
