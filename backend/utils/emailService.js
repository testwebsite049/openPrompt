import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use Ethereal Email for development/testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
  
  // Production email configuration
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send email notification
 * @param {object} options - Email options
 * @returns {Promise} Email send result
 */
export async function sendEmail({ to, subject, text, html, from }) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: from || `"OpenPrompt Admin" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html: html || text
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send cron job notification
 * @param {object} job - Cron job object
 * @param {string} status - Execution status
 * @param {object} result - Execution result
 * @param {Error} error - Error if failed
 */
export async function sendCronJobNotification(job, status, result, error) {
  try {
    // Check if notifications are enabled for this status
    if (
      (status === 'success' && !job.notifyOnSuccess) ||
      (status === 'failure' && !job.notifyOnFailure) ||
      !job.notificationEmails ||
      job.notificationEmails.length === 0
    ) {
      return;
    }
    
    const subject = `Cron Job ${status === 'success' ? 'Completed' : 'Failed'}: ${job.name}`;
    
    let emailContent = `
      <h2>Cron Job Execution ${status === 'success' ? 'Completed' : 'Failed'}</h2>
      
      <h3>Job Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${job.name}</li>
        <li><strong>Type:</strong> ${job.type}</li>
        <li><strong>Schedule:</strong> ${job.schedule}</li>
        <li><strong>Execution Time:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Duration:</strong> ${job.lastExecutionDuration || 0}ms</li>
        <li><strong>Status:</strong> ${status.toUpperCase()}</li>
      </ul>
    `;
    
    if (status === 'success' && result) {
      emailContent += `
        <h3>Execution Result:</h3>
        <pre>${JSON.stringify(result, null, 2)}</pre>
      `;
    }
    
    if (status === 'failure' && error) {
      emailContent += `
        <h3>Error Details:</h3>
        <pre style="color: red;">${error.message}</pre>
        
        <h3>Stack Trace:</h3>
        <pre style="font-size: 12px;">${error.stack}</pre>
      `;
    }
    
    emailContent += `
      <hr>
      <p>This is an automated notification from the OpenPrompt Admin Panel.</p>
    `;
    
    await sendEmail({
      to: job.notificationEmails,
      subject,
      html: emailContent
    });
    
    console.log(`Cron job notification sent for ${job.name} (${status})`);
  } catch (emailError) {
    console.error('Failed to send cron job notification:', emailError);
  }
}

/**
 * Send system alert notification
 * @param {string} alertType - Type of alert
 * @param {string} message - Alert message
 * @param {object} details - Additional details
 */
export async function sendSystemAlert(alertType, message, details = {}) {
  try {
    const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS?.split(',') || [];
    
    if (adminEmails.length === 0) {
      console.log('No admin emails configured for system alerts');
      return;
    }
    
    const subject = `System Alert: ${alertType}`;
    
    let emailContent = `
      <h2>System Alert: ${alertType}</h2>
      
      <h3>Alert Message:</h3>
      <p>${message}</p>
      
      <h3>Timestamp:</h3>
      <p>${new Date().toLocaleString()}</p>
    `;
    
    if (Object.keys(details).length > 0) {
      emailContent += `
        <h3>Additional Details:</h3>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      `;
    }
    
    emailContent += `
      <hr>
      <p>This is an automated system alert from the OpenPrompt Admin Panel.</p>
    `;
    
    await sendEmail({
      to: adminEmails,
      subject,
      html: emailContent
    });
    
    console.log(`System alert sent: ${alertType}`);
  } catch (error) {
    console.error('Failed to send system alert:', error);
  }
}

/**
 * Send welcome email to new user
 * @param {object} user - User object
 */
export async function sendWelcomeEmail(user) {
  try {
    const subject = 'Welcome to OpenPrompt!';
    
    const emailContent = `
      <h2>Welcome to OpenPrompt, ${user.profile.firstName}!</h2>
      
      <p>Thank you for joining our community. You can now access and share amazing AI prompts.</p>
      
      <h3>What you can do:</h3>
      <ul>
        <li>Browse thousands of curated AI prompts</li>
        <li>Download prompts for your projects</li>
        <li>Contribute your own prompts</li>
        <li>Join our growing community</li>
      </ul>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Happy prompting!</p>
      <p>The OpenPrompt Team</p>
    `;
    
    await sendEmail({
      to: user.email,
      subject,
      html: emailContent
    });
    
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

/**
 * Send password reset email
 * @param {object} user - User object
 * @param {string} resetToken - Password reset token
 */
export async function sendPasswordResetEmail(user, resetToken) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    
    const emailContent = `
      <h2>Password Reset Request</h2>
      
      <p>Hello ${user.profile.firstName},</p>
      
      <p>You have requested a password reset for your OpenPrompt account.</p>
      
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      
      <p>If you didn't request this password reset, please ignore this email.</p>
      
      <p>Best regards,<br>The OpenPrompt Team</p>
    `;
    
    await sendEmail({
      to: user.email,
      subject,
      html: emailContent
    });
    
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

/**
 * Send email verification email
 * @param {object} user - User object
 * @param {string} verificationToken - Email verification token
 */
export async function sendEmailVerification(user, verificationToken) {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email Address';
    
    const emailContent = `
      <h2>Email Verification</h2>
      
      <p>Hello ${user.profile.firstName},</p>
      
      <p>Please verify your email address by clicking the link below:</p>
      
      <p><a href="${verifyUrl}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      
      <p>This link will expire in 24 hours.</p>
      
      <p>If you didn't create an account with us, please ignore this email.</p>
      
      <p>Best regards,<br>The OpenPrompt Team</p>
    `;
    
    await sendEmail({
      to: user.email,
      subject,
      html: emailContent
    });
    
    console.log(`Email verification sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send email verification:', error);
  }
}