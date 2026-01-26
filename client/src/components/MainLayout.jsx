import React, { useState } from 'react';
import {
    DesktopOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
    BankOutlined,
    MobileOutlined,
    CalendarOutlined,
    ProjectOutlined,
    LogoutOutlined,
    CloudServerOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme, Button, Space, Typography, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const MainLayout = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const roleMapping = {
        'ADMIN': t('common.role.ADMIN'),
        'IT_SUPPORT': t('common.role.IT_SUPPORT'),
        'VIEWER': t('common.role.VIEWER'),
        'EMPLOYEE': t('common.role.EMPLOYEE'),
    };

    // Define all possible menu items
    const allItems = [
        getItem(t('common.dashboard'), '/', <PieChartOutlined />),
        getItem(t('common.companies'), '/companies', <BankOutlined />),
        getItem(t('common.departments'), '/departments', <TeamOutlined />),
        getItem(t('common.employees'), '/employees', <UserOutlined />),
        getItem(t('common.assets'), '/assets', <DesktopOutlined />),
        getItem(t('common.sims'), '/sims', <MobileOutlined />),
        getItem(t('common.calendar'), '/calendar', <CalendarOutlined />),
        getItem(t('common.deviceTypes'), '/device-types', <DesktopOutlined />),
        getItem(t('common.projects'), '/projects', <ProjectOutlined />),
        getItem(t('common.software'), '/software', <CloudServerOutlined />),
        getItem(t('common.users'), '/users', <UserOutlined />), // New item
        getItem(t('common.settings'), '/settings', <SettingOutlined />),
    ];

    // Filter items based on role
    const filteredItems = allItems.filter(item => {
        if (item.key === '/settings' || item.key === '/users') {
            return user?.role === 'ADMIN';
        }
        // IT_SUPPORT can see everything except settings/users (which they already were filtered out above)
        // VIEWER can see everything read-only (handled inside pages)
        return true;
    });

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            height: collapsed ? '32px' : '64px',
                            maxWidth: '100%',
                            transition: 'all 0.2s',
                            objectFit: 'contain'
                        }}
                    />
                </div>
                <Menu
                    theme="dark"
                    defaultSelectedKeys={[location.pathname]}
                    mode="inline"
                    items={filteredItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 16px',
                    background: colorBgContainer,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '8px' }}>
                        <Space>
                            <Button
                                type={i18n.language.startsWith('en') ? 'primary' : 'default'}
                                onClick={() => changeLanguage('en')}
                                size="small"
                            >
                                EN
                            </Button>
                            <Button
                                type={i18n.language.startsWith('vi') ? 'primary' : 'default'}
                                onClick={() => changeLanguage('vi')}
                                size="small"
                            >
                                VI
                            </Button>
                        </Space>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                            <Text strong style={{ fontSize: '14px', marginBottom: '4px' }}>
                                {user?.employeeName || user?.username}
                            </Text>
                            <Tag color="cyan" style={{ margin: 0, fontSize: '11px', borderRadius: '4px' }}>
                                {roleMapping[user?.role] || user?.role}
                            </Tag>
                        </div>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={logout}
                            style={{ display: 'flex', alignItems: 'center', height: 'auto', padding: '4px 8px' }}
                        >
                            {t('common.logout')}
                        </Button>
                    </div>
                </Header>
                <Content style={{ margin: '16px 16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    IT Asset Management System ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
