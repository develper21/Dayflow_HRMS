'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';

export default function EditProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

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

                // Set form values
                if (data.user) {
                    setValue('name', data.user.name || '');
                    setValue('phone', data.user.phone || '');
                }
                if (data.profile) {
                    setValue('dateOfBirth', data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '');
                    setValue('gender', data.profile.gender || '');
                    setValue('maritalStatus', data.profile.maritalStatus || '');
                    setValue('nationality', data.profile.nationality || '');
                    setValue('personalEmail', data.profile.personalEmail || '');
                    setValue('residingAddress', data.profile.residingAddress || '');
                    setValue('about', data.profile.about || '');
                    setValue('jobLoves', data.profile.jobLoves || '');
                    setValue('interestsHobbies', data.profile.interestsHobbies || '');
                    setValue('panNumber', data.profile.panNumber || '');
                    setValue('uanNumber', data.profile.uanNumber || '');
                    setValue('bankName', data.profile.bankName || '');
                    setValue('accountNumber', data.profile.accountNumber || '');
                    setValue('ifscCode', data.profile.ifscCode || '');
                }
                if (data.jobDetails) {
                    setValue('jobPosition', data.jobDetails.jobPosition || '');
                    setValue('department', data.jobDetails.department || '');
                    setValue('manager', data.jobDetails.manager || '');
                    setValue('workLocation', data.jobDetails.workLocation || '');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/profile/${session.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile');
            }

            router.push('/profile');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const isAdmin = session?.user?.role === 'ADMIN';

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

    return (
        <div className="min-h-screen flex">
            <EmployeeSidebar />
            <main className="flex-1 ml-64 p-8">
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">STAFF_PORTAL / EDIT_PROFILE</h2>
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-2 italic underline underline-offset-8 decoration-4 decoration-blue-500">Edit Profile</h1>
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Update your profile information</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {error && (
                        <div className="border border-red-500 bg-red-50 p-4 shadow-[2px_2px_0_0_#000]">
                            <p className="text-red-800 text-xs font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                        <div className="px-8 py-4 border-b border-black bg-gray-50">
                            <h2 className="text-sm font-black uppercase tracking-widest italic">BASIC_INFORMATION</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isAdmin && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Name <span className="text-red-500">*</span></label>
                                        <input
                                            {...register('name', {
                                                required: 'Name is required',
                                            })}
                                            className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all"
                                        />
                                        {errors.name && <p className="text-[8px] text-red-500 font-black uppercase mt-1">{errors.name.message}</p>}
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone</label>
                                    <input
                                        {...register('phone', {
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: 'Phone must be 10 digits',
                                            },
                                        })}
                                        className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all"
                                    />
                                    {errors.phone && <p className="text-[8px] text-red-500 font-black uppercase mt-1">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date of Birth</label>
                                    <input {...register('dateOfBirth')} type="date" className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gender</label>
                                    <select
                                        {...register('gender')}
                                        className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all bg-white"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Marital Status</label>
                                    <select
                                        {...register('maritalStatus')}
                                        className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all bg-white"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nationality</label>
                                    <input {...register('nationality')} className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Residing Address</label>
                                    <textarea
                                        {...register('residingAddress')}
                                        rows={3}
                                        className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank & KYC Information */}
                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                        <div className="px-8 py-4 border-b border-black bg-gray-50">
                            <h2 className="text-sm font-black uppercase tracking-widest italic">BANK_KYC_INFORMATION</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block">PAN Number</label>
                                    <input {...register('panNumber')} className="w-full border border-black px-4 py-3 text-[10px] font-mono font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 block">UAN Number</label>
                                    <input {...register('uanNumber')} className="w-full border border-black px-4 py-3 text-[10px] font-mono font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Bank Name</label>
                                    <input {...register('bankName')} className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Account Number</label>
                                    <input {...register('accountNumber')} className="w-full border border-black px-4 py-3 text-[10px] font-mono font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">IFSC Code</label>
                                    <input {...register('ifscCode')} className="w-full border border-black px-4 py-3 text-[10px] font-mono font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Details (Admin only) */}
                    {isAdmin && (
                        <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                            <div className="px-8 py-4 border-b border-black bg-gray-50">
                                <h2 className="text-sm font-black uppercase tracking-widest italic">JOB_DETAILS</h2>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Job Position</label>
                                        <input {...register('jobPosition')} className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Department</label>
                                        <input {...register('department')} className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Manager</label>
                                        <input {...register('manager')} className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Work Location</label>
                                        <input {...register('workLocation')} className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                        <div className="px-8 py-4 border-b border-black bg-gray-50">
                            <h2 className="text-sm font-black uppercase tracking-widest italic">ABOUT_SECTION</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">About</label>
                                <textarea
                                    {...register('about')}
                                    rows={4}
                                    className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">What I love about my job</label>
                                <textarea
                                    {...register('jobLoves')}
                                    rows={3}
                                    className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all"
                                    placeholder="What do you love about your job?"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">My interests and hobbies</label>
                                <textarea
                                    {...register('interestsHobbies')}
                                    rows={3}
                                    className="w-full border border-black px-4 py-3 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all"
                                    placeholder="Share your interests and hobbies..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-black text-white text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_#000] hover:bg-gray-900 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'SAVE CHANGES'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-white text-black text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

