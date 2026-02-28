import { type ButtonHTMLAttributes, type CSSProperties, type FC, type ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'dangerSoft';
type Size    = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:  Variant;
    size?:     Size;
    icon?:     ReactNode;
    children?: ReactNode;
    className?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
    primary: 'text-white border-transparent hover:opacity-90 active:opacity-80',
    outline: 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300',
    ghost:   'bg-transparent text-zinc-400 border-transparent hover:text-zinc-600 hover:bg-zinc-50',
    danger:  'text-white border-transparent hover:opacity-90 active:opacity-80',
    dangerSoft: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300',
};

const VARIANT_STYLE: Record<Variant, CSSProperties> = {
    primary: { backgroundColor: '#63aeff' },
    outline: {},
    ghost:   {},
    danger:  { backgroundColor: '#f87171' },
    dangerSoft: {},
};

const SIZE_CLASSES: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2 text-sm rounded-xl',
};

const Button: FC<Props> = ({
                               variant   = 'outline',
                               size      = 'md',
                               icon,
                               children,
                               className = '',
                               disabled,
                               ...rest
                           }) => (
    <button
        {...rest}
        disabled={disabled}
        style={VARIANT_STYLE[variant]}
        className={[
            'inline-flex items-center justify-center gap-2',
            'font-medium border',
            'transition-all duration-150 cursor-pointer',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
            SIZE_CLASSES[size],
            VARIANT_CLASSES[variant],
            className,
        ].join(' ')}
    >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
    </button>
);

export default Button;
