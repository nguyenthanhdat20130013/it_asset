import React, { useState } from 'react';
import { Card, Button, Upload, message, Typography, Space, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownloadOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;

const Settings = () => {
    const { t } = useTranslation();
    const [restoring, setRestoring] = useState(false);

    const handleBackup = async () => {
        try {
            const response = await api.get('/backup/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Backup started');
        } catch (error) {
            message.error('Backup failed');
        }
    };

    const handleRestore = async (file) => {
        Modal.confirm({
            title: t('tables.confirmDelete'),
            icon: <ExclamationCircleOutlined />,
            content: 'This will OVERWRITE your current database. This action cannot be undone.',
            okText: 'Yes, Restore',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setRestoring(true);
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        await api.post('/backup/import', data);
                        message.success('Restore successful. Please refresh the page.');
                        window.location.reload();
                    } catch (error) {
                        message.error('Restore failed: ' + (error.response?.data?.error || error.message));
                    } finally {
                        setRestoring(false);
                    }
                };
                reader.readAsText(file);
            }
        });
        return false; // Prevent auto upload
    };

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>{t('settings.title')}</Title>

            <Card title={t('settings.dataManagement')} style={{ maxWidth: 600 }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={5}>{t('settings.backupData')}</Title>
                        <Text type="secondary">Download a full backup of the database as a JSON file.</Text>
                        <br />
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleBackup}
                            style={{ marginTop: 8 }}
                        >
                            {t('settings.downloadBackup')}
                        </Button>
                    </div>

                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                        <Title level={5}>{t('settings.restoreData')}</Title>
                        <Text type="secondary">Upload a JSON backup file to restore the database.</Text>
                        <br />
                        <Upload
                            beforeUpload={handleRestore}
                            showUploadList={false}
                            accept=".json"
                        >
                            <Button
                                danger
                                icon={<UploadOutlined />}
                                loading={restoring}
                                style={{ marginTop: 8 }}
                            >
                                {t('settings.restoreFromBackup')}
                            </Button>
                        </Upload>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default Settings;
