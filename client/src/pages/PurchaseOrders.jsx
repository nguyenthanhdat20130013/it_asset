import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Tabs, Row, Col, Card, Statistic, DatePicker, InputNumber, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PieChartOutlined, UnorderedListOutlined, FileExcelOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../api';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const PurchaseOrders = () => {
    const { t } = useTranslation();
    const [pos, setPos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ companyId: undefined, categoryId: undefined, year: dayjs().year() });

    const [isPoModalOpen, setIsPoModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [poForm] = Form.useForm();
    const [catForm] = Form.useForm();
    const [editingPo, setEditingPo] = useState(null);
    const [viewingPo, setViewingPo] = useState(null);
    const [editingCat, setEditingCat] = useState(null);
    const [summary, setSummary] = useState({ total: 0, byCategory: {}, byMonth: {} });

    useEffect(() => {
        fetchInitialData();
        fetchPos();
        fetchSummary();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const [catRes, compRes] = await Promise.all([
                api.get('/purchase-orders/categories'),
                api.get('/companies?limit=100')
            ]);
            setCategories(catRes.data);
            setCompanies(compRes.data.data);
        } catch (error) { message.error('Failed to load initial data'); }
    };

    const fetchPos = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit,
                ...(filters.companyId && { companyId: filters.companyId }),
                ...(filters.categoryId && { categoryId: filters.categoryId }),
                ...(filters.year && { year: filters.year })
            }).toString();
            const { data } = await api.get(`/purchase-orders?${query}`);
            setPos(data.data);
            setPagination({ current: data.page, pageSize: data.limit, total: data.total });
        } catch (error) { message.error('Failed to fetch POs'); }
        finally { setLoading(false); }
    };

    const fetchSummary = async () => {
        try {
            const query = new URLSearchParams({
                ...(filters.companyId && { companyId: filters.companyId }),
                ...(filters.year && { year: filters.year })
            }).toString();
            const { data } = await api.get(`/purchase-orders/summary?${query}`);
            setSummary(data);
        } catch (error) { console.error('Failed to fetch summary'); }
    };

    const handlePoSave = async (values) => {
        try {
            const payload = {
                ...values,
                orderDate: values.orderDate ? values.orderDate.toISOString() : undefined
            };
            if (editingPo) {
                await api.put(`/purchase-orders/${editingPo.id}`, payload);
                message.success('PO updated');
            } else {
                await api.post('/purchase-orders', payload);
                message.success('PO created');
            }
            setIsPoModalOpen(false);
            setEditingPo(null);
            poForm.resetFields();
            fetchPos();
            fetchSummary();
        } catch (error) { message.error(error.response?.data?.error || 'Operation failed'); }
    };

    const handleCatSave = async (values) => {
        try {
            if (editingCat) {
                await api.put(`/purchase-orders/categories/${editingCat.id}`, values);
                message.success('Category updated');
            } else {
                await api.post('/purchase-orders/categories', values);
                message.success('Category created');
            }
            setIsCatModalOpen(false);
            setEditingCat(null);
            catForm.resetFields();
            fetchInitialData();
            fetchSummary();
        } catch (error) { message.error(error.response?.data?.error || 'Failed to save category'); }
    };

    const handleDeleteCat = async (id) => {
        try {
            await api.delete(`/purchase-orders/categories/${id}`);
            message.success('Category deleted');
            fetchInitialData();
            fetchSummary();
        } catch (error) { message.error(error.response?.data?.error || 'Failed to delete category'); }
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                limit: 10000,
                ...(filters.companyId && { companyId: filters.companyId }),
                ...(filters.categoryId && { categoryId: filters.categoryId }),
                ...(filters.year && { year: filters.year })
            }).toString();

            const { data } = await api.get(`/purchase-orders?${query}`);
            const exportData = data.data.map(po => ({
                [t('purchaseOrders.poNumber')]: po.poNumber,
                [t('purchaseOrders.poName')]: po.name,
                [t('tables.company')]: po.company?.name,
                [t('purchaseOrders.categories')]: po.category?.name,
                [t('purchaseOrders.amount')]: po.amount,
                [t('purchaseOrders.currency')]: po.currency,
                [t('purchaseOrders.orderDate')]: dayjs(po.orderDate).format('YYYY-MM-DD'),
                [t('tables.status')]: po.status,
                [t('tables.notes')]: po.description
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "POs");
            XLSX.writeFile(wb, `POs_Report_${dayjs().format('YYYYMMDD')}.xlsx`);
            message.success('Excel file exported');
        } catch (error) {
            message.error('Export failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePo = async (id) => {
        try {
            await api.delete(`/purchase-orders/${id}`);
            message.success('PO deleted');
            fetchPos();
            fetchSummary();
        } catch (error) { message.error('Failed to delete'); }
    };

    const columns = [
        { title: t('purchaseOrders.poNumber'), dataIndex: 'poNumber', key: 'poNumber' },
        { title: t('purchaseOrders.poName'), dataIndex: 'name', key: 'name' },
        { title: t('tables.company'), dataIndex: ['company', 'name'], key: 'company' },
        { title: t('purchaseOrders.categories'), dataIndex: ['category', 'name'], key: 'category' },
        {
            title: t('purchaseOrders.amount'),
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => `${new Intl.NumberFormat('vi-VN').format(val)} VND`
        },
        {
            title: t('purchaseOrders.orderDate'),
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (val) => dayjs(val).format('DD/MM/YYYY')
        },
        {
            title: t('tables.status'),
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={s === 'PAID' ? 'green' : 'orange'}>{s}</Tag>
        },
        {
            title: t('tables.actions'),
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => {
                        setViewingPo(record);
                        setIsDetailModalOpen(true);
                    }} />
                    <Button icon={<EditOutlined />} onClick={() => {
                        setEditingPo(record);
                        poForm.setFieldsValue({
                            ...record,
                            orderDate: dayjs(record.orderDate)
                        });
                        setIsPoModalOpen(true);
                    }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeletePo(record.id)} />
                </Space>
            )
        }
    ];

    const categoryColumns = [
        { title: t('tables.name'), dataIndex: 'name', key: 'name' },
        { title: t('tables.notes'), dataIndex: 'description', key: 'description' },
        {
            title: t('tables.actions'),
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => {
                        setEditingCat(record);
                        catForm.setFieldsValue(record);
                        setIsCatModalOpen(true);
                    }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteCat(record.id)} />
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <Space wrap>
                    <Select
                        placeholder={t('purchaseOrders.allCompanies')}
                        style={{ width: 200 }}
                        allowClear
                        onChange={(val) => setFilters({ ...filters, companyId: val })}
                    >
                        {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                    <Select
                        placeholder={t('purchaseOrders.allCategories')}
                        style={{ width: 150 }}
                        allowClear
                        onChange={(val) => setFilters({ ...filters, categoryId: val })}
                    >
                        {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                    <DatePicker
                        picker="year"
                        value={dayjs().year(filters.year)}
                        onChange={(date) => setFilters({ ...filters, year: date ? date.year() : undefined })}
                    />
                </Space>
                <Space>
                    <Button icon={<FileExcelOutlined />} onClick={handleExport} disabled={pos.length === 0}>
                        {t('purchaseOrders.exportExcel')}
                    </Button>
                    <Button icon={<PlusOutlined />} onClick={() => { setEditingCat(null); catForm.resetFields(); setIsCatModalOpen(true); }}>
                        {t('purchaseOrders.addCategory')}
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPo(null); poForm.resetFields(); setIsPoModalOpen(true); }}>
                        {t('purchaseOrders.addPo')}
                    </Button>
                </Space>
            </div>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: <span><UnorderedListOutlined /> {t('common.purchaseOrders')}</span>,
                    children: (
                        <Table
                            columns={columns}
                            dataSource={pos}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                ...pagination,
                                onChange: (page, pageSize) => fetchPos(page, pageSize)
                            }}
                        />
                    )
                },
                {
                    key: 'cat',
                    label: <span><UnorderedListOutlined /> {t('purchaseOrders.categories')}</span>,
                    children: (
                        <Table
                            columns={categoryColumns}
                            dataSource={categories}
                            rowKey="id"
                            pagination={false}
                        />
                    )
                },
                {
                    key: '2',
                    label: <span><PieChartOutlined /> {t('purchaseOrders.summary')}</span>,
                    children: (
                        <div style={{ padding: '20px 0' }}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Card>
                                        <Statistic
                                            title={t('purchaseOrders.summary')}
                                            value={summary.total}
                                            suffix="VND"
                                            precision={0}
                                            styles={{ content: { color: '#3f8600' } }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={16}>
                                    <Card title={t('purchaseOrders.totalByCategory')}>
                                        <Row gutter={[16, 16]}>
                                            {Object.entries(summary.byCategory).map(([cat, amt]) => (
                                                <Col span={12} key={cat}>
                                                    <Statistic title={cat} value={amt} suffix="VND" />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                            <Card title={t('purchaseOrders.totalByMonth')} style={{ marginTop: 24 }}>
                                <Row gutter={[8, 8]}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <Col span={4} key={m}>
                                            <Statistic
                                                title={`${t('common.month')} ${m}`}
                                                value={summary.byMonth[m] || 0}
                                                styles={{ content: { fontSize: '14px' } }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        </div>
                    )
                }
            ]} />

            <Modal
                title={editingPo ? t('purchaseOrders.editPo') : t('purchaseOrders.addPo')}
                open={isPoModalOpen}
                onCancel={() => setIsPoModalOpen(false)}
                onOk={() => poForm.submit()}
            >
                <Form form={poForm} layout="vertical" onFinish={handlePoSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="poNumber" label={t('purchaseOrders.poNumber')} rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="name" label={t('purchaseOrders.poName')} rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="companyId" label={t('tables.company')} rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="categoryId" label={t('purchaseOrders.categories')} rules={[{ required: true }]}>
                        <Select>
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="amount" label={t('purchaseOrders.amount')} rules={[{ required: true }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="currency" label={t('purchaseOrders.currency')} initialValue="VND"><Input /></Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="orderDate" label={t('purchaseOrders.orderDate')} initialValue={dayjs()}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label={t('tables.status')} initialValue="PAID">
                                <Select>
                                    <Option value="PAID">PAID</Option>
                                    <Option value="PENDING">PENDING</Option>
                                    <Option value="CANCELLED">CANCELLED</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label={t('tables.notes')}><Input.TextArea /></Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingCat ? t('purchaseOrders.editPo').replace('PO', t('purchaseOrders.categories')) : t('purchaseOrders.addCategory')}
                open={isCatModalOpen}
                onCancel={() => { setIsCatModalOpen(false); setEditingCat(null); }}
                onOk={() => catForm.submit()}
            >
                <Form form={catForm} layout="vertical" onFinish={handleCatSave}>
                    <Form.Item name="name" label={t('tables.name')} rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label={t('tables.notes')}><Input.TextArea /></Form.Item>
                </Form>
            </Modal>

            <Modal
                title={t('modals.details').replace('{{name}}', 'PO')}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>{t('common.close')}</Button>
                ]}
                width={700}
            >
                {viewingPo && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label={t('purchaseOrders.poNumber')} span={1}>{viewingPo.poNumber}</Descriptions.Item>
                        <Descriptions.Item label={t('purchaseOrders.poName')} span={1}>{viewingPo.name}</Descriptions.Item>
                        <Descriptions.Item label={t('tables.company')} span={1}>{viewingPo.company?.name}</Descriptions.Item>
                        <Descriptions.Item label={t('purchaseOrders.categories')} span={1}>{viewingPo.category?.name}</Descriptions.Item>
                        <Descriptions.Item label={t('purchaseOrders.amount')} span={1}>{new Intl.NumberFormat('vi-VN').format(viewingPo.amount)} {viewingPo.currency}</Descriptions.Item>
                        <Descriptions.Item label={t('purchaseOrders.orderDate')} span={1}>{dayjs(viewingPo.orderDate).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label={t('tables.status')} span={2}>
                            <Tag color={viewingPo.status === 'PAID' ? 'green' : 'orange'}>{viewingPo.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('tables.notes')} span={2}>{viewingPo.description}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default PurchaseOrders;
