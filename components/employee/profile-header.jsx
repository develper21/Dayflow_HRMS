'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ProfileHeader({ employee, onCheckIn, onCheckOut, canCheckInOut = true }) {
    const [uploading, setUploading] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    const todayAttendance = employee.attendance?.[0];
    const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleCheckIn = async () => {
        setCheckingIn(true);
        await onCheckIn();
        setCheckingIn(false);
    };

    const handleCheckOut = async () => {
        setCheckingOut(true);
        await onCheckOut();
        setCheckingOut(false);
    };

    return (
        <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-pink-200 flex items-center justify-center overflow-hidden">
                        {employee.profilePicture ? (
                            <img src={employee.profilePicture} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-pink-600">
                                {employee.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    {canCheckInOut && (
                        <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                    )}
                </div>

                {/* Employee Info */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                    <p className="text-gray-600">{employee.loginId}</p>
                    <p className="text-sm text-gray-500">{employee.department} • {employee.designation}</p>
                </div>

                {/* Check In/Out Buttons */}
                {canCheckInOut && (
                    <div className="flex gap-3">
                        {!isCheckedIn ? (
                            <Button onClick={handleCheckIn} loading={checkingIn} className="bg-green-600 hover:bg-green-700">
                                Check In
                            </Button>
                        ) : (
                            <Button onClick={handleCheckOut} loading={checkingOut} className="bg-red-600 hover:bg-red-700">
                                Check Out
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
