import { useMemo } from 'react';
import styles from './WeeklyMoodChart.module.css';

interface DayData {
  date: Date;
  label: string;
  entries: number;
  sentiment: number | null;
  isToday: boolean;
  isFuture: boolean;
}

interface WeeklyMoodChartProps {
  data: DayData[];
}

export function WeeklyMoodChart({ data }:  WeeklyMoodChartProps) {
  const chartHeight = 100;
  const chartWidth = 300;
  const paddingY = 15;
  const paddingX = 20;
  const activeDays = data.filter(d => !d.isFuture);

  const pointsWithData = useMemo(() => {
    return activeDays
      .map((day, index) => ({
        ...day,
        index,
      }))
      .filter(day => day.sentiment !== null);
  }, [activeDays]);

  // Line chart helpers
  // sentiment score to Y
  const sentimentToY = (sentiment: number): number => {
    // -1 = bottom, 1 = top
    const normalized = (sentiment + 1) / 2; // 0 to 1
    return chartHeight - paddingY - (normalized * (chartHeight - paddingY * 2));
  };

  // Convert day index to X
  const indexToX = (index: number): number => {
    const usableWidth = chartWidth - paddingX * 2;
    const segmentWidth = usableWidth / (data.length - 1);
    return paddingX + (index * segmentWidth);
  };

  // Generate path for the line
  const linePath = useMemo(() => {
    if (pointsWithData.length === 0) return '';
    if (pointsWithData.length === 1) return '';

    let path = '';
    pointsWithData.forEach((point, i) => {
      const x = indexToX(point.index);
      const y = sentimentToY(point. sentiment!);
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  }, [pointsWithData, data. length]);

  // Get color based on average sentiment
  const avgSentiment = useMemo(() => {
    if (pointsWithData.length === 0) return 0;
    const sum = pointsWithData.reduce((acc, p) => acc + (p. sentiment || 0), 0);
    return sum / pointsWithData.length;
  }, [pointsWithData]);

  const lineColor = useMemo(() => {
    if (avgSentiment > 0.2) return '#4ade80'; 
    if (avgSentiment < -0.2) return '#f87171'; 
    return '#60a5fa'; 
  }, [avgSentiment]);

  return (
    <div className={styles.container}>
      {/* Chart Area */}
      <div className={styles.chartArea}>
        <div className={styles.centerLine} />

        <svg
          className={styles.svg}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Line path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {pointsWithData. map((point) => {
            const x = indexToX(point.index);
            const y = sentimentToY(point.sentiment!);
            
            return (
              <g key={point.index}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill={lineColor}
                  opacity="0.2"
                />
                {/* Inner dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={lineColor}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Day labels */}
      <div className={styles.labels}>
        {data. map((day, index) => (
          <div
            key={index}
            className={`${styles.label} ${day.isToday ?  styles.labelToday : ''} ${day.isFuture ? styles.labelFuture :  ''}`}
          >
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}