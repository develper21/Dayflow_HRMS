'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profile/${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                companyName={session?.user?.companyName}
                companyLogo={session?.user?.companyLogo}
            >
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    const user = profile?.user || {};
    const profileData = profile?.profile || {};
    const jobDetails = profile?.jobDetails || {};
    const salaryStructure = profile?.salaryStructure || {};

    return (
        <DashboardLayout
            companyName={session?.user?.companyName}
            companyLogo={session?.user?.companyLogo}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-2">View and manage your profile information</p>
                    </div>
                    <Link href="/profile/edit">
                        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                            Edit Profile
                        </button>
                    </Link>
                </div>

                {/* Profile Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {profileData.profilePicture ? (
                                        <img
                                            src={profileData.profilePicture}
                                            alt={user.name}
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        user.name?.charAt(0)?.toUpperCase() || 'U'
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {user.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Login ID
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {user.employeeId || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {user.email || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {user.phone || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Company</label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {session?.user?.companyName || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Department
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {jobDetails.department || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Job Position
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {jobDetails.jobPosition || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Manager</label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {jobDetails.manager || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Work Location
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {jobDetails.workLocation || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Date of Joining
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {jobDetails.dateOfJoining
                                            ? new Date(jobDetails.dateOfJoining).toLocaleDateString()
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Date of Birth
                                </label>
                                <p className="text-gray-900 mt-1">
                                    {profileData.dateOfBirth
                                        ? new Date(profileData.dateOfBirth).toLocaleDateString()
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Gender</label>
                                <p className="text-gray-900 mt-1">{profileData.gender || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Marital Status
                                </label>
                                <p className="text-gray-900 mt-1">
                                    {profileData.maritalStatus || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nationality</label>
                                <p className="text-gray-900 mt-1">
                                    {profileData.nationality || '-'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">
                                    Residing Address
                                </label>
                                <p className="text-gray-900 mt-1">
                                    {profileData.residingAddress || '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* About Section */}
                {(profileData.about ||
                    profileData.jobLoves ||
                    profileData.interestsHobbies) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profileData.about && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">About</label>
                                    <p className="text-gray-900 mt-1">{profileData.about}</p>
                                </div>
                            )}
                            {profileData.jobLoves && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        What I love about my job
                                    </label>
                                    <p className="text-gray-900 mt-1">{profileData.jobLoves}</p>
                                </div>
                            )}
                            {profileData.interestsHobbies && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        My interests and hobbies
                                    </label>
                                    <p className="text-gray-900 mt-1">
                                        {profileData.interestsHobbies}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Salary Structure (Read-only for employees) */}
                {salaryStructure.monthlyWage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Monthly Wage
                                    </label>
                                    <p className="text-2xl font-bold text-primary-600 mt-1">
                                        ₹{salaryStructure.monthlyWage?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Yearly Wage
                                    </label>
                                    <p className="text-2xl font-bold text-primary-600 mt-1">
                                        ₹{salaryStructure.yearlyWage?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}

