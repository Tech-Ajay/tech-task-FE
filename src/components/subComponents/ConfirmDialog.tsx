import React from 'react';
import '../../styles/ConfirmDialog.css';

/**
 * Props interface for the ConfirmDialog component
 * @interface ConfirmDialogProps
 * @property {boolean} isOpen - Controls the visibility of the dialog
 * @property {string} message - The message to display in the dialog
 * @property {() => void} onConfirm - Callback function triggered when user confirms
 * @property {() => void} onCancel - Callback function triggered when user cancels
 */
interface ConfirmDialogProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * A reusable confirmation dialog component that displays a message and two action buttons.
 * Used primarily for confirming destructive actions like deletions.
 * 
 * @param {ConfirmDialogProps} props - The component props
 * @returns {JSX.Element | null} - Returns the dialog UI when open, null when closed
 */
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