// @ts-nocheck
"use client";
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl" style={{ maxHeight: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl border border-white/20" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 4rem)' }}>
          <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="admin-icon-button hover:text-red-400 hover:border-red-500/50" aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 scrollbar-thin" style={{ overflowY: 'auto', overflowX: 'hidden', flex: '1 1 auto', minHeight: 0, maxHeight: '70vh' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
