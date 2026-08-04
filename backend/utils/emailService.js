import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;
const emailFrom = process.env.EMAIL_FROM || '"Evently Events" <noreply@evently.com>';

const getTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    console.log('[Nodemailer]: Configuring SMTP transport using environment variables...');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log('[Nodemailer Warning]: SMTP credentials not set in backend/.env. Generating free Ethereal Test Account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('[Nodemailer Sandbox Account Created ✅]: Credentials:', {
        user: testAccount.user,
        pass: testAccount.pass
      });
    } catch (err) {
      console.error('[Nodemailer Fallback Failed ❌]: Failed to create Ethereal account, falling back to console logger:', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n=======================================================');
          console.log('[Nodemailer Console Fallback]');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('HTML Body preview:\n', mailOptions.html ? mailOptions.html.substring(0, 500) + '...' : mailOptions.text);
          console.log('=======================================================\n');
          return { messageId: 'console-mock-id' };
        }
      };
    }
  }
  return transporter;
};

// Send mail wrapper that logs Ethereal test URLs
export const sendMail = async (options) => {
  try {
    const activeTransporter = await getTransporter();
    const mailOptions = {
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer]: Email sent to ${options.to}. Message ID: ${info.messageId}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`=======================================================`);
      console.log(`✉️  [Ethereal Email Sandbox Link]: Click to view email:`);
      console.log(`👉 ${previewUrl}`);
      console.log(`=======================================================`);
      info.testUrl = previewUrl;
    }
    return info;
  } catch (err) {
    console.error('[Nodemailer Error ❌]: Failed to send email:', err.message);
    throw err;
  }
};

// Common CSS/Styles for email layouts (Dark/Grey high-end aesthetic)
const emailHeaderStyle = `
  background-color: #09090b; 
  padding: 30px; 
  text-align: center;
  border-bottom: 1px solid #27272a;
`;

const emailBodyStyle = `
  background-color: #020202; 
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e4e4e7;
  margin: 0;
  padding: 40px 20px;
`;

const emailContainerStyle = `
  max-width: 600px; 
  margin: 0 auto; 
  border: 1px solid #27272a;
  border-radius: 16px;
  overflow: hidden;
  background-color: #09090b;
`;

const emailFooterStyle = `
  padding: 30px;
  text-align: center;
  font-size: 11px;
  color: #71717a;
  border-top: 1px solid #27272a;
  background-color: #09090b;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #ffffff;
  color: #000000;
  font-weight: bold;
  font-size: 13px;
  padding: 12px 28px;
  border-radius: 10px;
  text-decoration: none;
  margin-top: 15px;
  text-align: center;
`;

