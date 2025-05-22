'use client';

import React, { ReactNode, useEffect } from 'react';
import '../styles/dbmanager.css';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export default function Modal({ title, isOpen, onClose, children, size = 'medium' }: ModalProps) {
  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Determine modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'small': return 'max-w-md';
      case 'medium': return 'max-w-3xl';
      case 'large': return 'max-w-5xl';
      case 'full': return 'max-w-[95%] w-[95%] h-[95%]';
      default: return 'max-w-3xl';
    }
  };
  
  return (
    <div 
      className="modalOverlay" 
      onClick={onClose}
    >
      <div 
        className={`modal ${getModalWidth()}`} 
        style={{
          width: '100%',
          maxWidth: size === 'full' ? '95%' : undefined,
          maxHeight: size === 'full' ? '95%' : '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h3 className="modalTitle">{title}</h3>
          <button 
            className="closeButton"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="modalBody">
          {children}
        </div>
      </div>
    </div>
  );
} 