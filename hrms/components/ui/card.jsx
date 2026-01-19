export function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`mb-6 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }) {
    return (
        <h2 className={`text-2xl font-bold text-gray-900 ${className}`}>
            {children}
        </h2>
    );
}

export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-gray-600 mt-2 ${className}`}>
            {children}
        </p>
    );
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}
