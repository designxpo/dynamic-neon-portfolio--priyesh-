// @ts-nocheck
"use client";
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  /** 'modal' = centered card (default). 'drawer' = right-side panel. */
  variant?: 'modal' | 'drawer';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, variant = 'modal' }) => {
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Esc-to-close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDrawer = variant === 'drawer';

  return (
    <div
      className={`admin-shell fixed z-[9999] ${
        isDrawer
          ? 'admin-drawer-root'                       /* shrunk to leave sidebar uncovered */
          : 'inset-0 flex justify-center items-center p-4'
      }`}
      style={{ background: 'transparent' }}            /* tokens only — no opaque fill */
    >
      <div
        className={`admin-modal-backdrop ${isDrawer ? 'admin-modal-backdrop--drawer' : 'absolute inset-0'}`}
        onClick={onClose}
      />

      {isDrawer ? (
        <div
          className="admin-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-drawer-title"
        >
          <div className="admin-drawer-header">
            <h2 id="admin-drawer-title" className="text-lg font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
              {title}
            </h2>
            <button onClick={onClose} className="admin-icon-button" aria-label="Close drawer">
              <X size={18} />
            </button>
          </div>
          <div className="admin-drawer-body">
            {children}
          </div>
        </div>
      ) : (
        <div
          className="relative w-full max-w-3xl"
          style={{ maxHeight: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
        >
          <div
            style={{
              background: 'var(--admin-surface)',
              borderRadius: '1rem',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              maxHeight: 'calc(100vh - 4rem)',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex justify-between items-center px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--admin-border-soft)' }}
            >
              <h2 id="admin-modal-title" className="text-lg font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
                {title}
              </h2>
              <button onClick={onClose} className="admin-icon-button" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <div
              className="px-6 py-5"
              style={{ overflowY: 'auto', overflowX: 'hidden', flex: '1 1 auto', minHeight: 0, maxHeight: '70vh' }}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Modal);
