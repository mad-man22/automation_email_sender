const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set up multer for processing file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Set up Nodemailer transporter using Gmail
let transporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// Allow multiple types of uploads: one CSV and array of attachments
app.post(
  '/api/send-emails', 
  upload.fields([
    { name: 'csvFile', maxCount: 1 },
    { name: 'attachments' }
  ]), 
  async (req, res) => {
  if (!transporter) {
    return res.status(500).json({ error: 'Nodemailer is not configured. Please check your .env file for GMAIL_USER and GMAIL_APP_PASSWORD.' });
  }

  const { subject, body, manualEmails } = req.body;
  
  const csvFile = req.files && req.files['csvFile'] ? req.files['csvFile'][0] : null;
  const attachedFiles = req.files && req.files['attachments'] ? req.files['attachments'] : [];

  if ((!csvFile && !manualEmails) || !subject || !body) {
    return res.status(400).json({ error: 'Please provide either a CSV file or manual emails, plus a subject and email body.' });
  }

  let emails = [];
  const errors = [];
  let successfulSends = 0;

  // Prepare attachments for Nodemailer format
  const formattedAttachments = attachedFiles.map(file => ({
    filename: file.originalname,
    content: file.buffer
  }));

  const processSending = async () => {
    if (emails.length === 0) {
      return res.status(400).json({ error: 'No valid email addresses found to send to.' });
    }

    // Verify the transporter connection before attempting to send in bulk
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP Connection Error:', verifyError);
      return res.status(500).json({ 
        error: 'Failed to connect to Gmail server. Ensure your App Password is correct and 2-Step Verification is on.',
        details: verifyError.message
      });
    }

    // Send emails
    const emailPromises = emails.map(async (item) => {
      try {
        // Replace placeholders like {{FirstName}} with actual data
        let personalizedBody = body;
        let personalizedSubject = subject;

        for (const key of Object.keys(item.row)) {
          const regex = new RegExp(`{{${key}}}`, 'gi');
          personalizedBody = personalizedBody.replace(regex, item.row[key]);
          personalizedSubject = personalizedSubject.replace(regex, item.row[key]);
        }

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: item.email,
          subject: personalizedSubject,
          text: personalizedBody,
          attachments: formattedAttachments
        };

        await transporter.sendMail(mailOptions);
        successfulSends++;
      } catch (error) {
        console.error(`Failed to send to ${item.email}:`, error);
        errors.push({ email: item.email, error: error.message || 'Unknown error' });
      }
    });

    await Promise.all(emailPromises);

    return res.json({
      message: 'Bulk email processing complete.',
      totalProcessed: emails.length,
      successful: successfulSends,
      failed: errors.length,
      errors
    });
  };

  if (manualEmails) {
    // Parse manual emails (comma, space, or newline separated)
    const rawList = manualEmails.split(/[\n,; ]+/);
    rawList.forEach(rawEmail => {
      const cleaned = rawEmail.trim();
      if (cleaned && cleaned.includes('@')) {
        emails.push({ email: cleaned, row: {} });
      }
    });
    // Immediately process since there's no stream to wait for
    await processSending();
  } else if (csvFile) {
    const bufferStream = require('stream').Readable.from(csvFile.buffer);
    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        const emailKey = Object.keys(data).find(key => key.toLowerCase().includes('email'));
        if (emailKey && data[emailKey]) {
          emails.push({
            email: data[emailKey].trim(),
            row: data
          });
        }
      })
      .on('end', async () => {
        await processSending();
      })
      .on('error', (err) => {
        return res.status(500).json({ error: 'Failed to process CSV file', details: err.message });
      });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ WARNING: GMAIL_APP_PASSWORD is missing from .env');
  }
});
