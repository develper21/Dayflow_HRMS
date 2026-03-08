import { z } from 'zod';

// HR Signup validation schema (Company + HR User)
export const hrSignupSchema = z.object({
    // Company Information
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),

    // HR User Information
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').toLowerCase(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Login validation schema
export const loginSchema = z.object({
    email: z.string().min(1, 'Login ID or Email is required'),
    password: z.string().min(1, 'Password is required'),
});

// Add employee validation schema - ONLY REQUIRED FIELDS
export const addEmployeeSchema = z.object({
    // Required Personal Information
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Valid email is required').toLowerCase(),

    // Required Job Details
    jobPosition: z.string().min(2, 'Job position is required'),
    department: z.string().min(2, 'Department is required'),
    dateOfJoining: z.string().min(1, 'Date of joining is required'),

    // Optional fields
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    nationality: z.string().optional(),
    residingAddress: z.string().optional(),
    manager: z.string().optional(),
    workLocation: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    ifscCode: z.string().optional(),
    panNumber: z.string().optional(),
    uanNumber: z.string().optional(),
    monthlyWage: z.number().min(0).optional(),
});
