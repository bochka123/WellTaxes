import { type FC } from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullscreen?: boolean;
}

const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-11 h-11 border-[3px]',
};

const Spinner: FC<SpinnerProps> = ({ size = 'md', fullscreen = false }) => {
    const spinner = (
        <div className={`
            ${sizeMap[size]}
            rounded-full
            border-zinc-200
            border-t-zinc-900
            animate-spin
          `}
        />
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full py-12">
            {spinner}
        </div>
    );
};

export default Spinner;
