'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function EditEmployeeProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
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
        if (params.id) {
            fetchProfile();
        }
    }, [params.id]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profile/${params.id}`);
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
            const response = await fetch(`/api/profile/${params.id}`, {
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

            router.push(`/admin/employees/${params.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-mono font-black uppercase tracking-widest">LOADING_PROFILE_DATA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fafafa'
            }}>
                <div className="mb-10">
                    <Link
                        href={`/admin/employees/${params.id}`}
                        className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-6 py-2 shadow-[2px_2px_0_0_#000] hover:shadow-none transition-all mb-8 inline-flex items-center gap-3 bg-white"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        [ RETURN_TO_ENTITY_PROFILE ]
                    </Link>
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">SYSTEM.ADMINISTRATION / ENTITY_MODIFICATION_PROTOCOL</h2>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight italic">Edit Employee Data</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {error && (
                        <div className="p-6 border-2 border-black bg-red-50 shadow-[4px_4px_0_0_#000]">
                            <p className="text-red-800 text-[10px] font-black uppercase tracking-widest font-mono">{error}</p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
                        <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic border-b-2 border-black pb-4">BIOGRAPHICAL_DATA_SECTION</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">FULL_DESIGNATION <span className="text-red-500">*</span></label>
                                <input
                                    {...register('name', {
                                        required: 'Name is required',
                                    })}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                                />
                                {errors.name && <p className="text-red-600 text-[8px] font-mono mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">COMMUNICATION_NUMBER</label>
                                <input
                                    {...register('phone', {
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Phone must be 10 digits',
                                        },
                                    })}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                                />
                                {errors.phone && <p className="text-red-600 text-[8px] font-mono mt-1">{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">CHRONOLOGICAL_BIRTH_DATE</label>
                                <input {...register('dateOfBirth')} type="date" className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">GENDER_CLASSIFICATION</label>
                                <select
                                    {...register('gender')}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono bg-white"
                                >
                                    <option value="">SELECT_CLASSIFICATION</option>
                                    <option value="Male">MALE</option>
                                    <option value="Female">FEMALE</option>
                                    <option value="Other">OTHER</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">MARITAL_STATUS</label>
                                <select
                                    {...register('maritalStatus')}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono bg-white"
                                >
                                    <option value="">SELECT_STATUS</option>
                                    <option value="Single">SINGLE</option>
                                    <option value="Married">MARRIED</option>
                                    <option value="Divorced">DIVORCED</option>
                                    <option value="Widowed">WIDOWED</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">NATIONALITY_ORIGIN</label>
                                <input {...register('nationality')} className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">RESIDENCE_LOCATION</label>
                                <textarea
                                    {...register('residingAddress')}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
                        <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic border-b-2 border-black pb-4">PROFESSIONAL_ASSIGNMENT_DATA</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">FUNCTIONAL_POSITION</label>
                                <input {...register('jobPosition')} className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">DEPARTMENTAL_UNIT</label>
                                <input {...register('department')} className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">SUPERVISOR_ENTITY</label>
                                <input {...register('manager')} className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">WORK_LOCATION_NODE</label>
                                <input {...register('workLocation')} className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
                        <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic border-b-2 border-black pb-4">NARRATIVE_INFORMATION</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">PERSONAL_SYNOPSIS</label>
                                <textarea
                                    {...register('about')}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                                    placeholder="ENTER_BIOGRAPHICAL_SYNTHESIS..."
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">PROFESSIONAL_AFFINITY</label>
                                <textarea
                                    {...register('jobLoves')}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                                    placeholder="ENTER_JOB_PREFERENCES..."
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">RECREATIONAL_INTERESTS</label>
                                <textarea
                                    {...register('interestsHobbies')}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                                    placeholder="ENTER_HOBBY_DATA..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all disabled:opacity-50 active:translate-x-1 active:translate-y-1"
                        >
                            {saving ? 'PROCESSING_UPDATE...' : 'EXECUTE_MODIFICATION'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
                        >
                            ABORT_OPERATION
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

