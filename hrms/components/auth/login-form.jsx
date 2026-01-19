'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                // Redirect will be handled by middleware based on role
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-600 border border-black shadow-[4px_4px_0_0_#000] flex items-center gap-3">
                    <div className="w-6 h-6 bg-white flex items-center justify-center font-black text-red-600 text-xs">!</div>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest font-mono">AUTH_ERROR: {error}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-mono">
                        01 // IDENTIFIER [ID_OR_EMAIL] <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('email')}
                        type="text"
                        placeholder="ENTER_ID_OR_EMAIL"
                        className={`w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono italic placeholder:text-gray-200 ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    {errors.email && <p className="text-[8px] font-black text-red-600 uppercase font-mono">{errors.email.message}</p>}
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] font-mono leading-none">
                        SYSTEM_FORMAT_V2: OIJODOXXXXXXXXXX
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block font-mono">
                        02 // CRITICAL_KEY [PASSWORD] <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('password')}
                        type="password"
                        placeholder="••••••••••••"
                        className={`w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono italic placeholder:text-gray-200 ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    {errors.password && <p className="text-[8px] font-black text-red-600 uppercase font-mono">{errors.password.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white text-xs font-black py-5 border-b-4 border-r-4 border-blue-600 uppercase tracking-[0.4em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:translate-x-1 active:translate-y-1 shadow-[8px_8px_0_0_#000] disabled:opacity-50 mt-4"
            >
                {loading ? 'INITIALIZING_SESSION...' : 'AUTHORIZE_ENTITY'}
            </button>

            <p className="text-sm text-gray-600 text-center">
                Don't have an account?{' '}
                <a href="/auth/register" className="text-primary-600 hover:underline">
                    Register as HR
                </a>
            </p>
        </form>
    );
}
