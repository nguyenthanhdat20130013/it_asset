import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, Tag, Button, Modal, Form, Input, DatePicker, Select, Space, Typography, message, Badge, Drawer, Descriptions, Table, Pagination } from 'antd';
import { PlusOutlined, CalendarOutlined, PushpinOutlined, VideoCameraOutlined, WifiOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUSES = {
    UPCOMING: { title: 'Sắp triển khai', color: 'blue' },
    PREPARING: { title: 'Đang chuẩn bị', color: 'orange' },
    DELIVERED: { title: 'Đã giao', color: 'cyan' },
    INSTALLED: { title: 'Đã lắp đặt và chạy', color: 'green' },
    RETURN_WAITING: { title: 'Chờ gửi về', color: 'purple' },
    COMPLETED: { title: 'Hoàn thành', color: 'default' }
};

const Projects = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [assets, setAssets] = useState([]);
    const [sims, setSims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterCompany, setFilterCompany] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 }); // Higher default for Kanban

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [assignAssetModal, setAssignAssetModal] = useState(null); // projectId
    const [assignSimModal, setAssignSimModal] = useState(null); // projectId
    const [viewingProject, setViewingProject] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [form] = Form.useForm();
    const [assetForm] = Form.useForm();
    const [simForm] = Form.useForm();

    useEffect(() => {
        fetchInitialData();
        fetchProjects(1, pagination.pageSize);
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data } = await api.get('/companies');
            setCompanies(data.data || data);
            fetchAssets();
            fetchSims();
        } catch (error) {
            message.error('Failed to load companies');
        }
    };

    const fetchAssets = async () => {
        try {
            const { data } = await api.get('/assets');
            setAssets(data.data || data);
        } catch (error) {
            console.error('Failed to load assets');
        }
    };

    const fetchSims = async () => {
        try {
            const { data } = await api.get('/sims');
            setSims(data.data || data);
        } catch (error) {
            console.error('Failed to load sims');
        }
    };

    useEffect(() => {
        fetchProjects(1, pagination.pageSize);
    }, [filterCompany]); // Reload when filter changes

    const fetchProjects = async (page = 1, limit = 20) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (filterCompany) params.companyId = filterCompany;
            const { data } = await api.get('/projects', { params });
            setProjects(data.data);
            setPagination({
                current: data.page,
                pageSize: data.limit,
                total: data.total
            });
        } catch (error) {
            message.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page, pageSize) => {
        fetchProjects(page, pageSize);
    };

    // Roles
    const canManage = user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT';

    const onDragEnd = async (result) => {
        if (!canManage) return; // Prevention
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const newStatus = destination.droppableId;
            // Optimistic update
            const updatedProjects = projects.map(p =>
                p.id === draggableId ? { ...p, status: newStatus } : p
            );
            setProjects(updatedProjects);

            try {
                await api.put(`/projects/${draggableId}`, { status: newStatus });
                message.success('Status updated');
            } catch (error) {
                message.error('Failed to update status');
                fetchProjects(); // Revert
            }
        }
    };

    const handleCreateEdit = async (values) => {
        try {
            const payload = {
                ...values,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                endDate: values.endDate ? values.endDate.toISOString() : null,
            };

            if (editingProject) {
                await api.put(`/projects/${editingProject.id}`, payload);
                message.success('Project updated');
            } else {
                await api.post('/projects', payload);
                message.success('Project created');
            }
            setIsModalOpen(false);
            setEditingProject(null);
            form.resetFields();
            fetchProjects();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: t('tables.confirmDelete'),
            content: 'This will remove the project.',
            onOk: async () => {
                try {
                    await api.delete(`/projects/${id}`);
                    message.success('Project deleted');
                    fetchProjects();
                } catch (error) {
                    message.error('Failed to delete');
                }
            }
        });
    };

    const handleAssignAsset = async (values) => {
        try {
            await api.post(`/projects/${assignAssetModal}/assets`, values);
            message.success('Asset assigned');
            setAssignAssetModal(null);
            assetForm.resetFields();
            fetchProjects();
            fetchAssets();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to assign asset');
        }
    };

    const handleAssignSim = async (values) => {
        try {
            await api.post(`/projects/${assignSimModal}/sims`, values);
            message.success('SIM assigned');
            setAssignSimModal(null);
            simForm.resetFields();
            fetchProjects();
            fetchSims();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to assign SIM');
        }
    };

    // Columns Logic
    const columns = Object.keys(STATUSES).map(status => ({
        id: status,
        title: t(`status.${status}`),
        color: STATUSES[status].color,
        items: projects.filter(p => p.status === status)
    }));

    return (
        <div style={{
            height: 'calc(100vh - 140px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>Quản lý dự án lắp Camera</Title>
                    <Pagination
                        size="small"
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePageChange}
                        showSizeChanger
                    />
                </div>
                <Space>
                    <Select
                        placeholder="Lọc theo công ty"
                        style={{ width: 200 }}
                        allowClear
                        onChange={setFilterCompany}
                    >
                        {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                    {canManage && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProject(null); form.resetFields(); setIsModalOpen(true); }}>
                            Thêm Dự Án
                        </Button>
                    )}
                </Space>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 16,
                    flex: 1,
                    paddingBottom: 16,
                    alignItems: 'flex-start'
                }}>
                    {columns.map(column => (
                        <div key={column.id} style={{
                            minWidth: 300,
                            width: 300,
                            background: '#f0f2f5',
                            borderRadius: 8,
                            padding: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '100%'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 10, display: 'flex', justifyContent: 'space-between', color: '#1890ff' }}>
                                {column.title}
                                <Badge count={column.items.length} showZero color={column.color} />
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{ flex: 1, overflowY: 'auto', minHeight: 100 }}
                                    >
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {... (canManage ? provided.dragHandleProps : {})}
                                                        style={{
                                                            userSelect: 'none',
                                                            marginBottom: 8,
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <Card
                                                            size="small"
                                                            hoverable
                                                            actions={canManage ? [
                                                                <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); setEditingProject(item); form.setFieldsValue({ ...item, startDate: item.startDate ? dayjs(item.startDate) : null, endDate: item.endDate ? dayjs(item.endDate) : null }); setIsModalOpen(true); }} />,
                                                                <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} />
                                                            ] : []}
                                                            onClick={() => { setViewingProject(item); setIsDetailModalOpen(true); }}
                                                        >
                                                            <div style={{ fontWeight: 600 }}>{item.code}</div>
                                                            <div style={{ marginBottom: 5 }}>{item.name}</div>
                                                            <div style={{ fontSize: 12, color: '#888' }}>
                                                                {item.company?.name}
                                                            </div>
                                                            {item.description && <div style={{ fontSize: 12, fontStyle: 'italic', marginBottom: 5 }}>{item.description}</div>}

                                                            <div style={{ marginTop: 8 }}>
                                                                <Text strong style={{ fontSize: 12 }}>Camera:</Text>
                                                                {item.assets && item.assets.length > 0 ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                        {item.assets.map(a => (
                                                                            <Tag key={a.id} icon={<VideoCameraOutlined />} color="blue" closable={canManage} onClose={async (e) => { e.preventDefault(); await api.delete(`/projects/${item.id}/assets/${a.id}`); fetchProjects(); fetchAssets(); }}>
                                                                                {a.name}
                                                                            </Tag>
                                                                        ))}
                                                                    </div>
                                                                ) : <div style={{ fontSize: 11, color: '#ccc' }}>Trống</div>}
                                                                {canManage && <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setAssignAssetModal(item.id); }} style={{ padding: 0 }}>+ Gán Camera</Button>}
                                                            </div>

                                                            <div style={{ marginTop: 8 }}>
                                                                <Text strong style={{ fontSize: 12 }}>SIM:</Text>
                                                                {item.sims && item.sims.length > 0 ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                        {item.sims.map(s => (
                                                                            <Tag key={s.id} icon={<WifiOutlined />} color="green" closable={canManage} onClose={async (e) => { e.preventDefault(); await api.delete(`/projects/${item.id}/sims/${s.id}`); fetchProjects(); fetchSims(); }}>
                                                                                {s.number}
                                                                            </Tag>
                                                                        ))}
                                                                    </div>
                                                                ) : <div style={{ fontSize: 11, color: '#ccc' }}>Trống</div>}
                                                                {canManage && <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setAssignSimModal(item.id); }} style={{ padding: 0 }}>+ Gán SIM</Button>}
                                                            </div>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Create/Edit Modal */}
            <Modal
                title={editingProject ? "Sửa Dự Án" : "Thêm Dự Án"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateEdit}>
                    <Form.Item name="companyId" label="Công ty" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {companies.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="code" label="Mã dự án" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="name" label="Tên dự án" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="startDate" label="Ngày bắt đầu">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="endDate" label="Ngày kết thúc">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Assign Asset Modal */}
            <Modal
                title="Gán Camera/Thiết bị"
                open={!!assignAssetModal}
                onCancel={() => setAssignAssetModal(null)}
                onOk={() => assetForm.submit()}
            >
                <Form form={assetForm} layout="vertical" onFinish={handleAssignAsset}>
                    <Form.Item name="assetId" label="Chọn thiết bị" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {assets
                                .filter(a => !a.projectId || a.projectId === assignAssetModal) // Show unassigned or assigned to this
                                .map(a => (
                                    <Option key={a.id} value={a.id}>
                                        {a.name} ({a.tag}) {a.status === 'IN_USE' ? '(In Use)' : ''}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Assign SIM Modal */}
            <Modal
                title="Gán SIM"
                open={!!assignSimModal}
                onCancel={() => setAssignSimModal(null)}
                onOk={() => simForm.submit()}
            >
                <Form form={simForm} layout="vertical" onFinish={handleAssignSim}>
                    <Form.Item name="simId" label="Chọn SIM" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {sims
                                .filter(s => !s.projectId || s.projectId === assignSimModal)
                                .map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {s.number} {s.status === 'ACTIVE' ? '(Active)' : ''}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết dự án"
                width={800}
                open={isDetailModalOpen}
                onCancel={() => { setViewingProject(null); setIsDetailModalOpen(false); }}
                footer={[
                    <Button key="close" onClick={() => { setViewingProject(null); setIsDetailModalOpen(false); }}>
                        Close
                    </Button>
                ]}
            >
                {viewingProject && (
                    <>
                        <Descriptions title="Thông tin chung" bordered column={1} size="small">
                            <Descriptions.Item label="Mã dự án">{viewingProject.code}</Descriptions.Item>
                            <Descriptions.Item label="Tên dự án">{viewingProject.name}</Descriptions.Item>
                            <Descriptions.Item label="Công ty">{viewingProject.company?.name}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={STATUSES[viewingProject.status]?.color}>{STATUSES[viewingProject.status]?.title}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bắt đầu">{viewingProject.startDate ? dayjs(viewingProject.startDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">{viewingProject.endDate ? dayjs(viewingProject.endDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Mô tả">{viewingProject.description}</Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h4>Thiết bị / Camera ({viewingProject.assets?.length || 0})</h4>
                            {viewingProject.assets?.length > 0 ? (
                                <Table
                                    dataSource={viewingProject.assets}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        { title: t('tables.name'), dataIndex: 'name' },
                                        { title: t('tables.tag'), dataIndex: 'tag' },
                                        { title: t('tables.status'), dataIndex: 'status', render: s => t(`status.${s}`) || s }
                                    ]}
                                />
                            ) : <Text type="secondary">Chưa có thiết bị</Text>}
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <h4>SIM ({viewingProject.sims?.length || 0})</h4>
                            {viewingProject.sims?.length > 0 ? (
                                <Table
                                    dataSource={viewingProject.sims}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        { title: t('tables.number'), dataIndex: 'number' },
                                        { title: t('tables.carrier'), dataIndex: 'carrier' },
                                        { title: t('tables.status'), dataIndex: 'status', render: s => t(`status.${s}`) || s }
                                    ]}
                                />
                            ) : <Text type="secondary">Chưa có SIM</Text>}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Projects;
