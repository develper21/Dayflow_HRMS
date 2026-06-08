'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchProfile();
        } else {
            setLoading(false);
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
            <div className="min-h-screen flex">
                <EmployeeSidebar />
                <main className="flex-1 ml-64 p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600 font-mono text-xs uppercase tracking-widest">Loading profile...</p>
                    </div>
                </main>
            </div>
        );
    }

    const user = profile?.user || {};
    const profileData = profile?.profile || {};
    const jobDetails = profile?.jobDetails || {};
    const salaryStructure = profile?.salaryStructure || {};

    return (
        <div className="min-h-screen flex">
            <EmployeeSidebar />
            
            <main className="flex-1 ml-64 p-8" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}>
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">STAFF_PORTAL / PROFILE_MANAGEMENT</h2>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-2 italic underline underline-offset-8 decoration-4 decoration-blue-500">My Profile</h1>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">View and manage your profile information</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/profile/edit">
                            <button className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 border border-black shadow-[4px_4px_0_0_#000] hover:bg-gray-900 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                                EDIT PROFILE
                            </button>
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 border border-black shadow-[4px_4px_0_0_#000] hover:bg-red-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                        >
                            TERMINATE SESSION
                        </button>
                    </div>
                </div>

                {/* Profile Header */}
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">BASIC_INFORMATION</h2>
                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] mb-8">
                    <div className="p-8">
                        <div className="flex items-start gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 border-4 border-black flex items-center justify-center overflow-hidden bg-white">
                                    {profileData.profilePicture ? (
                                        <img
                                            src={profileData.profilePicture}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-4xl font-black text-gray-400">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                                    <p className="text-lg font-bold text-black uppercase mt-1">{user.name || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login ID</label>
                                    <p className="text-lg font-mono font-bold text-blue-600 mt-1">{user.employeeId || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                                    <p className="text-lg font-bold text-gray-800 mt-1">{user.email || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</label>
                                    <p className="text-lg font-bold text-gray-800 mt-1">{user.phone || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</label>
                                    <p className="text-lg font-bold text-black uppercase mt-1">{session?.user?.companyName || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</label>
                                    <p className="text-lg font-bold text-black uppercase mt-1">{jobDetails.department || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Position</label>
                                    <p className="text-lg font-bold text-black uppercase mt-1">{jobDetails.jobPosition || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager</label>
                                    <p className="text-lg font-bold text-gray-800 mt-1">{jobDetails.manager || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Work Location</label>
                                    <p className="text-lg font-bold text-gray-800 uppercase italic mt-1">{jobDetails.workLocation || '-'}</p>
                                </div>
                                <div className="border-l-4 border-black pl-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Joining</label>
                                    <p className="text-lg font-bold text-gray-800 mt-1">
                                        {jobDetails.dateOfJoining
                                            ? new Date(jobDetails.dateOfJoining).toLocaleDateString()
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">PERSONAL_DETAILS</h2>
                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] mb-8">
                    <div className="px-8 py-4 border-b border-black bg-gray-50">
                        <h2 className="text-sm font-black uppercase tracking-widest italic">PERSONAL_INFORMATION</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Birth</label>
                                <p className="text-gray-900 font-bold mt-1">
                                    {profileData.dateOfBirth
                                        ? new Date(profileData.dateOfBirth).toLocaleDateString()
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gender</label>
                                <p className="text-gray-900 font-bold mt-1">{profileData.gender || '-'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marital Status</label>
                                <p className="text-gray-900 font-bold mt-1">
                                    {profileData.maritalStatus || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nationality</label>
                                <p className="text-gray-900 font-bold mt-1">
                                    {profileData.nationality || '-'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Residing Address</label>
                                <p className="text-gray-900 font-bold mt-1">
                                    {profileData.residingAddress || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                {(profileData.about ||
                    profileData.jobLoves ||
                    profileData.interestsHobbies) && (
                    <>
                        <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">ABOUT_SECTION</h2>
                        <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] mb-8">
                            <div className="px-8 py-4 border-b border-black bg-gray-50">
                                <h2 className="text-sm font-black uppercase tracking-widest italic">ABOUT</h2>
                            </div>
                            <div className="p-8 space-y-6">
                                {profileData.about && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About</label>
                                        <p className="text-gray-900 font-bold mt-1">{profileData.about}</p>
                                    </div>
                                )}
                                {profileData.jobLoves && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">What I love about my job</label>
                                        <p className="text-gray-900 font-bold mt-1">{profileData.jobLoves}</p>
                                    </div>
                                )}
                                {profileData.interestsHobbies && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My interests and hobbies</label>
                                        <p className="text-gray-900 font-bold mt-1">
                                            {profileData.interestsHobbies}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Salary Structure (Read-only for employees) */}
                {salaryStructure.monthlyWage && (
                    <>
                        <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">SALARY_INFORMATION</h2>
                        <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] mb-8">
                            <div className="px-8 py-4 border-b border-black bg-gray-50">
                                <h2 className="text-sm font-black uppercase tracking-widest italic">SALARY_DETAILS</h2>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Wage</label>
                                        <p className="text-3xl font-black text-blue-600 mt-1 font-mono">
                                            ₹{salaryStructure.monthlyWage?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yearly Wage</label>
                                        <p className="text-3xl font-black text-blue-600 mt-1 font-mono">
                                            ₹{salaryStructure.yearlyWage?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Bank & KYC Details */}
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">BANK_KYC_INFORMATION</h2>
                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                    <div className="px-8 py-4 border-b border-black bg-gray-50">
                        <h2 className="text-sm font-black uppercase tracking-widest italic">BANK_KYC_DETAILS</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest border-b border-black pb-2 italic">Identity Verification</h3>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nationality</label>
                                    <p className="font-bold text-black mt-1 uppercase">{profileData.nationality || 'NOT SPECIFIED'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gender</label>
                                    <p className="font-bold text-black mt-1 font-mono italic">{profileData.gender || 'NOT SPECIFIED'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Physical Address</label>
                                    <p className="font-bold text-blue-600 mt-1 italic">{profileData.residingAddress || 'ADDRESS VERIFICATION PENDING'}</p>
                                </div>
                            </div>

                            <div className="space-y-6 bg-gray-50/50 p-6 border border-black">
                                <h3 className="text-sm font-black uppercase tracking-widest border-b border-black pb-2 italic">Financial & Bank Records</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Permanent Account (PAN)</label>
                                        <p className="font-mono font-bold text-black mt-1">{profileData.panNumber || 'REQUIRED'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-green-400 uppercase tracking-widest">UAN Number</label>
                                        <p className="font-mono font-bold text-black mt-1">{profileData.uanNumber || 'REQUIRED'}</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-black p-4 mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] font-black uppercase">Bank Account</p>
                                        <p className="text-[8px] font-mono text-gray-400">ENCRYPTED</p>
                                    </div>
                                    <p className="text-lg font-black tracking-widest font-mono italic">{profileData.accountNumber || 'XXXX XXXX XXXX'}</p>
                                    <p className="text-xs font-bold text-gray-600 mt-2 uppercase">{profileData.bankName || 'AWAITING DETAILS'} - {profileData.ifscCode || 'IFSC'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
