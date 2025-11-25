import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-heavy-fade-in">
            <div className="bg-dark-surface border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100 relative animate-heavy-scale">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {title && (
                    <h3 className="text-xl font-bold text-white mb-4 pr-8">{title}</h3>
                )}

                <div className="text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
