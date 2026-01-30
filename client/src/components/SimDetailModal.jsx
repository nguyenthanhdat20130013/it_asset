import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const SimDetailModal = ({ visible, onClose, sim }) => {
    const { t } = useTranslation();

    if (!sim) return null;

    return (
        <Modal
            title={t('sims.detailTitle', "SIM Details")}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Descriptions bordered column={1}>
                <Descriptions.Item label={t('tables.number', "Number")}>{sim.number}</Descriptions.Item>
                <Descriptions.Item label={t('tables.carrier', "Carrier")}>{sim.carrier}</Descriptions.Item>
                <Descriptions.Item label={t('tables.company', "Company")}>{sim.company?.name}</Descriptions.Item>
                <Descriptions.Item label={t('tables.plan', "Plan")}>{sim.plan}</Descriptions.Item>
                <Descriptions.Item label={t('tables.regDate', "Registration Date")}>
                    {sim.registrationDate ? dayjs(sim.registrationDate).format('DD/MM/YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('tables.actDate', "Activation Date")}>
                    {sim.activationDate ? dayjs(sim.activationDate).format('DD/MM/YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('tables.expiry', "Expiry Date")}>
                    {sim.expiryDate ? dayjs(sim.expiryDate).format('DD/MM/YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('tables.status', "Status")}>
                    <Tag color={sim.status === 'ACTIVE' ? 'green' : (sim.status === 'EXPIRED' ? 'red' : 'orange')}>
                        {t(`status.${sim.status}`, sim.status)}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default SimDetailModal;
