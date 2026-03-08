'use client';

import { SessionProvider } from 'next-auth/react';
import './globals.css';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="font-sans antialiased">
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
