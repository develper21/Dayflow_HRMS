const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Dayflow Technologies',
      logo: '/logo.png'
    }
  });
  console.log('✅ Company created:', company.name);

  // Create users with different roles
  const adminPassword = await bcrypt.hash('admin123', 10);
  const hrPassword = await bcrypt.hash('hr123', 10);
  const employeePassword = await bcrypt.hash('emp123', 10);

  const admin = await prisma.user.create({
    data: {
      employeeId: 'EMP2024001',
      email: 'admin@dayflow.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+1234567890',
      role: 'ADMIN',
      companyId: company.id,
      emailVerified: true
    }
  });

  const hr = await prisma.user.create({
    data: {
      employeeId: 'EMP2024002',
      email: 'hr@dayflow.com',
      password: hrPassword,
      name: 'HR Manager',
      phone: '+1234567891',
      role: 'ADMIN',
      companyId: company.id,
      emailVerified: true
    }
  });

  const employee1 = await prisma.user.create({
    data: {
      employeeId: 'EMP2024003',
      email: 'employee@dayflow.com',
      password: employeePassword,
      name: 'John Doe',
      phone: '+1234567892',
      role: 'EMPLOYEE',
      companyId: company.id,
      emailVerified: true
    }
  });

  const employee2 = await prisma.user.create({
    data: {
      employeeId: 'EMP2024004',
      email: 'jane.smith@dayflow.com',
      password: employeePassword,
      name: 'Jane Smith',
      phone: '+1234567893',
      role: 'EMPLOYEE',
      companyId: company.id,
      emailVerified: true
    }
  });

  console.log('✅ Users created');

  // Create employee profiles
  await prisma.employeeProfile.createMany({
    data: [
      {
        userId: employee1.id,
        dateOfBirth: new Date('1990-01-15'),
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'US',
        personalEmail: 'john.doe.personal@gmail.com',
        residingAddress: '123 Main St, New York, NY 10001',
        about: 'Experienced software developer with expertise in web technologies.',
        jobLoves: 'Problem solving and creating innovative solutions',
        interestsHobbies: 'Coding, reading, and hiking',
        accountNumber: '1234567890',
        bankName: 'Chase Bank',
        ifscCode: 'CHASUS33',
        panNumber: 'ABCDE1234F',
        uanNumber: '123456789012'
      },
      {
        userId: employee2.id,
        dateOfBirth: new Date('1992-05-20'),
        gender: 'Female',
        maritalStatus: 'Married',
        nationality: 'US',
        personalEmail: 'jane.smith.personal@gmail.com',
        residingAddress: '456 Oak Ave, Los Angeles, CA 90001',
        about: 'HR professional with experience in talent management.',
        jobLoves: 'Helping people grow and develop their careers',
        interestsHobbies: 'Yoga, cooking, and travel',
        accountNumber: '0987654321',
        bankName: 'Bank of America',
        ifscCode: 'BOFAUS3N',
        panNumber: 'FGHIJ5678K',
        uanNumber: '987654321098'
      }
    ]
  });

  // Create job details
  await prisma.jobDetails.createMany({
    data: [
      {
        userId: employee1.id,
        jobPosition: 'Senior Software Engineer',
        department: 'Engineering',
        manager: hr.name,
        workLocation: 'New York Office',
        dateOfJoining: new Date('2022-01-15')
      },
      {
        userId: employee2.id,
        jobPosition: 'HR Specialist',
        department: 'Human Resources',
        manager: hr.name,
        workLocation: 'Los Angeles Office',
        dateOfJoining: new Date('2021-06-01')
      }
    ]
  });

  // Create salary structures
  await prisma.salaryStructure.createMany({
    data: [
      {
        userId: employee1.id,
        monthlyWage: 8000,
        yearlyWage: 96000,
        workingDaysPerWeek: 5,
        basicSalary: 5000,
        basicSalaryPercent: 62.5,
        houseRentAllowance: 1500,
        hraPercent: 18.75,
        standardAllowance: 800,
        performanceBonus: 500,
        performanceBonusPercent: 6.25,
        leaveTravelAllowance: 200,
        ltaPercent: 2.5,
        employeePF: 600,
        employeePFPercent: 7.5,
        employerPF: 600,
        employerPFPercent: 7.5,
        professionalTax: 200
      },
      {
        userId: employee2.id,
        monthlyWage: 6000,
        yearlyWage: 72000,
        workingDaysPerWeek: 5,
        basicSalary: 3750,
        basicSalaryPercent: 62.5,
        houseRentAllowance: 1125,
        hraPercent: 18.75,
        standardAllowance: 600,
        performanceBonus: 375,
        performanceBonusPercent: 6.25,
        leaveTravelAllowance: 150,
        ltaPercent: 2.5,
        employeePF: 450,
        employeePFPercent: 7.5,
        employerPF: 450,
        employerPFPercent: 7.5,
        professionalTax: 150
      }
    ]
  });

  // Create attendance records for the last 30 days
  const attendanceRecords = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Employee 1 attendance
    attendanceRecords.push({
      userId: employee1.id,
      date: date,
      checkIn: new Date(date.setHours(9, 5, 0, 0)),
      checkOut: new Date(date.setHours(18, 30, 0, 0)),
      status: 'Present'
    });
    
    // Employee 2 attendance (with some variations)
    if (i % 5 === 0) {
      attendanceRecords.push({
        userId: employee2.id,
        date: date,
        status: 'Half Day'
      });
    } else if (i % 10 === 0) {
      attendanceRecords.push({
        userId: employee2.id,
        date: date,
        status: 'Absent'
      });
    } else {
      attendanceRecords.push({
        userId: employee2.id,
        date: date,
        checkIn: new Date(date.setHours(9, 15, 0, 0)),
        checkOut: new Date(date.setHours(17, 45, 0, 0)),
        status: 'Present'
      });
    }
  }

  await prisma.attendance.createMany({
    data: attendanceRecords
  });

  // Create leave requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: employee1.id,
        type: 'PAID',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
        endDate: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000),
        days: 2,
        status: 'PENDING',
        reason: 'Family vacation'
      },
      {
        userId: employee2.id,
        type: 'SICK',
        startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        days: 1,
        status: 'APPROVED',
        reason: 'Medical appointment',
        adminComment: 'Approved with medical certificate'
      }
    ]
  });

  // Create payroll for current month
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  await prisma.payroll.createMany({
    data: [
      {
        userId: employee1.id,
        month: currentMonth,
        year: currentYear,
        status: 'PAID',
        basicSalary: 5000,
        allowances: 3000,
        deductions: 800,
        netSalary: 7200
      },
      {
        userId: employee2.id,
        month: currentMonth,
        year: currentYear,
        status: 'PAID',
        basicSalary: 3750,
        allowances: 2250,
        deductions: 600,
        netSalary: 5400
      }
    ]
  });

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: employee1.id,
        type: 'LEAVE_UPDATE',
        title: 'Leave Request Submitted',
        message: 'Your leave request for 2 days has been submitted and is pending approval.',
        priority: 'NORMAL',
        category: 'SYSTEM'
      },
      {
        userId: employee2.id,
        type: 'PAYROLL_GENERATED',
        title: 'Payroll Generated',
        message: 'Your payroll for this month has been generated.',
        priority: 'HIGH',
        category: 'SYSTEM'
      },
      {
        userId: hr.id,
        type: 'LEAVE_PENDING',
        title: 'Leave Request Pending',
        message: 'John Doe has submitted a leave request for your approval.',
        priority: 'HIGH',
        category: 'EMAIL',
        actionUrl: '/admin/leave',
        actionText: 'Review Request'
      }
    ]
  });

  // Create performance reviews
  await prisma.performanceReview.createMany({
    data: [
      {
        userId: employee1.id,
        reviewPeriod: 'Q1-2024',
        reviewType: 'QUARTERLY',
        qualityRating: 4.5,
        quantityRating: 4.0,
        teamworkRating: 4.2,
        initiativeRating: 4.3,
        attendanceRating: 4.8,
        overallRating: 4.36,
        strengths: 'Excellent problem-solving skills, strong technical knowledge',
        weaknesses: 'Could improve in documentation',
        goals: 'Complete 3 certifications, mentor junior developers',
        recommendations: 'Focus on leadership skills',
        status: 'APPROVED',
        reviewedBy: hr.id,
        reviewedAt: new Date()
      },
      {
        userId: employee2.id,
        reviewPeriod: 'Q1-2024',
        reviewType: 'QUARTERLY',
        qualityRating: 4.2,
        quantityRating: 4.5,
        teamworkRating: 4.8,
        initiativeRating: 4.0,
        attendanceRating: 4.5,
        overallRating: 4.4,
        strengths: 'Great team player, excellent communication skills',
        weaknesses: 'Could be more proactive in process improvements',
        goals: 'Complete HR analytics course, improve recruitment process',
        recommendations: 'Take on more strategic initiatives',
        status: 'APPROVED',
        reviewedBy: hr.id,
        reviewedAt: new Date()
      }
    ]
  });

  // Create training programs
  const training1 = await prisma.training.create({
    data: {
      title: 'Advanced JavaScript Concepts',
      description: 'Deep dive into advanced JavaScript patterns and best practices',
      category: 'TECHNICAL',
      duration: 40,
      cost: 500,
      instructor: 'John Smith',
      startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'PLANNED'
    }
  });

  const training2 = await prisma.training.create({
    data: {
      title: 'Leadership Excellence',
      description: 'Develop essential leadership skills for career growth',
      category: 'SOFT_SKILLS',
      duration: 24,
      cost: 750,
      instructor: 'Sarah Johnson',
      startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
      status: 'PLANNED'
    }
  });

  // Create training enrollments
  await prisma.trainingEnrollment.createMany({
    data: [
      {
        userId: employee1.id,
        trainingId: training1.id,
        status: 'ENROLLED',
        progress: 0
      },
      {
        userId: employee1.id,
        trainingId: training2.id,
        status: 'ENROLLED',
        progress: 0
      },
      {
        userId: employee2.id,
        trainingId: training2.id,
        status: 'ENROLLED',
        progress: 0
      }
    ]
  });

  // Create job postings
  await prisma.jobPosting.createMany({
    data: [
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced frontend developer to join our engineering team.',
        department: 'Engineering',
        location: 'New York',
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        salaryRange: '$80,000 - $120,000',
        status: 'ACTIVE',
        postedBy: hr.id,
        deadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'HR Coordinator',
        description: 'Seeking an HR coordinator to support our growing team.',
        department: 'Human Resources',
        location: 'Los Angeles',
        employmentType: 'FULL_TIME',
        experienceLevel: 'ENTRY',
        salaryRange: '$45,000 - $65,000',
        status: 'ACTIVE',
        postedBy: hr.id,
        deadline: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Create sample job applications
  const jobPostings = await prisma.jobPosting.findMany();
  
  await prisma.jobApplication.createMany({
    data: [
      {
        jobPostingId: jobPostings[0].id,
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1234567894',
        resumeUrl: '/resumes/michael_brown.pdf',
        coverLetter: 'Experienced frontend developer with 5+ years of experience...',
        status: 'SCREENING'
      },
      {
        jobPostingId: jobPostings[1].id,
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1234567895',
        resumeUrl: '/resumes/emily_davis.pdf',
        coverLetter: 'Recent HR graduate looking for opportunities...',
        status: 'INTERVIEW'
      }
    ]
  });

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        resource: 'USER',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: hr.id,
        action: 'CREATE',
        resource: 'LEAVE_REQUEST',
        resourceId: employee1.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: employee1.id,
        action: 'VIEW',
        resource: 'PAYROLL',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ]
  });

  // Create company settings
  await prisma.companySettings.create({
    data: {
      companyId: company.id,
      year: currentYear,
      lastSerialNumber: 4
    }
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📧 Login Credentials:');
  console.log('Admin: admin@dayflow.com / admin123');
  console.log('HR: hr@dayflow.com / hr123');
  console.log('Employee: employee@dayflow.com / emp123');
  console.log('Employee 2: jane.smith@dayflow.com / emp123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
