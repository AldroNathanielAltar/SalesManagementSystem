import { CheckCircle, XCircle, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ msg, type = 'success', onClose }) {
  const isSuccess = type === 'success';
  return (
    <div className={`toast toast-${type}`}>
      {isSuccess
        ? <CheckCircle size={16} style={{ flexShrink: 0 }} />
        : <XCircle    size={16} style={{ flexShrink: 0 }} />
      }
      <span className="toast-msg">{msg}</span>
      <button className="toast-close" onClick={onClose}><X size={13} /></button>
    </div>
  );
}
