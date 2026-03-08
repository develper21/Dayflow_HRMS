import { PrismaClient } from '@prisma/client';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

class AnalyticsService {
  async getAttendanceAnalytics(userId = null, startDate = null, endDate = null) {
    const where = {
      ...(userId && { userId }),
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    const halfDays = attendance.filter(a => a.status === 'Half Day').length;

    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      halfDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      attendance
    };
  }

  async getPayrollAnalytics(userId = null, month = null, year = null) {
    const where = {
      ...(userId && { userId }),
      ...(month && { month }),
      ...(year && { year })
    };

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    const totalBasicSalary = payrolls.reduce((sum, p) => sum + p.basicSalary, 0);
    const totalAllowances = payrolls.reduce((sum, p) => sum + p.allowances, 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);
    const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

    return {
      totalEmployees: payrolls.length,
      totalBasicSalary,
      totalAllowances,
      totalDeductions,
      totalNetSalary,
      averageSalary: payrolls.length > 0 ? totalNetSalary / payrolls.length : 0,
      payrolls
    };
  }

  async getLeaveAnalytics(userId = null, startDate = null, endDate = null) {
    const where = {
      ...(userId && { userId }),
      ...(startDate && endDate && {
        startDate: {
          gte: startDate
        },
        endDate: {
          lte: endDate
        }
      })
    };

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const leaveByType = leaveRequests.reduce((acc, leave) => {
      acc[leave.type] = (acc[leave.type] || 0) + leave.days;
      return acc;
    }, {});

    const leaveByStatus = leaveRequests.reduce((acc, leave) => {
      acc[leave.status] = (acc[leave.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRequests: leaveRequests.length,
      totalLeaveDays: leaveRequests.reduce((sum, leave) => sum + (leave.days || 0), 0),
      leaveByType,
      leaveByStatus,
      leaveRequests
    };
  }

  async getEmployeeAnalytics() {
    const totalEmployees = await prisma.user.count({
      where: { role: 'EMPLOYEE' }
    });

    const employeesByDepartment = await prisma.jobDetails.groupBy({
      by: ['department'],
      _count: {
        department: true
      }
    });

    const recentEmployees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        jobDetails: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      totalEmployees,
      employeesByDepartment,
      recentEmployees
    };
  }

  async getPerformanceAnalytics() {
    const performanceReviews = await prisma.performanceReview.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRatings = performanceReviews.reduce((acc, review) => {
      Object.keys(acc).forEach(key => {
        if (review[key]) {
          acc[key] = (acc[key] * (acc.count || 0) + review[key]) / ((acc.count || 0) + 1);
          acc.count = (acc.count || 0) + 1;
        }
      });
      return acc;
    }, { count: 0 });

    delete averageRatings.count;

    const performanceByPeriod = performanceReviews.reduce((acc, review) => {
      acc[review.reviewPeriod] = (acc[review.reviewPeriod] || 0) + 1;
      return acc;
    }, {});

    return {
      totalReviews: performanceReviews.length,
      averageRatings,
      performanceByPeriod,
      performanceReviews
    };
  }

  async getTrainingAnalytics() {
    const trainings = await prisma.training.findMany({
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalTrainings = trainings.length;
    const totalEnrollments = trainings.reduce((sum, t) => sum + t.enrollments.length, 0);
    const completedTrainings = trainings.reduce((sum, t) => 
      sum + t.enrollments.filter(e => e.status === 'COMPLETED').length, 0
    );

    const trainingByCategory = trainings.reduce((acc, training) => {
      acc[training.category] = (acc[training.category] || 0) + 1;
      return acc;
    }, {});

    const enrollmentByStatus = trainings.reduce((acc, training) => {
      training.enrollments.forEach(enrollment => {
        acc[enrollment.status] = (acc[enrollment.status] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      totalTrainings,
      totalEnrollments,
      completedTrainings,
      completionRate: totalEnrollments > 0 ? (completedTrainings / totalEnrollments) * 100 : 0,
      trainingByCategory,
      enrollmentByStatus,
      trainings
    };
  }

  async getRecruitmentAnalytics() {
    const jobPostings = await prisma.jobPosting.findMany({
      include: {
        applications: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalPostings = jobPostings.length;
    const totalApplications = jobPostings.reduce((sum, posting) => sum + posting.applications.length, 0);

    const applicationsByStatus = jobPostings.reduce((acc, posting) => {
      posting.applications.forEach(app => {
        acc[app.status] = (acc[app.status] || 0) + 1;
      });
      return acc;
    }, {});

    const postingsByDepartment = jobPostings.reduce((acc, posting) => {
      acc[posting.department] = (acc[posting.department] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPostings,
      totalApplications,
      averageApplicationsPerPosting: totalPostings > 0 ? totalApplications / totalPostings : 0,
      applicationsByStatus,
      postingsByDepartment,
      jobPostings
    };
  }

  async getDashboardAnalytics(userId = null) {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const lastMonth = subMonths(today, 1);

    const [
      attendanceAnalytics,
      payrollAnalytics,
      leaveAnalytics,
      employeeAnalytics,
      performanceAnalytics,
      trainingAnalytics,
      recruitmentAnalytics
    ] = await Promise.all([
      this.getAttendanceAnalytics(userId, thirtyDaysAgo, today),
      this.getPayrollAnalytics(userId, today.getMonth() + 1, today.getFullYear()),
      this.getLeaveAnalytics(userId, lastMonth, today),
      userId ? Promise.resolve({}) : this.getEmployeeAnalytics(),
      userId ? Promise.resolve({}) : this.getPerformanceAnalytics(),
      userId ? Promise.resolve({}) : this.getTrainingAnalytics(),
      userId ? Promise.resolve({}) : this.getRecruitmentAnalytics()
    ]);

    return {
      attendance: attendanceAnalytics,
      payroll: payrollAnalytics,
      leave: leaveAnalytics,
      employees: employeeAnalytics,
      performance: performanceAnalytics,
      training: trainingAnalytics,
      recruitment: recruitmentAnalytics
    };
  }

  async getTrendAnalytics(type = 'attendance', period = 'monthly') {
    const periods = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };

    const days = periods[period] || 30;
    const today = new Date();
    const startDate = subDays(today, days);

    let data = [];

    switch (type) {
      case 'attendance':
        data = await this.getAttendanceTrend(startDate, today);
        break;
      case 'payroll':
        data = await this.getPayrollTrend(startDate, today);
        break;
      case 'leave':
        data = await this.getLeaveTrend(startDate, today);
        break;
      default:
        throw new Error(`Unsupported trend type: ${type}`);
    }

    return data;
  }

  async getAttendanceTrend(startDate, endDate) {
    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        status: true
      }
    });

    const dailyStats = attendance.reduce((acc, record) => {
      const date = format(record.date, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, present: 0, absent: 0, halfDay: 0, total: 0 };
      }
      acc[date][record.status.toLowerCase().replace(' ', '')] = 
        (acc[date][record.status.toLowerCase().replace(' ', '')] || 0) + 1;
      acc[date].total += 1;
      return acc;
    }, {});

    return Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getPayrollTrend(startDate, endDate) {
    // For payroll trends, we'll look at monthly data
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      months.push({
        month: current.getMonth() + 1,
        year: current.getFullYear()
      });
      current.setMonth(current.getMonth() + 1);
    }

    const monthlyData = await Promise.all(
      months.map(async ({ month, year }) => {
        const payroll = await this.getPayrollAnalytics(null, month, year);
        return {
          month,
          year,
          totalNetSalary: payroll.totalNetSalary,
          employeeCount: payroll.totalEmployees
        };
      })
    );

    return monthlyData;
  }

  async getLeaveTrend(startDate, endDate) {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        startDate: true,
        type: true,
        days: true,
        status: true
      }
    });

    const monthlyStats = leaveRequests.reduce((acc, leave) => {
      const month = format(leave.startDate, 'yyyy-MM');
      if (!acc[month]) {
        acc[month] = { month, paid: 0, sick: 0, unpaid: 0, total: 0 };
      }
      acc[month][leave.type.toLowerCase()] += leave.days || 0;
      acc[month].total += leave.days || 0;
      return acc;
    }, {});

    return Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month));
  }
}

export default AnalyticsService;
