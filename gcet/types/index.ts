export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  profilePictureUrl?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'present' | 'absent' | 'leave';
  profilePictureUrl?: string;
}

export interface LeaveRequest {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  leaveType: 'paid' | 'sick' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approverComments?: string;
}

export interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  dateOfJoining?: string;
  nationality?: string;
  personalEmail?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    panNumber: string;
    uanNumber: string;
    empCode: string;
  };
  salaryStructure?: {
    baseSalary: number;
    basicPercentage: number;
    hraPercentage: number;
    standardAllowance: number;
    performanceBonusPercentage: number;
    ltaPercentage: number;
    pfEmployeeRate: number;
    pfEmployerRate: number;
    professionalTax: number;
  };
}
