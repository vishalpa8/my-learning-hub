import { useEffect } from 'react';

export const useFocusTrap = (modalRef, isOpen, onClose) => {
  useEffect(() => {
    if (isOpen) {
      const focusableElements =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = modalRef.current;
      if (!modal) return;

      const firstFocusableElement = modal.querySelectorAll(focusableElements)[0];
      const focusableContent = modal.querySelectorAll(focusableElements);
      const lastFocusableElement = focusableContent[focusableContent.length - 1];

      const handleTabKeyPress = (event) => {
        if (event.key !== 'Tab') {
          return;
        }

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
          }
        }
      };

      const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleTabKeyPress);

      const focusTarget = firstFocusableElement || modalRef.current;
      focusTarget?.focus();

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('keydown', handleTabKeyPress);
      };
    }
  }, [isOpen, onClose, modalRef]);
};
