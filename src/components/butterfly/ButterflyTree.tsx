import { Butterfly } from './butterfly';
import { CompletedWeek } from '../../hooks/useCompletedWeeks';
import styles from './ButterflyTree.module.css';

interface ButterflyTreeProps {
  completedWeeks: CompletedWeek[];
}

// Predefined positions on the tree for butterflies
const BUTTERFLY_POSITIONS = [
  { top: '15%', left: '50%' },
  { top: '25%', left: '30%' },
  { top: '22%', left: '70%' },
  { top: '35%', left: '20%' },
  { top: '32%', left: '55%' },
  { top: '38%', left: '78%' },
  { top: '45%', left: '35%' },
  { top: '42%', left: '65%' },
  { top: '50%', left: '25%' },
  { top: '48%', left: '75%' },
  { top: '55%', left: '45%' },
  { top: '52%', left: '58%' },
  { top: '60%', left: '30%' },
  { top: '58%', left: '70%' },
  { top: '65%', left: '50%' },
];

export function ButterflyTree({ completedWeeks }:  ButterflyTreeProps) {
  return (
    <div className={styles. container}>
      {/* Tree SVG */}
      <svg
        viewBox="0 0 200 250"
        className={styles.tree}
      >
        {/* Floating island/ground */}
        <ellipse cx="100" cy="230" rx="60" ry="15" fill="#8B7355" />
        <ellipse cx="100" cy="225" rx="55" ry="12" fill="#90EE90" />
        <ellipse cx="100" cy="222" rx="50" ry="8" fill="#228B22" />
        
        {/* Tree trunk */}
        <path
          d="M95 220 
             C 92 200, 88 180, 90 160
             C 92 140, 95 120, 100 100
             C 105 120, 108 140, 110 160
             C 112 180, 108 200, 105 220
             Z"
          fill="#8B4513"
        />
        
        {/* Branches */}
        <path
          d="M90 160 C 70 150, 50 140, 40 130"
          stroke="#8B4513"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M110 160 C 130 150, 150 140, 160 130"
          stroke="#8B4513"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M95 130 C 75 120, 55 110, 45 95"
          stroke="#8B4513"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M105 130 C 125 120, 145 110, 155 95"
          stroke="#8B4513"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M100 100 C 100 80, 100 60, 100 45"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Leaves/Foliage */}
        <circle cx="40" cy="125" r="20" fill="#228B22" opacity="0.9" />
        <circle cx="160" cy="125" r="20" fill="#32CD32" opacity="0.9" />
        <circle cx="45" cy="90" r="18" fill="#32CD32" opacity="0.9" />
        <circle cx="155" cy="90" r="18" fill="#228B22" opacity="0.9" />
        <circle cx="70" cy="70" r="22" fill="#228B22" opacity="0.9" />
        <circle cx="130" cy="70" r="22" fill="#32CD32" opacity="0.9" />
        <circle cx="100" cy="50" r="25" fill="#228B22" opacity="0.9" />
        <circle cx="85" cy="100" r="18" fill="#32CD32" opacity="0.85" />
        <circle cx="115" cy="100" r="18" fill="#228B22" opacity="0.85" />
        <circle cx="60" cy="110" r="15" fill="#90EE90" opacity="0.8" />
        <circle cx="140" cy="110" r="15" fill="#90EE90" opacity="0.8" />
        <circle cx="100" cy="75" r="20" fill="#32CD32" opacity="0.85" />
      </svg>

      {/* Butterflies positioned on the tree */}
      <div className={styles. butterfliesContainer}>
        {completedWeeks.map((week, index) => {
          const position = BUTTERFLY_POSITIONS[index % BUTTERFLY_POSITIONS.length];
          
          // Add some randomness to make it look natural
          const randomRotation = (index * 37) % 40 - 20; // -20 to 20 degrees
          const randomDelay = (index * 0.3) % 2; // stagger animations
          
          return (
            <div
              key={week.id}
              className={styles.butterflyWrapper}
              style={{
                top: position.top,
                left: position.left,
                transform: `translate(-50%, -50%) rotate(${randomRotation}deg)`,
                animationDelay: `${randomDelay}s`,
              }}
              title={`Week of ${new Date(week.week_start).toLocaleDateString()}`}
            >
              <Butterfly 
                color={week.butterfly_color} 
                size={30}
              />
            </div>
          );
        })}
      </div>

      {/* Empty state message */}

    </div>
  );
}