'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface DataItem {
  label: string;
  rate: number;
  unit: string;
  count?: number;
}

interface FactorCategoryChartProps {
  data: DataItem[];
  color: 'blue' | 'orange' | 'red' | 'green' | 'amber' | 'rose' | 'emerald';
}

const colorMap = {
  blue: {
    primary: '#3b82f6',
    gradient: ['#60a5fa', '#2563eb']
  },
  orange: {
    primary: '#f97316',
    gradient: ['#fb923c', '#ea580c']
  },
  amber: {
    primary: '#f59e0b',
    gradient: ['#fbbf24', '#d97706']
  },
  red: {
    primary: '#ef4444',
    gradient: ['#f87171', '#dc2626']
  },
  rose: {
    primary: '#f43f5e',
    gradient: ['#fb7185', '#e11d48']
  },
  green: {
    primary: '#10b981',
    gradient: ['#34d399', '#059669']
  },
  emerald: {
    primary: '#10b981',
    gradient: ['#34d399', '#059669']
  }
};

export default function FactorCategoryChart({ data, color }: FactorCategoryChartProps) {
  const theme = colorMap[color];
  const chartId = `gradient-${color}`;

  // Custom tool-tip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as DataItem;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 ring-4 ring-black/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{item.rate}%</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">({item.count?.toLocaleString()} {item.unit.replace('% ', '')})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[240px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
          barGap={12}
        >
          <defs>
            <linearGradient id={chartId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.gradient[0]} stopOpacity={0.8} />
              <stop offset="100%" stopColor={theme.gradient[1]} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            dataKey="label" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            width={120}
            tick={(props) => {
              const { x, y, payload } = props;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={-10} 
                    y={0} 
                    dy={4} 
                    textAnchor="end" 
                    fill="#64748b" 
                    className="text-[10px] font-black uppercase tracking-tighter"
                  >
                    {payload.value.length > 20 ? `${payload.value.substring(0, 18)}...` : payload.value}
                  </text>
                </g>
              );
            }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc', radius: 12 }}
            content={<CustomTooltip />}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <Bar 
            dataKey="rate" 
            radius={[0, 12, 12, 0]} 
            barSize={24}
            fill={`url(#${chartId})`}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            <LabelList 
              dataKey="rate" 
              position="right" 
              offset={10}
              content={(props: any) => {
                const { x, y, width, value } = props;
                return (
                  <text 
                    x={x + width + 10} 
                    y={y + 15} 
                    fill="#1e293b" 
                    className="text-[11px] font-black italic"
                  >
                    {value}%
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
