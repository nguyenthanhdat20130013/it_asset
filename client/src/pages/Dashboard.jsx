import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message, Alert, List, Tag, Space } from 'antd';
import { UserOutlined, ShopOutlined, DatabaseOutlined, TeamOutlined, DesktopOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        companies: 0,
        departments: 0,
        employees: 0,
        assets: 0,
        assetsValue: 0,
        sims: 0,
        expiringSims: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/reports/dashboard');
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const expiringCount = Array.isArray(stats.expiringSims) ? stats.expiringSims.length : 0;

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 24 }}>{t('dashboard.title')}</h2>

            {expiringCount > 0 && (
                <Alert
                    message={t('dashboard.warning')}
                    description={
                        <List
                            size="small"
                            dataSource={stats.expiringSims}
                            renderItem={item => (
                                <List.Item style={{ padding: '4px 0' }}>
                                    <Space>
                                        <WarningOutlined style={{ color: '#cf1322' }} />
                                        <span>Số: <strong>{item.number}</strong> </span>
                                        <Tag color={dayjs(item.expiryDate).isBefore(dayjs()) ? 'error' : 'warning'}>
                                            {dayjs(item.expiryDate).isBefore(dayjs()) ? t('dashboard.expired') : t('dashboard.expiringSoon')} ({dayjs(item.expiryDate).format('DD/MM/YYYY')})
                                        </Tag>
                                        <Tag color="volcano">{item.company?.name}</Tag>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalCompanies')}
                            value={typeof stats.companies === 'object' ? stats.companies.total : stats.companies}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalDepartments')}
                            value={typeof stats.departments === 'object' ? stats.departments.total : stats.departments}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalEmployees')}
                            value={typeof stats.employees === 'object' ? stats.employees.total : stats.employees}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalAssets')}
                            value={typeof stats.assets === 'object' ? stats.assets.total : stats.assets}
                            prefix={<DesktopOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalAssetValue')}
                            value={stats.assetsValue}
                            precision={2}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalSims')}
                            value={typeof stats.sims === 'object' ? stats.sims.total : stats.sims}
                            prefix={<DesktopOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title={t('dashboard.expiringSims')}
                            value={expiringCount}
                            styles={{ content: { color: expiringCount > 0 ? '#cf1322' : '#3f8600' } }}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
