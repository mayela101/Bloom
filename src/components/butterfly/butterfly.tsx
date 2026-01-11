import styles from './butterfly.module.css';

interface ButterflyProps {
  color: string;
  size?:  number;
  style?: React.CSSProperties;
  className?: string;
}

export function Butterfly({ color, size = 40, style, className }: ButterflyProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${styles.butterfly} ${className || ''}`}
      style={style}
    >
      {/* Left wings */}
      <path
        d="M45 50 
           C 35 30, 15 25, 10 40
           C 5 55, 15 70, 30 65
           C 35 63, 40 58, 45 50
           Z"
        fill={color}
        stroke="#4a3728"
        strokeWidth="1.5"
        className={styles.wing}
      />
      <path
        d="M45 50
           C 40 60, 25 75, 20 85
           C 18 90, 25 92, 32 88
           C 40 82, 44 65, 45 50
           Z"
        fill={color}
        stroke="#4a3728"
        strokeWidth="1.5"
        className={styles.wingLower}
      />
      
      {/* Right wings */}
      <path
        d="M55 50 
           C 65 30, 85 25, 90 40
           C 95 55, 85 70, 70 65
           C 65 63, 60 58, 55 50
           Z"
        fill={color}
        stroke="#4a3728"
        strokeWidth="1.5"
        className={styles.wing}
      />
      <path
        d="M55 50
           C 60 60, 75 75, 80 85
           C 82 90, 75 92, 68 88
           C 60 82, 56 65, 55 50
           Z"
        fill={color}
        stroke="#4a3728"
        strokeWidth="1.5"
        className={styles.wingLower}
      />
      
      {/* Body */}
      <ellipse
        cx="50"
        cy="50"
        rx="5"
        ry="18"
        fill="#4a3728"
      />
      
      {/* Head */}
      <circle
        cx="50"
        cy="30"
        r="5"
        fill="#4a3728"
      />
      
      {/* Antennae */}
      <path
        d="M48 26 C 45 20, 40 15, 38 12"
        stroke="#4a3728"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M52 26 C 55 20, 60 15, 62 12"
        stroke="#4a3728"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Wing details - small circles */}
      <circle cx="25" cy="45" r="4" fill="rgba(255,255,255,0.3)" />
      <circle cx="75" cy="45" r="4" fill="rgba(255,255,255,0.3)" />
      <circle cx="30" cy="55" r="3" fill="rgba(255,255,255,0.2)" />
      <circle cx="70" cy="55" r="3" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}