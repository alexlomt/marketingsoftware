"use client";

import React from 'react';

const Card = ({ 
  children, 
  title,
  description,
  footer,
  className = '',
  ...props 
}) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`} {...props}>
      {title && (
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className={`px-4 py-5 sm:p-6 ${!title ? 'pt-5' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
