import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-darkBorder dark:bg-darkCard animate-in fade-in zoom-in-95 duration-200 z-10">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-darkBorder">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>
        
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>

        {footer && (
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-darkBorder">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
