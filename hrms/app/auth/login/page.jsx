import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
    title: 'Sign In - Dayflow HR',
    description: 'Sign in to your Dayflow account',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
            {/* Industrial Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Branding */}
                <div className="mb-10 text-center">
                    <div className="inline-block border-[4px] border-black p-4 mb-4 bg-white shadow-[8px_8px_0_0_#000]">
                        <h1 className="text-5xl font-black text-black tracking-tighter italic uppercase">DAYFLOW</h1>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-[2px] w-8 bg-black"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono">PROTOCOL_INIT_SEQ_01</p>
                        <div className="h-[2px] w-8 bg-black"></div>
                    </div>
                </div>

                {/* Login Card - Replaced with Lined Box */}
                <div className="bg-white border-[3px] border-black p-8 shadow-[16px_16px_0_0_#000] relative">
                    <div className="absolute -top-4 -left-4 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest font-mono italic">
                        ACCESS_TERMINAL
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-black uppercase italic leading-none mb-2">SYSTEM_SIGN_IN</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Input credentials to authorize session</p>
                    </div>

                    <LoginForm />

                    <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-200 text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">
                            No account detected?{' '}
                            <Link
                                href="/auth/register"
                                className="text-black hover:text-blue-600 underline underline-offset-4 decoration-2 transition-colors"
                            >
                                EXECUTE_REGISTRATION
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
