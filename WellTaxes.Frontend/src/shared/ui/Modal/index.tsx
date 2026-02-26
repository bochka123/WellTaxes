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

const Modal: FC<ModalProps> = ({ visible,
                                   setVisible,
                                   heading,
                                   zIndexType,
                                   children }) => {

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

    const zClass = zIndexType === 'top' ? 'z-[200]' : 'z-[100]';

    const renderPortalBody = (): ReactNode => (
        <div
            className={`fixed inset-0 flex items-center justify-center bg-black/45 ${zClass}`}
            ref={wrapperRef}
        >
            <div className="w-full sm:max-w-[70%] mx-0 sm:mx-4 bg-white sm:rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.18)] overflow-hidden overflow-y-auto max-h-screen sm:max-h-[90vh]" ref={contentRef}>
                <div className="flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <p className="m-0 text-base font-semibold text-black tracking-wide">{heading}</p>
                        <button
                            type="button"
                            onClick={() => setVisible(false)}
                            className="flex items-center justify-center w-7 h-7 rounded text-black hover:bg-[#fe8380] hover:text-white transition-colors duration-150 cursor-pointer border-none bg-transparent"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
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
