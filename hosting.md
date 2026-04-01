# Hosting & Deployment Guide

Since this application is split into a **Frontend (React)** and a **Backend (Node.js)**, they need to be deployed slightly differently. 

Here is the best practice for getting your PESFOSS Mail Sender Automation tool live on the web!

---

## ⚠️ Important First Step: Update API URLs
Right now, the frontend is hardcoded to talk to your local computer. Before you deploy, you *must* update the `App.jsx` file to point to your new live backend server.

1. Open `frontend/src/App.jsx`.
2. Find the line:
   ```javascript
   const response = await fetch('http://localhost:3000/api/send-emails', ... 
   ```
3. Change `http://localhost:3000` to the brand new URL of your hosted backend (e.g., `https://my-backend-app.onrender.com/api/send-emails`).

---

## 1. Deploying the Backend (Node.js API)
The backend needs a server that constantly listens for your frontend's requests. We recommend using free or cheap platforms like **Render**, **Railway**, or **Heroku**.

### Example using Render.com (Free Tier Available):
1. Create an account on Render and select **New Web Service**.
2. Connect your GitHub repository.
3. **Configure the deployment settings:**
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. **Environment Variables:** 
   Click on the "Advanced" drop-down and input your `.env` variables from your local machine:
   - `GMAIL_USER` = your_email@gmail.com
   - `GMAIL_APP_PASSWORD` = your_16_character_app_password
5. Click **Create Web Service**. Render will automatically run `npm install` and boot up your API. It will give you a live URL.

---

## 2. Deploying the Frontend (React UI)
Because the frontend is built entirely in Vite/React, it compiles down into simple HTML/CSS files. You don't need a heavy server to run it. You can host this instantly and for free using **Vercel** or **Netlify**.

### Example using Vercel (Free & Easiest):
1. Create a free account on [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import this GitHub repository.
3. **Configure the Project:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
4. Click **Deploy**. Vercel will automatically run `npm run build` and launch a lightning-fast CDN version of your user interface!

---

## 3. Alternative: Deploying Both on a VPS (Advanced)
If you bought a Virtual Private Server (VPS) stringing Ubuntu from hosts like DigitalOcean or AWS, here is the quick command sequence:

### Prerequisites:
- Ensure Nginx or Apache, and Node.js are installed on your server.
- Clone the repository to `/var/www/automation_email_sender`.

### Setting up the Backend:
```bash
cd backend
npm install
# Create an .env file using nano and add your Gmail credentials
nano .env 

# Install PM2 (Process Manager) to keep the app running forever
sudo npm install -g pm2
pm2 start server.js --name "email-api"
pm2 save
pm2 startup
```

### Setting up the Frontend:
```bash
cd ../frontend
npm install
npm run build
```
This command generates a `dist` folder. Simply point your Nginx Web Server directory at `/var/www/automation_email_sender/frontend/dist`, and your UI will be live to the world!