// Format date helper
const formatEmailDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 1. Booking Confirmation Email
export const sendBookingConfirmationEmail = async ({ email, name, event, booking }) => {
  const eventDate = formatEmailDate(event.dateTime);
  const totalAmountStr = booking.totalAmount === 0 ? 'FREE' : `₹${booking.totalAmount.toLocaleString('en-IN')}`;

  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">EVENTLY</div>
          <div style="font-size: 11px; font-family: monospace; color: #71717a; margin-top: 5px;">DISCOVER & BOOK EVENTS</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Booking Confirmed!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hi ${name}, your registration for <strong>${event.title}</strong> has been successfully processed.</p>
          
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #71717a; padding-bottom: 8px;">Ticket ID</td>
                <td style="color: #ffffff; font-weight: bold; font-family: monospace; text-align: right; padding-bottom: 8px;">${booking.bookingNumber}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding-bottom: 8px;">Event Date</td>
                <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 8px;">${eventDate}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding-bottom: 8px;">Venue</td>
                <td style="color: #ffffff; text-align: right; padding-bottom: 8px;">${event.venueName || event.venue?.name || 'Venue'}, ${event.city}</td>
              </tr>
              <tr>
                <td style="color: #71717a; padding-bottom: 8px;">Tickets reserved</td>
                <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 8px;">${booking.seatsBooked || booking.ticketsCount}</td>
              </tr>
              <tr style="border-top: 1px solid #27272a;">
                <td style="color: #ffffff; font-weight: bold; padding-top: 12px;">Total Paid</td>
                <td style="color: #ffffff; font-weight: 800; font-family: monospace; text-align: right; padding-top: 12px; font-size: 16px;">${totalAmountStr}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #71717a;">Please show your digital QR code (attached to your profile) or your booking reference at the gate for direct admission.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/my-bookings" style="${buttonStyle}">View Digital Ticket</a>
          </div>
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently India Platform. All rights reserved.<br>
          This is an automated transaction email. Please do not reply directly.
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Booking Confirmed: ${event.title} (${booking.bookingNumber})`,
    html
  });
};

// 2. Payment Success Receipt Email
export const sendPaymentSuccessEmail = async ({ email, name, event, booking }) => {
  const totalAmountStr = booking.totalAmount === 0 ? 'FREE' : `₹${booking.totalAmount.toLocaleString('en-IN')}`;
  
  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">EVENTLY RECEIPT</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Payment Successful</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Thank you for your payment. Here is your transaction invoice summary.</p>
          
          <div style="border-bottom: 1px solid #27272a; padding-bottom: 15px; margin-bottom: 15px; font-size: 13px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #71717a;">Payment ID</td>
                <td style="color: #ffffff; font-family: monospace; text-align: right;">${booking.paymentId || 'N/A'}</td>
              </tr>
              <tr>
                <td style="color: #71717a;">Payment Method</td>
                <td style="color: #ffffff; font-family: monospace; text-align: right; uppercase">${booking.paymentMethod || 'card'}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #ffffff; font-size: 14px; margin-bottom: 10px;">Item Description</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid #27272a; text-align: left;">
                <th style="color: #71717a; padding-bottom: 8px;">Item</th>
                <th style="color: #71717a; padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="color: #71717a; padding-bottom: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="color: #ffffff; padding: 10px 0;">Ticket for ${event.title}</td>
                <td style="color: #ffffff; text-align: center; padding: 10px 0;">${booking.seatsBooked || booking.ticketsCount}</td>
                <td style="color: #ffffff; text-align: right; padding: 10px 0; font-family: monospace;">₹${(booking.unitPrice || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 1px dashed #27272a; font-weight: bold; font-size: 14px;">
                <td colspan="2" style="color: #ffffff; padding-top: 15px;">Total Amount</td>
                <td style="color: #ffffff; text-align: right; padding-top: 15px; font-family: monospace; font-size: 16px;">${totalAmountStr}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently Platform. Securely processed via Razorpay Sandbox.<br>
          For receipt inquiries, contact organizer123@gmail.com
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Payment Invoice: ${booking.bookingNumber}`,
    html
  });
};

// 3. Ticket Download Link Email
export const sendTicketDownloadEmail = async ({ email, name, event, booking }) => {
  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">YOUR DIGITAL TICKET</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Download Ticket Link</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hi ${name}, your digital QR code pass and printable B&W PDF ticket is ready for download.</p>
          
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="font-size: 13px; color: #a1a1aa; margin: 0 0 15px 0;">Click the link below to view or print your ticket for <strong>${event.title}</strong>:</p>
            <a href="http://localhost:3000/my-bookings" style="${buttonStyle}">Download PDF Ticket</a>
          </div>
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently Platform. Direct Ticket Delivery System.
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Ticket Ready for Download: ${event.title}`,
    html
  });
};

// 4. Event Reminder Email
export const sendEventReminderEmail = async ({ email, name, event }) => {
  const eventDate = formatEmailDate(event.dateTime);
  
  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">EVENT REMINDER</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Upcoming Event Reminder 🕒</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hi ${name}, this is a friendly reminder that the event you registered for is starting soon!</p>
          
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 10px 0;">${event.title}</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #71717a; padding-bottom: 6px;">Date & Time</td>
                <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 6px;">${eventDate}</td>
              </tr>
              <tr>
                <td style="color: #71717a;">Venue</td>
                <td style="color: #ffffff; font-weight: bold; text-align: right;">${event.venueName || event.venue?.name || 'Venue'}, ${event.city}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #a1a1aa;">Please plan to arrive 20 minutes early at the venue. Don't forget to keep your QR ticket ready on your phone!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/my-bookings" style="${buttonStyle}">Show Entry Pass</a>
          </div>
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently Platform. Automated scheduling helper.
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Event Reminder: "${event.title}" is starting soon!`,
    html
  });
};

