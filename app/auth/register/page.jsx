import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata = {
    title: 'Register - Dayflow HR',
    description: 'Create your HR account',
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
            {/* Industrial Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.02]"
                style={{ backgroundImage: 'linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo and Branding */}
                <div className="mb-8 text-center">
                    <div className="inline-block border-[3px] border-black p-3 mb-2 bg-white shadow-[6px_6px_0_0_#000]">
                        <h1 className="text-3xl font-black text-black tracking-widest italic uppercase">DAYFLOW_HR</h1>
                    </div>
                </div>

                {/* Register Box */}
                <div className="bg-white border-[3px] border-black p-10 shadow-[20px_20px_0_0_#000] relative">
                    <div className="absolute -top-4 -left-4 bg-blue-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest font-mono italic border-2 border-black">
                        PROTOCOL:ENTITY_CREATION
                    </div>

                    <div className="mb-10 border-b-2 border-black pb-6">
                        <h2 className="text-3xl font-black text-black uppercase italic leading-none mb-2">INITIALIZE_HR_ACCOUNT</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono italic">Register corporate entity and administrative credentials</p>
                    </div>

                    <SignupForm />
                </div>
            </div>
        </div>
    );
}
