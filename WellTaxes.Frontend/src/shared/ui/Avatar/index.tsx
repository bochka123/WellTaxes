import { type FC } from 'react';

interface AvatarProps {
    name: string;
    photoUrl: string | null;
    size?: 'sm' | 'md';
}

const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
};

const getInitials = (name: string): string =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const Avatar: FC<AvatarProps> = ({ name, photoUrl, size = 'md' }) => {
    const initials = getInitials(name);

    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={name}
                className={`${sizeMap[size]} rounded-full object-cover shrink-0`}
            />
        );
    }

    return (
        <div
            className={`${sizeMap[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
            style={{ backgroundColor: '#63aeff' }}
        >
            {initials}
        </div>
    );
};