// 5. Event Cancellation or Updates Email
export const sendEventUpdateEmail = async ({ email, name, event, message, updateType = 'update' }) => {
  const isCancelled = updateType === 'cancel' || event.status === 'cancelled';
  const subjectText = isCancelled 
    ? `⚠️ EVENT CANCELLED: ${event.title}` 
    : `🔔 IMPORTANT EVENT UPDATE: ${event.title}`;

  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${isCancelled ? 'EVENT CANCELLATION' : 'EVENT UPDATE'}</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">
            ${isCancelled ? 'Event Cancelled' : 'Important Notice'}
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hi ${name}, the organizer of <strong>${event.title}</strong> has issued an update regarding the event.</p>
          
          <div style="border-left: 4px solid ${isCancelled ? '#f87171' : '#ffffff'}; background-color: #18181b; padding: 15px; border-radius: 0 8px 8px 0; margin: 25px 0;">
            <p style="font-size: 13px; line-height: 1.5; color: #ffffff; font-weight: bold; margin: 0 0 5px 0;">Organizer message:</p>
            <p style="font-size: 13px; line-height: 1.6; color: #a1a1aa; margin: 0;">${message}</p>
          </div>

          ${isCancelled ? `
            <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">If this was a paid booking, a full refund will be processed back to your payment account via Razorpay within 5–7 business days.</p>
          ` : `
            <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">You can check your updated ticket details, new venue location, and timings by clicking the link below:</p>
            <div style="text-align: center; margin-top: 25px;">
              <a href="http://localhost:3000/my-bookings" style="${buttonStyle}">View Updated Details</a>
            </div>
          `}
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently Platform. Critical announcements system.
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: subjectText,
    html
  });
};

// 6. Welcome Onboarding Email
export const sendWelcomeEmail = async ({ email, name }) => {
  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">WELCOME TO EVENTLY</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Welcome aboard, ${name}! 🎉</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">We are excited to have you join our event management and ticket reservation community.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">With Evently, you can discover premium local events, book slots with direct secure payment gateways, download printable black-and-white QR passes, and receive real-time notifications about schedules.</p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="http://localhost:3000/" style="${buttonStyle}">Explore Events Catalog</a>
          </div>
          
          <p style="font-size: 13px; line-height: 1.5; color: #71717a;">If you have any questions or feedback, please contact us at help@evently.com.</p>
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently Platform. All rights reserved.
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Welcome to Evently, ${name}!`,
    html
  });
};

// 7. Login OTP Verification Email (2FA)
export const sendOTPEmail = async ({ email, name, otp }) => {
  const html = `
    <div style="${emailBodyStyle}">
      <div style="${emailContainerStyle}">
        <div style="${emailHeaderStyle}">
          <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">SECURE LOG IN</div>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">One-Time Verification Passcode</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Hi ${name}, enter the following verification code to complete your login session on Evently.</p>
          
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; font-family: monospace;">${otp}</div>
            <p style="font-size: 11px; color: #71717a; margin-top: 10px; margin-bottom: 0; font-family: monospace;">Expires in 10 minutes</p>
          </div>

          <p style="font-size: 13px; color: #71717a; line-height: 1.5;">If you did not request this login passcode, please secure your account immediately or ignore this email.</p>
        </div>
        <div style="${emailFooterStyle}">
          &copy; 2026 Evently Platform. Security & Identity Management.
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Your Login Verification Code: ${otp}`,
    html
  });
};
