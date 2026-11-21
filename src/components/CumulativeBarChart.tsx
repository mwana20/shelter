import React from 'react';

export interface CumulativeListingPoint {
  month: string;
  totalProperties: number;
}

interface CumulativeBarChartProps {
  points: CumulativeListingPoint[];
  emptyMessage: string;
  ariaLabel: string;
}

export const CumulativeBarChart: React.FC<CumulativeBarChartProps> = ({
  points,
  emptyMessage,
  ariaLabel
}) => {
  if (points.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-neutral-500 lg:text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  const chartWidth = Math.max(720, points.length * 48 + 72);
  const chartMax = Math.max(1, ...points.map((point) => point.totalProperties));
  const labelInterval = Math.max(1, Math.ceil(points.length / 12));
  const slotWidth = (chartWidth - 88) / points.length;

  return (
    <svg
      className="block h-[250px] text-neutral-500 lg:text-neutral-400"
      width={chartWidth}
      viewBox={`0 0 ${chartWidth} 250`}
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>
      {[0, 1, 2, 3, 4].map((step) => {
        const y = 190 - step * 40;
        const value = Math.round(chartMax * step / 4);
        return (
          <g key={step}>
            <line
              x1="62"
              y1={y}
              x2={chartWidth - 16}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.35"
            />
            <text x="54" y={y - 4} textAnchor="end" fill="currentColor" fontSize="10">
              {value.toLocaleString()}
            </text>
          </g>
        );
      })}
      {points.map((point, index) => {
        const barWidth = Math.min(32, slotWidth * 0.64);
        const barHeight = Math.max(1, point.totalProperties / chartMax * 160);
        const x = 68 + index * slotWidth + (slotWidth - barWidth) / 2;
        const y = 190 - barHeight;
        const monthDate = new Date(`${point.month}-01T00:00:00.000Z`);
        const monthLabel = monthDate.toLocaleDateString(undefined, {
          month: 'short',
          year: '2-digit',
          timeZone: 'UTC'
        });
        const showMonthLabel = index % labelInterval === 0 || index === points.length - 1;

        return (
          <g key={point.month}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#b9f653">
              <title>{`${monthLabel}: ${point.totalProperties.toLocaleString()} cumulative properties`}</title>
            </rect>
            {showMonthLabel && (
              <text
                x={x + barWidth / 2}
                y="222"
                textAnchor="middle"
                fill="currentColor"
                fontSize="10"
              >
                {monthLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
