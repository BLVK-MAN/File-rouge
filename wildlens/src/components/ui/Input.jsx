import React, { useId } from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    const inputId = useId();

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`px-3 py-2 bg-white text-gray-900 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${error ? 'border-accent focus:ring-accent focus:border-accent' : 'border-gray-300'
                    }`}
                {...props}
            />
            {error && (
                <span className="text-xs text-accent mt-1">{error}</span>
            )}
        </div>
    );
};

export default Input;
