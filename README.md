<div align="center">
  
  # 🚀 AcadX (ELOR Portal)
  **AI-Powered University Project & Skill Development Platform**

  [![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)
</div>

<br />

## 📖 Overview
**AcadX** is a comprehensive, AI-integrated university ecosystem designed to streamline student project management, facilitate faculty mentorship, and provide actionable analytics for academic administration (HODs). It bridges the gap between students, faculty, and administration by providing a unified portal for collaboration, submission tracking, issue resolution, and AI-driven skill evaluation.

---

## ✨ Key Features

### 🎓 For Students
- **Project Lifecycle Management:** Create, manage, and track academic projects seamlessly.
- **AI-Powered Analytics:** Receive automated insights and technical record generation via Google Gemini AI.
- **Mentorship Requests:** Request faculty mentors for dedicated guidance.
- **Dynamic Portfolios:** Automatically showcase milestones, skills, and final project submissions.
- **Issue Escalation:** Raise specific concerns or blockers directly to the HOD.

### 👨‍🏫 For Faculty
- **Mentorship Dashboard:** Accept, decline, and manage student mentor requests.
- **Submission Evaluation:** Review project milestones, code, and documents directly within the portal.
- **Progress Tracking:** Monitor student performance and provide constructive feedback.

### 🏛️ For Administration (HODs)
- **Global Directory:** Oversee all students and faculty across the department.
- **Issue Resolution:** Handle escalated complaints and administrative bottlenecks.
- **Performance Insights:** Access top-down analytics to monitor department-wide project metrics.

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite |
| **Styling** | Tailwind CSS, Vanilla CSS Modules |
| **Routing** | React Router DOM v7 |
| **Icons & UI** | Lucide React |
| **Document Generation** | jsPDF, html2canvas |
| **Backend Environment** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ORM |
| **AI Integration** | Google Generative AI (`@google/generative-ai`) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Cloud Storage** | Cloudinary, Multer |
| **Mailing Service** | Nodemailer |

---

## 📂 Project Structure

```text
AcadX/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and external service configurations
│   │   ├── constants/       # Application-wide constants and enums
│   │   ├── controllers/     # Route logic and request handlers
│   │   ├── jobs/            # Scheduled background tasks (node-cron)
│   │   ├── middlewares/     # Authentication, error handling, file upload interceptors
│   │   ├── models/          # Mongoose DB schemas (User, Project, Milestone, etc.)
│   │   ├── routes/          # Express API endpoint definitions
│   │   ├── services/        # Business logic & 3rd party integrations (Gemini, Cloudinary)
│   │   ├── utils/           # Shared helper functions
│   │   └── server.js        # Backend execution entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instances and API call wrappers
    │   ├── assets/          # Static images and SVGs
    │   ├── components/      # Reusable UI components (Layouts, Modals, Cards)
    │   ├── context/         # Global state management (AuthContext)
    │   ├── pages/
    │   │   ├── auth/        # Login, Registration, Home
    │   │   ├── student/     # Views: Dashboard, My Projects, Analytics
    │   │   ├── faculty/     # Views: Mentorship, Evaluation, Complaints
    │   │   ├── hod/         # Views: Global Directories, Complaint Resolution
    │   │   └── milestones/  # Shared interfaces for milestone tracking
    │   ├── styles/          # Global styles and Tailwind directives
    │   ├── App.jsx          # Root component and Router configuration
    │   └── main.jsx         # React DOM binding
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance
- [Cloudinary](https://cloudinary.com/) Account (for image uploads)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/BallaJaideep/AcadX.git
cd AcadX
```

### 2. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email Configuration
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend Vite server:
```bash
npm run dev
```

---

## 🔐 Security & Access Control
AcadX employs strict **Role-Based Access Control (RBAC)** to ensure maximum privacy and data integrity:
- **`student`**: Limited to self-owned projects, milestone submissions, and targeted requests.
- **`faculty`**: Access to assigned students and specific mentorship requests. Cannot access systemic global data.
- **`hod`**: Broad read access to monitor department health and resolve escalated complaints.

---

## 🤝 Contributing
1. Fork the project
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <i>Designed & Developed with ❤️ for advanced academic collaboration.</i>
</div>
