'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

    return (
        <DashboardLayout
            companyName={session?.user?.companyName}
            companyLogo={session?.user?.companyLogo}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Link
                        href={`/admin/employees/${params.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block"
                    >
                        ← Back to Profile
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Employee Profile</h1>
                    <p className="text-gray-600 mt-2">Update employee information</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        {...register('name', {
                                            required: 'Name is required',
                                        })}
                                        error={errors.name?.message}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <Input
                                        {...register('phone', {
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: 'Phone must be 10 digits',
                                            },
                                        })}
                                        error={errors.phone?.message}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth
                                    </label>
                                    <Input {...register('dateOfBirth')} type="date" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        {...register('gender')}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Marital Status
                                    </label>
                                    <select
                                        {...register('maritalStatus')}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nationality
                                    </label>
                                    <Input {...register('nationality')} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Residing Address
                                    </label>
                                    <textarea
                                        {...register('residingAddress')}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Position
                                    </label>
                                    <Input {...register('jobPosition')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <Input {...register('department')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manager
                                    </label>
                                    <Input {...register('manager')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Work Location
                                    </label>
                                    <Input {...register('workLocation')} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    About
                                </label>
                                <textarea
                                    {...register('about')}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    placeholder="Tell us about the employee..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What I love about my job
                                </label>
                                <textarea
                                    {...register('jobLoves')}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    placeholder="What does the employee love about their job?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    My interests and hobbies
                                </label>
                                <textarea
                                    {...register('interestsHobbies')}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                                    placeholder="Employee interests and hobbies..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" loading={saving} variant="primary">
                            Save Changes
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.back()}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

