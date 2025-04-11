"use client";

import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  type = 'button',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300',
    secondary: 'border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 disabled:bg-indigo-50 disabled:text-indigo-300',
    outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500 disabled:text-gray-300',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${widthClasses}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
