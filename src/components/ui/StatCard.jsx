// Import trend icons for up/down indicators
import { TrendingUp, TrendingDown } from "lucide-react";
import "./StatCard.css";

// StatCard component for displaying KPI metrics with trend indicators
// Props: title (label), value (number/string), change (percentage), icon (Lucide icon), color (blue/green/amber/purple), prefix/suffix (units)
export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
  prefix = "",
  suffix = "",
}) {
  // Determine if trend is positive (up) or negative (down)
  const up = change >= 0;
  return (
    // Main container with dynamic color variant class
    <div className={`sc sc--${color}`}>
      <div className="sc-top">
        {/* Icon container with matching color variant */}
        <div className={`sc-icon sc-icon--${color}`}>
          <Icon size={17} />
        </div>
        {/* Trend badge showing percentage with appropriate icon */}
        <span className={`sc-change ${up ? "up" : "dn"}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(change)}%
        </span>
      </div>
      {/* Value display with prefix, formatted number (locale-aware), and suffix */}
      <div className="sc-val">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </div>
      {/* Title/label for the stat card */}
      <div className="sc-title">{title}</div>
    </div>
  );
}
