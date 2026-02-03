import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../api';
import SimDetailModal from '../components/SimDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { exportToExcel } from '../utils/exportUtils';

const { Option } = Select;

const Sims = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [sims, setSims] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSim, setEditingSim] = useState(null);
    const [selectedSim, setSelectedSim] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [filterCompany, setFilterCompany] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchSims();
    }, [filterCompany]);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/companies');
            setCompanies(data);
        } catch (error) { message.error('Failed to load companies'); }
    };

    const fetchSims = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterCompany) params.companyId = filterCompany;
            const { data } = await api.get('/sims', { params });
            setSims(data);
        } catch (error) { message.error('Failed to fetch SIMs'); }
        finally { setLoading(false); }
    };

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                registrationDate: values.registrationDate ? values.registrationDate.toISOString() : null,
                activationDate: values.activationDate ? values.activationDate.toISOString() : null,
                expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
            };

            if (editingSim) {
                await api.put(`/sims/${editingSim.id}`, payload);
                message.success('SIM updated');
            } else {
                await api.post('/sims', payload);
                message.success('SIM created');
            }
            setIsModalOpen(false);
            setEditingSim(null);
            form.resetFields();
            fetchSims();
        } catch (error) { message.error('Operation failed'); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/sims/${id}`);
            message.success('SIM deleted');
            fetchSims();
        } catch (error) { message.error('Failed to delete'); }
    };

    // Roles
    const canManage = user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT';

    const columns = [
        { title: t('tables.number'), dataIndex: 'number', sorter: (a, b) => a.number.localeCompare(b.number) },
        { title: t('tables.carrier'), dataIndex: 'carrier' },
        { title: t('tables.plan'), dataIndex: 'plan' },
        { title: t('tables.company'), render: (r) => r.company?.name },
        { title: t('tables.regDate'), dataIndex: 'registrationDate', render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
        { title: t('tables.expiry'), dataIndex: 'expiryDate', render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
        { title: t('tables.status'), dataIndex: 'status', render: (s) => <Tag color={s === 'ACTIVE' ? 'green' : (s === 'EXPIRED' ? 'red' : 'orange')}>{t(`status.${s}`)}</Tag> },
        ...(canManage ? [{
            title: t('tables.actions'),
            render: (_, record) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Button icon={<EditOutlined />} onClick={() => {
                        setEditingSim(record);
                        form.setFieldsValue({
                            ...record,
                            registrationDate: record.registrationDate ? dayjs(record.registrationDate) : null,
                            activationDate: record.activationDate ? dayjs(record.activationDate) : null,
                            expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
                        });
                        setIsModalOpen(true);
                    }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }] : [])
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Select
                        placeholder="Filter Company"
                        style={{ width: 180 }}
                        allowClear
                        onChange={setFilterCompany}
                    >
                        {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                </Space>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={() => exportToExcel(sims, 'SIMs')}>
                        Export
                    </Button>
                    {canManage && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSim(null); form.resetFields(); setIsModalOpen(true); }}>
                            Add SIM Card
                        </Button>
                    )}
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={sims}
                rowKey="id"
                loading={loading}
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedSim(record);
                        setIsDetailModalOpen(true);
                    },
                    style: { cursor: 'pointer' }
                })}
            />

            <SimDetailModal
                visible={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                sim={selectedSim}
            />

            <Modal
                title={editingSim ? "Edit SIM" : "Add SIM"}
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
                    <Form.Item name="number" label="Phone Number" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="carrier" label="Carrier"><Input /></Form.Item>
                    <Form.Item name="plan" label="Plan"><Input /></Form.Item>
                    <Form.Item name="registrationDate" label="Registration Date"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                    <Form.Item name="activationDate" label="Activation Date"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                    <Form.Item name="expiryDate" label="Expiry Date"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                    <Form.Item name="status" label="Status" initialValue="ACTIVE">
                        <Select>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="SUSPENDED">Suspended</Option>
                            <Option value="EXPIRED">Expired</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Sims;
