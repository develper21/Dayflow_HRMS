import { formatEmployeeName, generateRandomPassword } from '@/lib/employee-utils';

jest.mock('@/lib/db', () => ({
  prisma: {},
}));

describe('formatEmployeeName', () => {
  it('joins first and last names with a space', () => {
    expect(formatEmployeeName('Alex', 'Employee')).toBe('Alex Employee');
  });

  it('trims surrounding whitespace', () => {
    expect(formatEmployeeName(' Alex', 'Employee ')).toBe('Alex Employee');
  });
});

describe('generateRandomPassword', () => {
  it('creates a 12-character password with every required character class', () => {
    const password = generateRandomPassword();

    expect(password).toHaveLength(12);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*]/);
  });

  it('uses the requested length when it is at least four characters', () => {
    expect(generateRandomPassword(16)).toHaveLength(16);
  });
});
