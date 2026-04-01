# PESFOSS Mail Sender Automation 🚀

A full-stack, open-source email automation tool designed to bypass strict SaaS api tier restrictions by connecting directly to Gmail via Nodemailer. Built with a beautiful, modern React+Vite frontend and a secure Express.js backend.

## Features ✨
* **CSV Bulk Upload**: Upload a `.csv` file and send personalized bulk emails instantly.
* **Smart Personalization**: Dynamically inject custom tags in your subject & message (e.g., `Hello {{FirstName}}`).
* **Manual Entry**: Toggle to manually type or paste a list of emails directly in the UI. 
* **Attachments**: Support for adding multiple document/PDF/Image attachments up to Gmail's 25MB limit.
* **100% Free Sending**: Utilizes your existing Gmail account securely with 500 emails/day completely free.
* **Premium UI**: Glassmorphism styling, micro-animations, and drag-and-drop zones.

---

## Prerequisites
Before you start, make sure you have:
1. [Node.js](https://nodejs.org/) installed on your machine.
2. A free Google/Gmail Account.
3. 💳 **An App Password from Google** (This acts as your API Key).

### How to get an App Password
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. Once 2-Step is on, click on it, scroll to the bottom, and click on **App passwords** (or go directly to [this link](https://myaccount.google.com/apppasswords)).
4. Generate a new one (call it "Node Mailer App" or similar).
5. Google will pop up a **16-character password**. Copy it!

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mad-man22/automation_email_sender.git
cd automation_email_sender
```

### 2. Backend Setup
Navigate to the backend folder and install the API dependencies:
```bash
cd backend
npm install
```

**Configure `.env`**
In the `backend` folder, duplicate the `.env.example` file and rename it to `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure your credentials:
```env
PORT=3000
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**Start the Server**
```bash
node server.js
```
*The backend should now be running on `http://localhost:3000`.*

### 3. Frontend Setup
Open a new, separate terminal window, navigate to the frontend folder, and install the UI dependencies:
```bash
cd frontend
npm install
```

**Start the App**
```bash
npm run dev
```

### 4. You're ready! 🎉
Open your browser to the local URL provided by Vite (usually `http://localhost:5173`). Have fun sending emails!

---

## Important Limits 🚦
This application hooks directly into Google's standard mail servers for sending. 
Google enforces a **strict limit of ~500 emails per rolling 24-hours** for standard consumer accounts. If you exceed this, Google will temporarily block your SMTP connection. Ensure your CSV files stay below this limit for smooth sailing!
