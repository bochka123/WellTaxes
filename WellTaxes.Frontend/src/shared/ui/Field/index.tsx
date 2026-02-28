import { type FC, type ReactNode } from 'react';

interface Props {
    label:     string;
    error?:    string;
    className?: string;
    children:  ReactNode;
}

const Field: FC<Props> = ({ label, error, className = '', children }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-xs text-zinc-500">{label}</label>
        {children}
        {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
);

export default Field;
