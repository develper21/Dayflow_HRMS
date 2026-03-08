import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Dayflow HR - Human Resource Management System',
    description: 'Every workday, perfectly aligned.',
};

export default function HomePage() {
    // Redirect to login page
    redirect('/auth/login');
}
