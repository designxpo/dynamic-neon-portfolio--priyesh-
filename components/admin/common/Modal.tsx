import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-gray-800">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
