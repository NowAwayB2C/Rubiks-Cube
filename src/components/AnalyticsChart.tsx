import React, { useState, useMemo } from 'react';
import type { TimerSession } from '../types';
import { formatMinutesSecondsMillis } from '../utils/formatTime';

interface AnalyticsChartProps {
  sessions: TimerSession[];
}

interface DataPoint {
  key: string;
  label: string;
  dateSort: number;
  count: number;
  avgStopwatchMs: number;
  avgTotalMs: number;
  maxStopwatchMs: number;
  maxTotalMs: number;
}

// ISO week helper
function getYearAndWeek(date: Date): { key: string; label: string; dateSort: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  return {
    key: `${year}-W${String(weekNo).padStart(2, '0')}`,
    label: `KW ${weekNo} (${year})`,
    dateSort: d.getTime(),
  };
}

// Month & Year helper for yearly view
function getYearAndMonth(date: Date): { key: string; label: string; dateSort: number } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
  ];
  return {
    key: `${year}-${String(month + 1).padStart(2, '0')}`,
    label: `${monthNames[month]} ${year}`,
    dateSort: new Date(year, month, 1).getTime(),
  };
}

type ViewMode = 'weekly' | 'max' | 'yearly';

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ sessions }) => {
  if (sessions.length === 0) return null;
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group data points
  const chartData: DataPoint[] = useMemo(() => {
    if (sessions.length === 0) return [];

    const map = new Map<string, { label: string; dateSort: number; sessions: TimerSession[] }>();

    for (const session of sessions) {
      const date = new Date(session.stoppedAt || session.startedAt);
      if (isNaN(date.getTime())) continue;

      const group = viewMode === 'yearly' ? getYearAndMonth(date) : getYearAndWeek(date);

      if (!map.has(group.key)) {
        map.set(group.key, {
          label: group.label,
          dateSort: group.dateSort,
          sessions: [],
        });
      }
      map.get(group.key)!.sessions.push(session);
    }

    const points: DataPoint[] = [];
    map.forEach((value, key) => {
      const sList = value.sessions;
      const count = sList.length;

      const totalStopwatch = sList.reduce((sum, s) => sum + s.stopwatchDurationMs, 0);
      const totalOverall = sList.reduce((sum, s) => sum + s.totalDurationMs, 0);

      const maxStopwatch = Math.max(...sList.map((s) => s.stopwatchDurationMs));
      const maxTotal = Math.max(...sList.map((s) => s.totalDurationMs));

      points.push({
        key,
        label: value.label,
        dateSort: value.dateSort,
        count,
        avgStopwatchMs: Math.round(totalStopwatch / count),
        avgTotalMs: Math.round(totalOverall / count),
        maxStopwatchMs: maxStopwatch,
        maxTotalMs: maxTotal,
      });
    });

    // Chronological sort
    points.sort((a, b) => a.dateSort - b.dateSort);
    return points;
  }, [sessions, viewMode]);

  // Extract values to plot
  const values = useMemo(() => {
    return chartData.map((d) => {
      if (viewMode === 'max') {
        return d.maxStopwatchMs;
      }
      return d.avgStopwatchMs;
    });
  }, [chartData, viewMode]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 65;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;

  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const maxValue = useMemo(() => {
    if (values.length === 0) return 60000;
    const max = Math.max(...values);
    return Math.max(10000, Math.ceil((max * 1.15) / 5000) * 5000);
  }, [values]);

  // Coordinates calculation
  const coordinates = useMemo(() => {
    if (chartData.length === 0) return [];
    if (chartData.length === 1) {
      const y = paddingTop + innerHeight - (values[0] / maxValue) * innerHeight;
      return [{ x: paddingLeft + innerWidth / 2, y, raw: values[0], data: chartData[0] }];
    }

    const stepX = innerWidth / (chartData.length - 1);
    return chartData.map((d, i) => {
      const val = values[i];
      const x = paddingLeft + i * stepX;
      const y = paddingTop + innerHeight - (val / maxValue) * innerHeight;
      return { x, y, raw: val, data: d };
    });
  }, [chartData, values, innerWidth, innerHeight, maxValue]);

  // Construct SVG Path
  const linePath = useMemo(() => {
    if (coordinates.length <= 1) return '';
    return coordinates.reduce((path, pt, index) => {
      return index === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');
  }, [coordinates]);

  // Construct Area Path for gradient under line
  const areaPath = useMemo(() => {
    if (coordinates.length <= 1) return '';
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const bottomY = paddingTop + innerHeight;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [coordinates, linePath, innerHeight]);

  // Y-axis grid ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: Math.round(maxValue * pct),
    y: paddingTop + innerHeight - pct * innerHeight,
  }));

  return (
    <section className="w-full max-w-4xl mx-auto mt-6 px-4">
      {/* View Mode Controls: Wochen-Durchschnitt, Max-Ansicht, Jahres-Ansicht */}
      <div className="flex items-center justify-end pb-3">
        <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wochen-Durchschnitt
          </button>
          <button
            onClick={() => setViewMode('max')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'max'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Max-Ansicht
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'yearly'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jahres-Ansicht
          </button>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="mt-4 rounded-xl bg-slate-900/30 backdrop-blur-sm p-4 relative overflow-hidden">
        <div className="w-full">
            {/* Responsive SVG Canvas */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[580px] select-none"
              >
                <defs>
                  {/* Linear Gradient for Area under curve */}
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Labels (without horizontal divider lines) */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <text
                      x={paddingLeft - 10}
                      y={tick.y + 4}
                      fill="#64748B"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {formatMinutesSecondsMillis(tick.val)}
                    </text>
                  </g>
                ))}

                {/* Shaded Area under Curve */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill="url(#chartGradient)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Connected Line Path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Single Point Guideline if only 1 point */}
                {coordinates.length === 1 && (
                  <line
                    x1={paddingLeft}
                    y1={coordinates[0].y}
                    x2={svgWidth - paddingRight}
                    y2={coordinates[0].y}
                    stroke="#06B6D4"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-50"
                  />
                )}

                {/* Data Points (Dots on Line) */}
                {coordinates.map((pt, index) => {
                  const isHovered = hoveredIndex === index;
                  return (
                    <g
                      key={pt.data.key}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setHoveredIndex(index)}
                    >
                      {/* Invisible larger hover hit area */}
                      <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />

                      {/* Outer pulse when hovered */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={10}
                          fill="#06B6D4"
                          className="opacity-40 animate-ping"
                        />
                      )}

                      {/* Visible Circle Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 7 : 5}
                        fill="#06B6D4"
                        stroke="#0F172A"
                        strokeWidth="2.5"
                        className="transition-all duration-150"
                      />

                      {/* Bottom X-Axis Label */}
                      <text
                        x={pt.x}
                        y={svgHeight - 14}
                        fill={isHovered ? '#38BDF8' : '#64748B'}
                        fontSize="11"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="transition-colors font-medium"
                      >
                        {pt.data.label.replace(/\s\(\d{4}\)/, '')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
        </div>
      </div>
    </section>
  );
};
