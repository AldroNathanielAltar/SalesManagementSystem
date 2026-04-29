import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ title, value, change, icon: Icon, color = 'blue', prefix = '', suffix = '' }) {
  const up = change >= 0;
  return (
    <div className={`sc sc--${color}`}>
      <div className="sc-top">
        <div className={`sc-icon sc-icon--${color}`}><Icon size={17} /></div>
        <span className={`sc-change ${up ? 'up' : 'dn'}`}>
          {up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="sc-val">{prefix}{typeof value==='number' ? value.toLocaleString() : value}{suffix}</div>
      <div className="sc-title">{title}</div>
    </div>
  );
}
