import { type FC } from 'react';

interface Props {
    onClick: () => void;
}

const CreateOrderButton: FC<Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white transition-all duration-150 active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: '#63aeff' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4d9ef0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#63aeff')}
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create order
        </button>
    );
};

export default CreateOrderButton;
