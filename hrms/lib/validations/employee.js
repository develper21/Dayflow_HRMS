import { z } from 'zod';

// Add employee validation schema
export const addEmployeeSchema = z.object({
    // Personal Information
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address').toLowerCase(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    bloodGroup: z.string().optional(),

    // Address
    permanentAddress: z.string().optional(),
    currentAddress: z.string().optional(),

    // Documents
    panNumber: z.string().optional(),
    aadharNumber: z.string().optional(),

    // Professional Information
    department: z.string().min(2, 'Department is required'),
    designation: z.string().min(2, 'Designation is required'),
    dateOfJoining: z.string().min(1, 'Date of joining is required'),
    employeeType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),

    // Bank Details
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    branch: z.string().optional(),

    // Emergency Contact
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelation: z.string().optional(),

    // Salary Information
    monthlyWage: z.number().min(0, 'Monthly wage must be positive').optional(),
});

// Update employee profile schema
export const updateEmployeeSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^[0-9]{10}$/).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    bloodGroup: z.string().optional(),
    permanentAddress: z.string().optional(),
    currentAddress: z.string().optional(),
    panNumber: z.string().optional(),
    aadharNumber: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelation: z.string().optional(),
});
