
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

interface ChartData {
  name: string;
  value: number;
  change?: number;
}

interface PortfolioChartProps {
  type: 'line' | 'pie';
  data: ChartData[];
  title: string;
  className?: string;
}

const COLORS = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const PortfolioChart: React.FC<PortfolioChartProps> = ({ type, data, title, className = '' }) => {
  if (type === 'pie') {
    return (
      <Card className={`glass p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  return (
    <Card className={`glass p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          />
          <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PortfolioChart;
