import { prisma } from './db';

/**
 * Generate Employee ID in format: OIJODO20220001
 * OI = Company (Odoo India)
 * JODO = First 2 letters of first name + first 2 letters of last name
 * 2022 = Year of joining
 * 0001 = Serial number for that year
 */
export async function generateEmployeeId(firstName, lastName, yearOfJoining, companyId) {
    // Extract first 2 letters from first and last name
    const firstNamePart = firstName.substring(0, 2).toUpperCase();
    const lastNamePart = lastName.substring(0, 2).toUpperCase();

    // Get or create company settings for the year
    let settings = await prisma.companySettings.findUnique({
        where: {
            companyId_year: {
                companyId: companyId,
                year: yearOfJoining,
            },
        },
    });

    if (!settings) {
        settings = await prisma.companySettings.create({
            data: {
                companyId: companyId,
                year: yearOfJoining,
                lastSerialNumber: 0,
            },
        });
    }

    // Increment serial number
    const newSerialNumber = settings.lastSerialNumber + 1;

    // Update settings
    await prisma.companySettings.update({
        where: {
            companyId_year: {
                companyId: companyId,
                year: yearOfJoining,
            },
        },
        data: { lastSerialNumber: newSerialNumber },
    });

    // Format serial number with leading zeros (4 digits)
    const serialNumberFormatted = String(newSerialNumber).padStart(4, '0');

    // Construct employee ID
    const employeeId = `OI${firstNamePart}${lastNamePart}${yearOfJoining}${serialNumberFormatted}`;

    return employeeId;
}

/**
 * Generate a random secure password
 * 12 characters with uppercase, lowercase, numbers, and special characters
 */
export function generateRandomPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Format employee name from first and last name
 */
export function formatEmployeeName(firstName, lastName) {
    return `${firstName} ${lastName}`.trim();
}
