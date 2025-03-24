import nodemailer from 'nodemailer';

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendLoginCredentials(email: string, password: string, userData: any) {
  const mailOptions = {
    from: `"Music Funeral" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your Music Funeral Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Your Order</h2>
        <p>Your funeral music service has been successfully registered.</p>
        
        <h3>Your Login Credentials</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        
        <h3>Service Details</h3>
        <p><strong>Service Plan:</strong> ${userData.servicePlan}</p>
        <p><strong>Price:</strong> $${userData.servicePrice}</p>
        
        <h3>Deceased Information</h3>
        <p><strong>Name:</strong> ${userData.deceasedName}</p>
        <p><strong>Date of Birth:</strong> ${new Date(userData.dateOfBirth).toLocaleDateString()}</p>
        <p><strong>Date of Passing:</strong> ${new Date(userData.dateOfPassing).toLocaleDateString()}</p>
        
        <p>You can log in to our system to view your service details anytime.</p>
        
        <p>Thank you for choosing Music Funeral services.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Login credentials email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Music Funeral" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset your Music Funeral password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You've requested to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4A77B5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This password reset link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}