import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message, Alert, List, Tag, Space } from 'antd';
import { UserOutlined, ShopOutlined, DatabaseOutlined, TeamOutlined, DesktopOutlined, WarningOutlined, ShoppingCartOutlined, MobileOutlined } from '@ant-design/icons';
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
        posValue: 0,
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

    const cardStyles = {
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        height: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
    };

    const iconWrapperStyle = (color) => ({
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}15`, // Light tint
        color: color,
        fontSize: '24px',
        marginBottom: '16px'
    });

    const statValueStyle = {
        fontSize: '24px',
        fontWeight: '700',
        color: '#262626'
    };
    const statTitleStyle = {
        color: '#8c8c8c',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '4px',
        display: 'block'
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(Number(val) || 0);

    return (
        <div style={{ padding: '24px 32px', background: '#f9f9f9', minHeight: '100%' }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#141414' }}>
                    {t('dashboard.title')}
                </h1>
                <Tag color="processing" style={{ borderRadius: '4px' }}>
                    {dayjs().format('DD/MM/YYYY HH:mm')}
                </Tag>
            </div>

            {expiringCount > 0 && (
                <Alert
                    title={<span style={{ fontWeight: 600, color: '#cf1322' }}>{t('dashboard.warning')}</span>}
                    description={
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {stats.expiringSims.map((item, index) => (
                                <div key={index} style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <WarningOutlined style={{ color: '#cf1322' }} />
                                    <span style={{ color: '#595959' }}>Số: <strong>{item.number}</strong> </span>
                                    <Tag color={dayjs(item.expiryDate).isBefore(dayjs()) ? 'error' : 'warning'}>
                                        {dayjs(item.expiryDate).isBefore(dayjs()) ? t('dashboard.expired') : t('dashboard.expiringSoon')} ({dayjs(item.expiryDate).format('DD/MM/YYYY')})
                                    </Tag>
                                    <span style={{ color: '#8c8c8c' }}>{item.company?.name}</span>
                                </div>
                            ))}
                        </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 32, borderRadius: '8px', border: '1px solid #ffccc7' }}
                />
            )}

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={cardStyles} hoverable>
                        <div style={iconWrapperStyle('#597ef7')}>
                            <ShopOutlined />
                        </div>
                        <Statistic
                            title={<span style={statTitleStyle}>{t('dashboard.totalCompanies')}</span>}
                            value={typeof stats.companies === 'object' ? stats.companies.total : stats.companies}
                            styles={{ content: statValueStyle }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={cardStyles} hoverable>
                        <div style={iconWrapperStyle('#13c2c2')}>
                            <TeamOutlined />
                        </div>
                        <Statistic
                            title={<span style={statTitleStyle}>{t('dashboard.totalDepartments')}</span>}
                            value={typeof stats.departments === 'object' ? stats.departments.total : stats.departments}
                            styles={{ content: statValueStyle }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={cardStyles} hoverable>
                        <div style={iconWrapperStyle('#faad14')}>
                            <UserOutlined />
                        </div>
                        <Statistic
                            title={<span style={statTitleStyle}>{t('dashboard.totalEmployees')}</span>}
                            value={typeof stats.employees === 'object' ? stats.employees.total : stats.employees}
                            styles={{ content: statValueStyle }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={cardStyles} hoverable>
                        <div style={iconWrapperStyle('#722ed1')}>
                            <DesktopOutlined />
                        </div>
                        <Statistic
                            title={<span style={statTitleStyle}>{t('dashboard.totalAssets')}</span>}
                            value={typeof stats.assets === 'object' ? stats.assets.total : stats.assets}
                            styles={{ content: statValueStyle }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card style={cardStyles} hoverable>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ ...iconWrapperStyle('#eb2f96'), marginBottom: 0, marginRight: '20px' }}>
                                <DatabaseOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={statTitleStyle}>{t('dashboard.totalAssetValue')}</span>
                                <div style={statValueStyle}>{formatCurrency(stats.assetsValue)}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card style={cardStyles} hoverable>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ ...iconWrapperStyle('#2f54eb'), marginBottom: 0, marginRight: '20px' }}>
                                <ShoppingCartOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={statTitleStyle}>{t('dashboard.totalPoValue')}</span>
                                <div style={statValueStyle}>{formatCurrency(stats.posValue)}</div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12}>
                    <Card style={cardStyles} hoverable>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={statTitleStyle}>{t('dashboard.totalSims')}</span>
                                <div style={statValueStyle}>{typeof stats.sims === 'object' ? stats.sims.total : stats.sims}</div>
                            </div>
                            <div style={{ ...iconWrapperStyle('#52c41a'), marginBottom: 0 }}>
                                <MobileOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card style={cardStyles} hoverable>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={statTitleStyle}>{t('dashboard.expiringSims')}</span>
                                <div style={{ ...statValueStyle, color: expiringCount > 0 ? '#ff4d4f' : '#52c41a' }}>{expiringCount}</div>
                            </div>
                            <div style={{ ...iconWrapperStyle(expiringCount > 0 ? '#ff4d4f' : '#bfbfbf'), marginBottom: 0 }}>
                                <WarningOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
