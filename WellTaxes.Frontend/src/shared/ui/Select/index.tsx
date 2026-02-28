import { type FC, type SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
    className?: string;
};

const Select: FC<Props> = ({ className = '', children, ...props }) => (
    <div className={`relative inline-flex items-center ${className}`}>
        <select
            {...props}
            className="w-full appearance-none bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 pl-2 pr-6 py-1.5 cursor-pointer focus:outline-none focus:border-[#63aeff] transition-colors"
        >
            {children}
        </select>

        <svg
            className="pointer-events-none absolute right-1.5 text-zinc-400 shrink-0"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9l6 6 6-6"/>
        </svg>
    </div>
);

export default Select;
