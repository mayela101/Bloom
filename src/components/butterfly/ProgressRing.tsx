import styles from './ProgressRing.module.css';
import { ButterflyStage } from '../../types';
import { getStageEmoji } from '../../utils/butterfly';

interface ProgressRingProps {
  current: number;
  goal: number;
  stage: ButterflyStage;
}

export function ProgressRing({ current, goal, stage }:ProgressRingProps) {
  const progress = Math.min(current / goal, 1);

  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className={styles.container}>
      <svg
        className={styles.ring}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className={styles.backgroundCircle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          className={styles.progressCircle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className={styles.centerContent}>
        <span className={`${styles.stageEmoji} ${stage === 'empty' ?  styles.emptyState : ''}`}>
          {getStageEmoji(stage)}
        </span>
      </div>
    </div>
  );
}