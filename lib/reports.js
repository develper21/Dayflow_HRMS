import { PrismaClient } from '@prisma/client';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import fs from 'fs/promises';

const prisma = new PrismaClient();

class ReportService {
  async createReport(data) {
    try {
      const report = await prisma.report.create({
        data: {
          ...data,
          status: 'GENERATING',
          createdAt: new Date()
        }
      });

      // Generate report in background
      this.generateReportFile(report).catch(console.error);

      return report;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async generateReportFile(report) {
    try {
      let fileUrl, fileSize;

      switch (report.type) {
        case 'ATTENDANCE':
          ({ fileUrl, fileSize } = await this.generateAttendanceReport(report));
          break;
        case 'PAYROLL':
          ({ fileUrl, fileSize } = await this.generatePayrollReport(report));
          break;
        case 'LEAVE':
          ({ fileUrl, fileSize } = await this.generateLeaveReport(report));
          break;
        case 'PERFORMANCE':
          ({ fileUrl, fileSize } = await this.generatePerformanceReport(report));
          break;
        case 'EMPLOYEE':
          ({ fileUrl, fileSize } = await this.generateEmployeeReport(report));
          break;
        default:
          throw new Error(`Unsupported report type: ${report.type}`);
      }

      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETED',
          fileUrl,
          fileSize
        }
      });
    } catch (error) {
      console.error('Error generating report file:', error);
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'FAILED'
        }
      });
    }
  }

  async generateAttendanceReport(report) {
    const parameters = JSON.parse(report.parameters || '{}');
    const { startDate, endDate, userId } = parameters;

    const where = {
      ...(userId && { userId }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
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
            email: true,
            employeeId: true
          }
        }
      },
      orderBy: [
        { user: { name: 'asc' } },
        { date: 'asc' }
      ]
    });

    if (report.format === 'PDF') {
      return await this.generateAttendancePDF(attendance, report);
    } else if (report.format === 'EXCEL') {
      return await this.generateAttendanceExcel(attendance, report);
    } else {
      throw new Error(`Unsupported format: ${report.format}`);
    }
  }

  async generateAttendancePDF(attendance, report) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;
    const fontSize = 12;
    const lineHeight = 20;

    // Title
    page.drawText('Attendance Report', {
      x: margin,
      y,
      size: 24,
      font: boldFont
    });
    y -= lineHeight * 1.5;

    // Generated date
    page.drawText(`Generated: ${format(new Date(), 'PPP')}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight * 2;

    // Table headers
    const headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Status'];
    const colWidths = [120, 80, 70, 70, 60];
    let x = margin;

    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: fontSize, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    // Draw line under headers
    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: width - margin, y: y + 5 },
      thickness: 1
    });
    y -= 10;

    // Data rows
    for (const record of attendance) {
      if (y < 60) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - 50;
      }

      x = margin;
      const row = [
        record.user.name,
        format(record.date, 'PPP'),
        record.checkIn ? format(record.checkIn, 'p') : 'N/A',
        record.checkOut ? format(record.checkOut, 'p') : 'N/A',
        record.status || 'N/A'
      ];

      row.forEach((cell, i) => {
        page.drawText(String(cell).substring(0, 20), { x, y, size: 10, font });
        x += colWidths[i];
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `attendance_report_${Date.now()}.pdf`;
    const filePath = `public/reports/${fileName}`;
    await fs.writeFile(filePath, pdfBytes);

    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: pdfBytes.length
    };
  }

  async generateAttendanceExcel(attendance, report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');
    
    // Headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Check In', key: 'checkIn', width: 15 },
      { header: 'Check Out', key: 'checkOut', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    
    // Data
    attendance.forEach(record => {
      worksheet.addRow({
        employeeId: record.user.employeeId,
        name: record.user.name,
        email: record.user.email,
        date: format(record.date, 'PPP'),
        checkIn: record.checkIn ? format(record.checkIn, 'p') : 'N/A',
        checkOut: record.checkOut ? format(record.checkOut, 'p') : 'N/A',
        status: record.status || 'N/A'
      });
    });
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Save Excel file
    const fileName = `attendance_report_${Date.now()}.xlsx`;
    const filePath = `public/reports/${fileName}`;
    await workbook.xlsx.writeFile(filePath);
    
    const stats = await fs.stat(filePath);
    
    return {
      fileUrl: filePath,
      fileSize: stats.size
    };
  }

  async generatePayrollReport(report) {
    const parameters = JSON.parse(report.parameters || '{}');
    const { month, year, userId } = parameters;

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
            email: true,
            employeeId: true
          }
        }
      },
      orderBy: { user: { name: 'asc' } }
    });

    if (report.format === 'PDF') {
      return await this.generatePayrollPDF(payrolls, report);
    } else if (report.format === 'EXCEL') {
      return await this.generatePayrollExcel(payrolls, report);
    }
  }

  async generatePayrollPDF(payrolls, report) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;
    const fontSize = 12;
    const lineHeight = 20;

    page.drawText('Payroll Report', {
      x: margin,
      y,
      size: 24,
      font: boldFont
    });
    y -= lineHeight * 1.5;

    page.drawText(`Generated: ${format(new Date(), 'PPP')}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight;

    const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    page.drawText(`Total Net Salary: $${totalNetSalary.toFixed(2)}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight;

    page.drawText(`Number of Employees: ${payrolls.length}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight * 2;

    const headers = ['Employee', 'Month', 'Basic', 'Allowances', 'Deductions', 'Net Salary'];
    const colWidths = [100, 50, 60, 60, 60, 60];
    let x = margin;

    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: fontSize, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: width - margin, y: y + 5 },
      thickness: 1
    });
    y -= 10;

    for (const payroll of payrolls) {
      if (y < 60) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - 50;
      }

      x = margin;
      const row = [
        payroll.user.name,
        `${payroll.month}/${payroll.year}`,
        `$${payroll.basicSalary.toFixed(2)}`,
        `$${payroll.allowances.toFixed(2)}`,
        `$${payroll.deductions.toFixed(2)}`,
        `$${payroll.netSalary.toFixed(2)}`
      ];

      row.forEach((cell, i) => {
        page.drawText(String(cell).substring(0, 18), { x, y, size: 10, font });
        x += colWidths[i];
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `payroll_report_${Date.now()}.pdf`;
    const filePath = `public/reports/${fileName}`;
    await fs.writeFile(filePath, pdfBytes);

    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: pdfBytes.length
    };
  }

  async generatePayrollExcel(payrolls, report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');
    
    // Headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'Allowances', key: 'allowances', width: 15 },
      { header: 'Deductions', key: 'deductions', width: 15 },
      { header: 'Net Salary', key: 'netSalary', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];
    
    // Data
    payrolls.forEach(payroll => {
      worksheet.addRow({
        employeeId: payroll.user.employeeId,
        name: payroll.user.name,
        email: payroll.user.email,
        month: payroll.month,
        year: payroll.year,
        basicSalary: payroll.basicSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        netSalary: payroll.netSalary,
        status: payroll.status
      });
    });
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Save Excel file
    const fileName = `payroll_report_${Date.now()}.xlsx`;
    const filePath = `public/reports/${fileName}`;
    await workbook.xlsx.writeFile(filePath);
    
    const stats = await fs.stat(filePath);
    
    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: stats.size
    };
  }

  async generateLeaveReport(report) {
    const parameters = JSON.parse(report.parameters || '{}');
    const { startDate, endDate, userId, status } = parameters;

    const where = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        startDate: {
          gte: new Date(startDate)
        },
        endDate: {
          lte: new Date(endDate)
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
            email: true,
            employeeId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (report.format === 'PDF') {
      return await this.generateLeavePDF(leaveRequests, report);
    } else if (report.format === 'EXCEL') {
      return await this.generateLeaveExcel(leaveRequests, report);
    }
  }

  async generateLeavePDF(leaveRequests, report) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;
    const fontSize = 12;
    const lineHeight = 20;

    page.drawText('Leave Report', {
      x: margin,
      y,
      size: 24,
      font: boldFont
    });
    y -= lineHeight * 1.5;

    page.drawText(`Generated: ${format(new Date(), 'PPP')}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight * 2;

    const headers = ['Employee', 'Type', 'Start Date', 'End Date', 'Days', 'Status'];
    const colWidths = [100, 60, 80, 80, 40, 60];
    let x = margin;

    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: fontSize, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: width - margin, y: y + 5 },
      thickness: 1
    });
    y -= 10;

    for (const leave of leaveRequests) {
      if (y < 60) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - 50;
      }

      x = margin;
      const row = [
        leave.user.name,
        leave.type,
        format(leave.startDate, 'PPP'),
        format(leave.endDate, 'PPP'),
        leave.days?.toString() || '0',
        leave.status
      ];

      row.forEach((cell, i) => {
        page.drawText(String(cell).substring(0, 15), { x, y, size: 10, font });
        x += colWidths[i];
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `leave_report_${Date.now()}.pdf`;
    const filePath = `public/reports/${fileName}`;
    await fs.writeFile(filePath, pdfBytes);

    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: pdfBytes.length
    };
  }

  async generateLeaveExcel(leaveRequests, report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leave Report');
    
    // Headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Leave Type', key: 'type', width: 15 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Days', key: 'days', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Reason', key: 'reason', width: 30 }
    ];
    
    // Data
    leaveRequests.forEach(leave => {
      worksheet.addRow({
        employeeId: leave.user.employeeId,
        name: leave.user.name,
        email: leave.user.email,
        type: leave.type,
        startDate: format(leave.startDate, 'PPP'),
        endDate: format(leave.endDate, 'PPP'),
        days: leave.days,
        status: leave.status,
        reason: leave.reason
      });
    });
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Save Excel file
    const fileName = `leave_report_${Date.now()}.xlsx`;
    const filePath = `public/reports/${fileName}`;
    await workbook.xlsx.writeFile(filePath);
    
    const stats = await fs.stat(filePath);
    
    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: stats.size
    };
  }

  async generatePerformanceReport(report) {
    const parameters = JSON.parse(report.parameters || '{}');
    const { reviewPeriod, reviewType, userId } = parameters;

    const where = {
      ...(userId && { userId }),
      ...(reviewPeriod && { reviewPeriod }),
      ...(reviewType && { reviewType })
    };

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (report.format === 'PDF') {
      return await this.generatePerformancePDF(reviews, report);
    } else if (report.format === 'EXCEL') {
      return await this.generatePerformanceExcel(reviews, report);
    }
  }

  async generatePerformancePDF(reviews, report) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;
    const fontSize = 12;
    const lineHeight = 20;

    page.drawText('Performance Review Report', {
      x: margin,
      y,
      size: 24,
      font: boldFont
    });
    y -= lineHeight * 1.5;

    page.drawText(`Generated: ${format(new Date(), 'PPP')}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight * 2;

    const headers = ['Employee', 'Period', 'Type', 'Overall Rating', 'Status'];
    const colWidths = [100, 80, 60, 80, 60];
    let x = margin;

    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: fontSize, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: width - margin, y: y + 5 },
      thickness: 1
    });
    y -= 10;

    for (const review of reviews) {
      if (y < 60) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - 50;
      }

      x = margin;
      const row = [
        review.user.name,
        review.reviewPeriod,
        review.reviewType,
        review.overallRating?.toFixed(2) || 'N/A',
        review.status
      ];

      row.forEach((cell, i) => {
        page.drawText(String(cell).substring(0, 18), { x, y, size: 10, font });
        x += colWidths[i];
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `performance_report_${Date.now()}.pdf`;
    const filePath = `public/reports/${fileName}`;
    await fs.writeFile(filePath, pdfBytes);

    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: pdfBytes.length
    };
  }

  async generatePerformanceExcel(reviews, report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performance Review Report');
    
    // Headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Review Period', key: 'reviewPeriod', width: 15 },
      { header: 'Review Type', key: 'reviewType', width: 15 },
      { header: 'Quality Rating', key: 'qualityRating', width: 15 },
      { header: 'Quantity Rating', key: 'quantityRating', width: 15 },
      { header: 'Teamwork Rating', key: 'teamworkRating', width: 15 },
      { header: 'Initiative Rating', key: 'initiativeRating', width: 15 },
      { header: 'Attendance Rating', key: 'attendanceRating', width: 15 },
      { header: 'Overall Rating', key: 'overallRating', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    
    // Data
    reviews.forEach(review => {
      worksheet.addRow({
        employeeId: review.user.employeeId,
        name: review.user.name,
        email: review.user.email,
        reviewPeriod: review.reviewPeriod,
        reviewType: review.reviewType,
        qualityRating: review.qualityRating,
        quantityRating: review.quantityRating,
        teamworkRating: review.teamworkRating,
        initiativeRating: review.initiativeRating,
        attendanceRating: review.attendanceRating,
        overallRating: review.overallRating,
        status: review.status
      });
    });
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Save Excel file
    const fileName = `performance_report_${Date.now()}.xlsx`;
    const filePath = `public/reports/${fileName}`;
    await workbook.xlsx.writeFile(filePath);
    
    const stats = await fs.stat(filePath);
    
    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: stats.size
    };
  }

  async generateEmployeeReport(report) {
    const parameters = JSON.parse(report.parameters || '{}');
    const { department, status } = parameters;

    const where = {
      role: 'EMPLOYEE'
    };

    const employees = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        jobDetails: true,
        salaryStructure: true,
        _count: {
          select: {
            attendance: true,
            leaveRequests: true,
            payrolls: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (report.format === 'PDF') {
      return await this.generateEmployeePDF(employees, report);
    } else if (report.format === 'EXCEL') {
      return await this.generateEmployeeExcel(employees, report);
    }
  }

  async generateEmployeePDF(employees, report) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;
    const fontSize = 12;
    const lineHeight = 20;

    page.drawText('Employee Report', {
      x: margin,
      y,
      size: 24,
      font: boldFont
    });
    y -= lineHeight * 1.5;

    page.drawText(`Generated: ${format(new Date(), 'PPP')}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight;

    page.drawText(`Total Employees: ${employees.length}`, {
      x: margin,
      y,
      size: fontSize,
      font
    });
    y -= lineHeight * 2;

    const headers = ['Name', 'Email', 'Department', 'Position', 'Join Date'];
    const colWidths = [100, 140, 70, 70, 70];
    let x = margin;

    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: fontSize, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: width - margin, y: y + 5 },
      thickness: 1
    });
    y -= 10;

    for (const emp of employees) {
      if (y < 60) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - 50;
      }

      x = margin;
      const row = [
        emp.name,
        emp.email,
        emp.jobDetails?.department || 'N/A',
        emp.jobDetails?.jobPosition || 'N/A',
        emp.jobDetails?.dateOfJoining ? format(emp.jobDetails.dateOfJoining, 'PPP') : 'N/A'
      ];

      row.forEach((cell, i) => {
        page.drawText(String(cell).substring(0, 22), { x, y, size: 10, font });
        x += colWidths[i];
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `employee_report_${Date.now()}.pdf`;
    const filePath = `public/reports/${fileName}`;
    await fs.writeFile(filePath, pdfBytes);

    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: pdfBytes.length
    };
  }

  async generateEmployeeExcel(employees, report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employee Report');
    
    // Headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Manager', key: 'manager', width: 20 },
      { header: 'Work Location', key: 'workLocation', width: 20 },
      { header: 'Date of Joining', key: 'dateOfJoining', width: 15 },
      { header: 'Monthly Wage', key: 'monthlyWage', width: 15 },
      { header: 'Attendance Count', key: 'attendanceCount', width: 15 },
      { header: 'Leave Requests', key: 'leaveRequests', width: 15 },
      { header: 'Payroll Count', key: 'payrolls', width: 15 }
    ];
    
    // Data
    employees.forEach(emp => {
      worksheet.addRow({
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.jobDetails?.department,
        position: emp.jobDetails?.jobPosition,
        manager: emp.jobDetails?.manager,
        workLocation: emp.jobDetails?.workLocation,
        dateOfJoining: emp.jobDetails?.dateOfJoining ? format(emp.jobDetails.dateOfJoining, 'PPP') : '',
        monthlyWage: emp.salaryStructure?.monthlyWage,
        attendanceCount: emp._count.attendance,
        leaveRequests: emp._count.leaveRequests,
        payrolls: emp._count.payrolls
      });
    });
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Save Excel file
    const fileName = `employee_report_${Date.now()}.xlsx`;
    const filePath = `public/reports/${fileName}`;
    await workbook.xlsx.writeFile(filePath);
    
    const stats = await fs.stat(filePath);
    
    return {
      fileUrl: `/reports/${fileName}`,
      fileSize: stats.size
    };
  }

  async getFileStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats;
    } catch (error) {
      return { size: 0 };
    }
  }

  async getReports(options = {}) {
    const { page = 1, limit = 20, type, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(status && { status })
    };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.report.count({ where })
    ]);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async deleteReport(reportId) {
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Delete file if exists
    if (report.fileUrl) {
      try {
        await fs.unlink(`public${report.fileUrl}`);
      } catch (error) {
        console.error('Error deleting report file:', error);
      }
    }

    return await prisma.report.delete({
      where: { id: reportId }
    });
  }
}

export default ReportService;
