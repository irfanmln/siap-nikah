import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle mobile hardware/gesture Back button for modals and drawers.
 * Intercepts popstate so pressing Back on phone closes the modal instead of exiting the site.
 */
export function useModalBack(isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  const isClosedByPopstateRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: true }, '');
    isClosedByPopstateRef.current = false;

    const handlePopState = () => {
      isClosedByPopstateRef.current = true;
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isClosedByPopstateRef.current && window.history.state?.modal) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
