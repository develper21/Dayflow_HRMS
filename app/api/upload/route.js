import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type'); // 'logo' or 'profile'

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine upload directory based on type
        const uploadDir = type === 'logo' ? 'logos' : 'profiles';
        const uploadsPath = join(process.cwd(), 'public', 'uploads', uploadDir);

        // Create directory if it doesn't exist
        if (!existsSync(uploadsPath)) {
            await mkdir(uploadsPath, { recursive: true });
        }

        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = file.name.split('.').pop();
        const filename = `${uniqueSuffix}.${extension}`;
        const filepath = join(uploadsPath, filename);

        // Write file
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${uploadDir}/${filename}`;

        return NextResponse.json(
            {
                message: 'File uploaded successfully',
                url: fileUrl,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
