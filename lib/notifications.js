import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailService();
  }

  initializeEmailService() {
    // Configure email service
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async createNotification(data) {
    try {
      const notification = await prisma.notification.create({
        data: {
          ...data,
          createdAt: new Date()
        }
      });

      // Send notifications based on category
      if (data.category === 'EMAIL' || data.category === 'SYSTEM') {
        await this.sendEmailNotification(notification);
      }

      if (data.category === 'PUSH' || data.category === 'SYSTEM') {
        await this.sendPushNotification(notification);
      }

      if (data.category === 'SMS') {
        await this.sendSMSNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(notification) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: notification.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@dayflow.com',
        to: user.email,
        subject: notification.title,
        html: this.generateEmailTemplate(notification, user)
      };

      await this.emailTransporter.sendMail(mailOptions);

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          emailSent: true,
          emailSentAt: new Date()
        }
      });

      console.log(`Email sent to ${user.email} for notification: ${notification.title}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPushNotification(notification) {
    try {
      // For web push notifications, we would integrate with a service like
      // Firebase Cloud Messaging or Web Push Protocol
      // For now, we'll just mark it as sent
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          pushSent: true,
          pushSentAt: new Date()
        }
      });

      console.log(`Push notification sent for: ${notification.title}`);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async sendSMSNotification(notification) {
    try {
      // Integrate with SMS service like Twilio
      // For now, we'll just mark it as sent
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          smsSent: true,
          smsSentAt: new Date()
        }
      });

      console.log(`SMS notification sent for: ${notification.title}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  generateEmailTemplate(notification, user) {
    const actionButton = notification.actionUrl ? 
      `<div style="margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}${notification.actionUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          ${notification.actionText || 'View Details'}
        </a>
      </div>` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dayflow HRMS - ${notification.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Dayflow HRMS</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #4F46E5; margin-top: 0;">Hello ${user.name},</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">${notification.message}</p>
            
            ${actionButton}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">
                This is an automated message from Dayflow HRMS.
              </p>
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                If you have any questions, please contact your HR department.
              </p>
            </div>
          </div>
          
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 Dayflow Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(unreadOnly && { isRead: false })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });
  }

  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  }

  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  // Notification templates for common events
  async sendLeaveRequestNotification(userId, leaveRequest, status) {
    const templates = {
      PENDING: {
        type: 'LEAVE_PENDING',
        title: 'Leave Request Pending Approval',
        message: `A new leave request from ${leaveRequest.user.name} for ${leaveRequest.days} day(s) is pending your approval.`,
        priority: 'HIGH',
        category: 'EMAIL',
        actionUrl: '/admin/leave',
        actionText: 'Review Request'
      },
      APPROVED: {
        type: 'LEAVE_APPROVED',
        title: 'Leave Request Approved',
        message: `Your leave request for ${leaveRequest.days} day(s) has been approved.`,
        priority: 'NORMAL',
        category: 'SYSTEM'
      },
      REJECTED: {
        type: 'LEAVE_REJECTED',
        title: 'Leave Request Rejected',
        message: `Your leave request for ${leaveRequest.days} day(s) has been rejected. Reason: ${leaveRequest.adminComment || 'No reason provided'}`,
        priority: 'HIGH',
        category: 'EMAIL'
      }
    };

    const template = templates[status];
    if (!template) return;

    await this.createNotification({
      userId,
      ...template
    });
  }

  async sendPayrollNotification(userId, payroll) {
    await this.createNotification({
      userId,
      type: 'PAYROLL_GENERATED',
      title: 'Payroll Generated',
      message: `Your payroll for ${payroll.month}/${payroll.year} has been generated. Net salary: $${payroll.netSalary}`,
      priority: 'HIGH',
      category: 'EMAIL',
      actionUrl: '/payroll',
      actionText: 'View Payroll'
    });
  }

  async sendPerformanceReviewNotification(userId, review, status) {
    const templates = {
      SUBMITTED: {
        title: 'Performance Review Submitted',
        message: 'Your performance review has been submitted and is awaiting approval.',
        priority: 'NORMAL',
        category: 'SYSTEM'
      },
      APPROVED: {
        title: 'Performance Review Approved',
        message: 'Your performance review has been approved. Check your dashboard for details.',
        priority: 'HIGH',
        category: 'EMAIL',
        actionUrl: '/performance',
        actionText: 'View Review'
      }
    };

    const template = templates[status];
    if (!template) return;

    await this.createNotification({
      userId,
      type: 'PERFORMANCE_REVIEW',
      ...template
    });
  }

  async sendTrainingNotification(userId, training, action) {
    const templates = {
      ENROLLED: {
        title: 'Training Enrollment Confirmed',
        message: `You have been enrolled in "${training.title}". Training starts on ${training.startDate?.toLocaleDateString()}.`,
        priority: 'NORMAL',
        category: 'EMAIL'
      },
      COMPLETED: {
        title: 'Training Completed',
        message: `Congratulations! You have completed the "${training.title}" training.`,
        priority: 'NORMAL',
        category: 'EMAIL'
      }
    };

    const template = templates[action];
    if (!template) return;

    await this.createNotification({
      userId,
      type: 'TRAINING_UPDATE',
      ...template
    });
  }
}

export default NotificationService;
