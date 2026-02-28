import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type Dispatch, type FC, type ReactNode, type SetStateAction, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import useOutsideClick from '@/shared/hooks/useOutsideClick';

type ModalProps = {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    heading: string;
    zIndexType?: 'top' | 'bottom';
    children: ReactNode;
}

const ESCAPE_KEY = 'Escape';

const Modal: FC<ModalProps> = ({
                                   visible,
                                   setVisible,
                                   heading,
                                   zIndexType,
                                   children,
                               }) => {

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const close = useCallback((): void => setVisible(false), [setVisible]);

    useOutsideClick(contentRef, close);

    useEffect(() => {
        const close = (e: KeyboardEvent): void => {
            if (e.key === ESCAPE_KEY) {
                setVisible(false);
            }
        };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, []);

    const zClass = zIndexType === 'top' ? 'z-[1000]' : 'z-[100]';

    const renderPortalBody = (): ReactNode => (
        <div
            ref={wrapperRef}
            className={`fixed inset-0 flex items-center justify-center bg-black/45 ${zClass} p-0 sm:p-4`}
        >
            <div
                ref={contentRef}
                className={[
                    'flex flex-col bg-white overflow-hidden',
                    'shadow-[0_4px_24px_rgba(0,0,0,0.18)]',
                    'w-full max-h-[95dvh] rounded-2xl',
                    'sm:min-w-0 sm:w-240 sm:max-w-[95vw] sm:max-h-[90dvh] sm:rounded-xl',
                ].join(' ')}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <p className="m-0 text-base font-semibold text-black tracking-wide">{heading}</p>
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        className="flex items-center justify-center w-7 h-7 rounded text-black hover:bg-[#fe8380] hover:text-white transition-colors duration-150 cursor-pointer border-none bg-transparent"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {children}
                </div>
            </div>
        </div>
    );

    const renderPortal = (): ReactNode => {
        const modalLayer = document.getElementById('modal');

        if (modalLayer) {
            return createPortal(renderPortalBody(), modalLayer);
        }

        return null;
    };

    return (
        <>
            {visible && renderPortal()}
        </>
    );
};
    
export default Modal;
