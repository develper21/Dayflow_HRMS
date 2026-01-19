'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyEmailContent() {
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred during verification');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-600 mb-2">Dayflow</h1>
                    <p className="text-gray-600 italic">Every workday, perfectly aligned.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Email Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {status === 'verifying' && (
                            <div className="text-center py-8">
                                <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Verifying your email...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <p className="text-green-800 font-medium mb-6">{message}</p>
                                <Link href="/auth/login">
                                    <Button>Go to Login</Button>
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <p className="text-red-800 font-medium mb-6">{message}</p>
                                <Link href="/auth/register">
                                    <Button>Back to Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary-600 mb-2">Dayflow</h1>
                        <p className="text-gray-600 italic">Every workday, perfectly aligned.</p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Loading...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
