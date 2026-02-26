import { type RefObject, useEffect } from 'react';

const useOutsideClick = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClose: () => void,
): void => {
  useEffect(() => {
    const handle = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onClose]);
};

export default useOutsideClick;
