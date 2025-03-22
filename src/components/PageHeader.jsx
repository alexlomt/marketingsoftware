import React from 'react';

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
