import React from 'react';
import '../../styles/ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
                <div className="confirm-dialog-content">
                    <h2 className="confirm-dialog-title">Confirm Delete</h2>
                    <p className="confirm-dialog-message">{message}</p>
                    <div className="confirm-dialog-buttons">
                        <button className="confirm-dialog-button cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="confirm-dialog-button confirm" onClick={onConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog; 