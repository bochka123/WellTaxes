import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/ui/Button';

interface Props {
    onClick: () => void;
    className?: string;
}

const PlusIcon = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const CreateOrderButton: FC<Props> = ({ onClick, className }) => {
    const { t } = useTranslation();
      
    return (
        <Button onClick={onClick} variant={'primary'} icon={PlusIcon} className={className}>
            {t('createOrder.createButton')}
        </Button>
    );
};

export default CreateOrderButton;
