import {
  addEmployeeSchema,
  hrSignupSchema,
  loginSchema,
} from '@/lib/validations/auth';

describe('hrSignupSchema', () => {
  const validSignup = {
    companyName: 'Dayflow',
    name: 'Alex Employee',
    email: 'alex@example.com',
    phone: '1234567890',
    password: 'StrongPass1!',
    confirmPassword: 'StrongPass1!',
  };

  it('accepts valid company and HR signup details', () => {
    expect(hrSignupSchema.safeParse(validSignup).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = hrSignupSchema.safeParse({
      ...validSignup,
      confirmPassword: 'DifferentPass1!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('normalizes email addresses to lowercase', () => {
    const result = hrSignupSchema.safeParse({
      ...validSignup,
      email: 'ALEX@EXAMPLE.COM',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('alex@example.com');
    }
  });
});

describe('loginSchema', () => {
  it('requires both a login ID and a password', () => {
    expect(loginSchema.safeParse({ email: 'alex@example.com', password: 'secret' }).success)
      .toBe(true);
    expect(loginSchema.safeParse({ email: '', password: 'secret' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'alex@example.com', password: '' }).success)
      .toBe(false);
  });
});

describe('addEmployeeSchema', () => {
  const validEmployee = {
    firstName: 'Alex',
    lastName: 'Employee',
    email: 'alex@example.com',
    jobPosition: 'HR Manager',
    department: 'People',
    dateOfJoining: '2026-01-01',
  };

  it('accepts an employee with all required fields', () => {
    expect(addEmployeeSchema.safeParse(validEmployee).success).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(
      addEmployeeSchema.safeParse({ ...validEmployee, email: 'not-an-email' }).success,
    ).toBe(false);
  });
});
