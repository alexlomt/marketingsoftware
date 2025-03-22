import React from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  options = [],
  ...props
}) => {
  const id = `field-${name}`;
  
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            }`}
            {...props}
          />
        );
      
      case 'select':
        return (
          <select
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            }`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center h-5">
            <input
              id={id}
              name={name}
              type="checkbox"
              checked={!!value}
              onChange={onChange}
              disabled={disabled}
              className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                error ? 'border-red-300' : ''
              }`}
              {...props}
            />
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${id}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  disabled={disabled}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  {...props}
                />
                <label
                  htmlFor={`${id}-${option.value}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            id={id}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            }`}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'checkbox' ? (
        <div className="flex items-start">
          <div className="flex items-center h-5">
            {renderInput()}
          </div>
          {label && (
            <div className="ml-3 text-sm">
              <label htmlFor={id} className="font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          )}
        </div>
      ) : (
        renderInput()
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;
