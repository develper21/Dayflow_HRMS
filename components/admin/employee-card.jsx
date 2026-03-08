import Link from 'next/link';
import { AttendanceStatusDot } from '@/components/ui/attendance-status-dot';

export function EmployeeCard({ employee }) {
    // Determine attendance status
    const getAttendanceStatus = () => {
        // Check if employee checked in today
        // This would come from attendance data
        return 'present'; // or 'on-leave' or 'absent'
    };

    const attendanceStatus = getAttendanceStatus();

    return (
        <Link href={`/admin/employees/${employee.id}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer group relative">
                {/* Attendance Status Dot - Top Right */}
                <div className="absolute top-4 right-4">
                    <AttendanceStatusDot status={attendanceStatus} size="lg" />
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
                            {employee.profile?.profilePicture ? (
                                <img
                                    src={employee.profile.profilePicture}
                                    alt={employee.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span>{employee.name?.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                            {employee.name}
                        </h3>
                        <p className="text-sm text-gray-500">{employee.employeeId}</p>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700 font-medium">
                            {employee.jobDetails?.jobPosition || 'N/A'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-600">
                            {employee.jobDetails?.department || 'N/A'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 truncate">{employee.email}</span>
                    </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-lg" />
            </div>
        </Link>
    );
}
