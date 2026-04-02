# FeedPulse — AI-Powered Product Feedback Platform

## ⚙️ Setting Up Locally

### **Prerequisites**
- Node.js (v18 or higher recommended)
- MongoDB Atlas account (or local MongoDB instance)
- Google Gemini AI API key

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/MohamedShazni/FeedPulse.git
cd FeedPulse
```

### **Step 2: Backend Configuration**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ADMIN_EMAIL=your_admin_email
   ADMIN_PASSWORD=your_admin_password
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### **Step 3: Frontend Configuration**
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` folder and add the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

FeedPulse should now be running at [http://localhost:3000](http://localhost:3000).

---

## About FeedPulse

### FeedPulse is a lightweight internal tool that lets teams collect product feedback and feature requests from users,
then uses Google Gemini AI to automatically categorise, prioritise, and summarise them — giving product teams
instant clarity on what to build next.

## ✨ Features

- 📊 **Centralized Feedback Dashboard**: View and manage all user feedback in one place.
- 🤖 **AI-Powered Analysis**: Automatically summarize feedback and extract key themes using Google Gemini AI.
- 🔐 **Secure Authentication**: JWT-based admin access and secure feedback submission.
- 📱 **Modern UI**: Clean, responsive, and high-performance interface built with Next.js and Tailwind CSS.
- ⚡ **Real-time Updates**: Instant feedback processing and analysis.

## 🛠️ Tech Stacks

| **Backend Technology** | **Frontend Technology**           |
|------------------------|-----------------------------------|
| **Node.js**            | **TypeScript**                    |
| **JavaScript**         | **Next.js**                       |
| **MongoDB Atlas**      | **Tailwind CSS**                  |
| **bcypt**              | **Redux**                         |
| **JWT**                | **Sonner**                        |


## 📸 UI Screenshots

- **Dashboard Page**
<img width="1919" height="943" alt="Screenshot 2026-03-31 165125" src="https://github.com/user-attachments/assets/f42d33f6-b4b5-4b6f-b310-6dd35c8fc017" />

- **Login Page**
  
<img width="1022" height="815" alt="Screenshot 2026-03-31 165057" src="https://github.com/user-attachments/assets/5905e3f4-7c5a-4b71-98bb-c98ed59eaea9" />

- **Feedback Page**
  
<img width="1884" height="942" alt="Screenshot 2026-03-31 165038" src="https://github.com/user-attachments/assets/571bdbee-cb4e-4a22-af7e-00c1e1b4b5f0" />


#### Developed By:  **Mohamed Shazni**
