import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  label: string;
  value: number;
  date: string;
  color?: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  title, 
  height = 200 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const barHeight = (percentage / 100) * (height - 40);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex justify-center">
                <div
                  className="w-8 rounded-t-md transition-all duration-300 hover:opacity-80"
                  style={{
                    height: Math.max(barHeight, 4),
                    backgroundColor: item.color || '#3B82F6',
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div className="font-medium">{item.value}</div>
                <div className="truncate max-w-16">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SimpleLineChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
  showGradient?: boolean;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  height = 200,
  showGradient = true
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 80 - 10;
    return { x, y, value: item.value, date: item.date, label: item.label };
  });
  
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');
  
  const gradientPath = showGradient ? 
    `${pathData} L 100 100 L 0 100 Z` : '';
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {showGradient && (
            <path
              d={gradientPath}
              fill="url(#lineGradient)"
            />
          )}
          
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3B82F6"
              vectorEffect="non-scaling-stroke"
              className="hover:r-4 transition-all cursor-pointer"
            />
          ))}
        </svg>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          {data.map((item, index) => {
            if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
              return (
                <span key={index} className="text-center">
                  {item.label}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

interface SimplePieChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  size?: number;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  data, 
  title, 
  size = 200 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const isLargeArc = angle > 180 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
    
    const pathData = [
      'M', 50, 50,
      'L', x1, y1,
      'A', 40, 40, 0, isLargeArc, 1, x2, y2,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      pathData,
      percentage,
      color: item.color || colors[index % colors.length]
    };
  });
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex items-center gap-6">
        <svg width={size} height={size} viewBox="0 0 100 100">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.pathData}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
        
        <div className="flex-1">
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700">{segment.label}</span>
                <span className="text-gray-500 ml-auto">
                  {segment.value} ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};