import { AddEmployeeForm } from '@/components/admin/add-employee-form';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const metadata = {
    title: 'Add New Employee - Dayflow HR',
    description: 'Add a new employee to the system',
};

export default function AddEmployeePage() {
    return (
        <div className="min-h-screen text-black flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-12" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fafafa'
            }}>
                <div className="mb-12 border-l-8 border-black pl-8">
                    <h2 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">REGISTRATION_FLOW / ENTITY_CREATION</h2>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight italic">Initialize New Member</h1>
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-2">Provisioning system credentials and administrative parameters</p>
                </div>
                <AddEmployeeForm />
            </main>
        </div>
    );
}
