import React from 'react';
import Card from '@/components/Card';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'neutral',
  footer,
  className = '' 
}) => {
  // Determine change indicator color
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500'
  }[changeType];

  // Determine change icon
  const changeIcon = changeType === 'positive' ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ) : changeType === 'negative' ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ) : null;

  return (
    <Card className={`${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className={`ml-2 flex items-center text-sm ${changeColor}`}>
                {changeIcon}
                <span className="ml-1">{change}</span>
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 bg-indigo-50 rounded-md">
            {icon}
          </div>
        )}
      </div>
      {footer && (
        <div className="mt-4 text-sm text-gray-500">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
