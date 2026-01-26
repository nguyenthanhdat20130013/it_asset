import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Modal, Form, Input, Select, DatePicker, List, Checkbox, Card, Row, Col, Tabs, Button, message, Space, Typography, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../api';
import dayjs from 'dayjs';
import LoadingSpinner from '../components/LoadingSpinner';

const { Option } = Select;
const { Text } = Typography;

const CalendarPage = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [loading, setLoading] = useState(false);

    // Forms
    const [eventForm] = Form.useForm();
    const [taskForm] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [e, t] = await Promise.all([
                api.get('/events'),
                api.get('/tasks')
            ]);
            setEvents(e.data);
            setTasks(t.data);
        } catch (error) {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvent = async (values) => {
        try {
            const payload = {
                ...values,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate ? values.endDate.toISOString() : null,
            };

            if (editingEvent) {
                await api.put(`/events/${editingEvent.id}`, payload);
                message.success('Event updated');
            } else {
                await api.post('/events', payload);
                message.success('Event created');
            }

            setIsEventModalOpen(false);
            setEditingEvent(null);
            eventForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('Failed to save event: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleTaskCreate = async (values) => {
        try {
            await api.post('/tasks', {
                ...values,
                dueDate: values.dueDate ? values.dueDate.toISOString() : null
            });
            message.success('Task created');
            setIsTaskModalOpen(false);
            taskForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('Failed to create task: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await api.delete(`/events/${id}`);
            fetchData();
        } catch (error) { message.error('Failed'); }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchData();
        } catch (error) { message.error('Failed'); }
    };

    const toggleTaskStatus = async (task) => {
        try {
            const newStatus = task.status === 'DONE' ? 'PENDING' : 'DONE';
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            fetchData();
        } catch (error) { message.error('Failed'); }
    };

    const onSelect = (newValue) => {
        setSelectedDate(newValue);
        // Optional: Open modal or filter list based on date
    };

    // Calendar Renderers
    const cellRender = (value, info) => {
        if (info.type === 'date') {
            const listData = events.filter(ev => dayjs(ev.startDate).isSame(value, 'day'));
            return (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {listData.map((item) => (
                        <li key={item.id} onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(item);
                            eventForm.setFieldsValue({
                                ...item,
                                startDate: dayjs(item.startDate),
                                endDate: item.endDate ? dayjs(item.endDate) : null
                            });
                            setIsEventModalOpen(true);
                        }} style={{ cursor: 'pointer', padding: '2px 0' }}>
                            <Badge
                                color={item.type === 'MAINTENANCE' ? 'red' : item.type === 'ONBOARDING' ? 'blue' : 'green'}
                                text={<span style={{ fontSize: '12px' }}>{item.title}</span>}
                            />
                        </li>
                    ))}
                </ul>
            );
        }
        return info.originNode;
    };

    const getUpcomingEvents = () => {
        return events
            .filter(e => dayjs(e.startDate).isAfter(dayjs().subtract(1, 'day')))
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 10);
    };

    return (
        <div className="layout-padding">
            {loading && <LoadingSpinner fullPage />}
            <Row gutter={16}>
                <Col span={16}>
                    <Card className="premium-card" style={{ borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Typography.Title level={4} style={{ margin: 0 }}>Calendar View</Typography.Title>
                            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => {
                                setEditingEvent(null);
                                eventForm.resetFields();
                                eventForm.setFieldsValue({ startDate: selectedDate });
                                setIsEventModalOpen(true);
                            }} style={{ borderRadius: '8px' }}>
                                Add Event
                            </Button>
                        </div>
                        <Calendar cellRender={cellRender} onSelect={onSelect} style={{ padding: '8px' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Tabs defaultActiveKey="1" items={[
                            {
                                key: '1',
                                label: <span style={{ padding: '0 12px', fontWeight: 600 }}>Agenda</span>,
                                children: (
                                    <List
                                        dataSource={getUpcomingEvents()}
                                        renderItem={item => (
                                            <List.Item
                                                style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', transition: 'all 0.3s' }}
                                                className="hover-bg-gray"
                                                actions={[
                                                    <Button size="small" type="link" style={{ padding: 0 }} onClick={() => {
                                                        setEditingEvent(item);
                                                        eventForm.setFieldsValue({
                                                            ...item,
                                                            startDate: dayjs(item.startDate),
                                                            endDate: item.endDate ? dayjs(item.endDate) : null
                                                        });
                                                        setIsEventModalOpen(true);
                                                    }}>Edit</Button>,
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => handleDeleteEvent(item.id)}
                                                    />
                                                ]}>
                                                <List.Item.Meta
                                                    title={<Text strong style={{ fontSize: '15px' }}>{item.title}</Text>}
                                                    description={
                                                        <div style={{ marginTop: '4px' }}>
                                                            <div style={{ color: '#8c8c8c', fontSize: '13px', marginBottom: '8px' }}>
                                                                {dayjs(item.startDate).format('DD/MM/YYYY HH:mm')}
                                                            </div>
                                                            <Tag color={item.type === 'MAINTENANCE' ? 'error' : item.type === 'ONBOARDING' ? 'processing' : 'default'} style={{ borderRadius: '4px' }}>
                                                                {item.type}
                                                            </Tag>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                )
                            },
                            {
                                key: '2',
                                label: <span style={{ padding: '0 12px', fontWeight: 600 }}>Tasks</span>,
                                children: (
                                    <div style={{ padding: '8px 0' }}>
                                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsTaskModalOpen(true)} style={{ marginBottom: 20, height: '40px', borderRadius: '8px' }}>
                                            Add New Task
                                        </Button>
                                        <List
                                            dataSource={tasks}
                                            renderItem={item => (
                                                <List.Item
                                                    style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #f0f0f0', backgroundColor: item.status === 'DONE' ? '#fafafa' : '#fff' }}
                                                    actions={[
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteTask(item.id)}
                                                        />
                                                    ]}>
                                                    <List.Item.Meta
                                                        avatar={<Checkbox checked={item.status === 'DONE'} onChange={() => toggleTaskStatus(item)} />}
                                                        title={<Text delete={item.status === 'DONE'} strong={item.status !== 'DONE'}>{item.title}</Text>}
                                                        description={
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                                <Tag color={item.priority === 'HIGH' ? 'red' : item.priority === 'MEDIUM' ? 'orange' : 'blue'} style={{ fontSize: '10px', borderRadius: '4px', margin: 0 }}>
                                                                    {item.priority}
                                                                </Tag>
                                                                {item.dueDate && (
                                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                        Due: {dayjs(item.dueDate).format('DD/MM')}
                                                                    </Text>
                                                                )}
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )
                            }
                        ]} />
                    </Card>
                </Col>
            </Row>

            {/* Event Modal */}
            <Modal title={editingEvent ? "Edit Event" : "Add Event"} open={isEventModalOpen} onCancel={() => setIsEventModalOpen(false)} onOk={() => eventForm.submit()}>
                <Form form={eventForm} layout="vertical" onFinish={handleSaveEvent}>
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="type" label="Type" initialValue="ONBOARDING">
                        <Select>
                            <Option value="ONBOARDING">Onboarding</Option>
                            <Option value="HANDOVER">Handover</Option>
                            <Option value="MAINTENANCE">Maintenance</Option>
                            <Option value="OTHER">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" /></Form.Item>
                    <Form.Item name="endDate" label="End Date"><DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" /></Form.Item>
                    <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
                    {editingEvent && (
                        <Button danger icon={<DeleteOutlined />} onClick={() => {
                            Modal.confirm({
                                title: t('tables.confirmDelete'),
                                content: 'Are you sure you want to delete this event?',
                                onOk: () => handleDeleteEvent(editingEvent.id).then(() => {
                                    setIsEventModalOpen(false);
                                    setEditingEvent(null);
                                })
                            });
                        }}>
                            Delete Event
                        </Button>
                    )}
                </Form>
            </Modal>

            {/* Task Modal */}
            <Modal title="Add Task" open={isTaskModalOpen} onCancel={() => setIsTaskModalOpen(false)} onOk={() => taskForm.submit()}>
                <Form form={taskForm} layout="vertical" onFinish={handleTaskCreate}>
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="priority" label="Priority" initialValue="MEDIUM">
                        <Select>
                            <Option value="HIGH">High</Option>
                            <Option value="MEDIUM">Medium</Option>
                            <Option value="LOW">Low</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dueDate" label="Due Date"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CalendarPage;
