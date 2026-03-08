'use client';

export function AttendanceStatusDot({ status, size = 'md' }) {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'present':
                return {
                    color: 'bg-green-500',
                    label: 'Present',
                    ring: 'ring-green-200',
                };
            case 'on-leave':
                return {
                    color: 'bg-blue-500',
                    label: 'On Leave',
                    ring: 'ring-blue-200',
                };
            case 'absent':
                return {
                    color: 'bg-yellow-500',
                    label: 'Absent',
                    ring: 'ring-yellow-200',
                };
            default:
                return {
                    color: 'bg-gray-400',
                    label: 'Unknown',
                    ring: 'ring-gray-200',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="relative group">
            <div className={`${sizeClasses[size]} ${config.color} rounded-full ring-2 ${config.ring} animate-pulse`} />

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {config.label}
                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
            </div>
        </div>
    );
}
