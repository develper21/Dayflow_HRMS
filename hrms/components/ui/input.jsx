import React from 'react';

export const Input = React.forwardRef(({ className = '', error, ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                className={`w-full px-4 py-3 rounded-lg border ${error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    } focus:outline-none focus:ring-2 transition-colors ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
