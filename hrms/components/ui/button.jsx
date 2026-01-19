export function Button({ children, className = '', variant = 'primary', loading = false, ...props }) {
    const baseStyles = 'w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Loading...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
