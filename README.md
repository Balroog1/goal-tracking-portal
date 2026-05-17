# Enterprise Goal Tracking Portal

A full-stack enterprise-grade Goal Setting & Performance Tracking platform built for the **AtomQuest Hackathon 1.0**.

The portal streamlines employee goal management, approval workflows, quarterly achievement tracking, and performance analytics through a centralized web application.

---

# 🚀 Live Demo

🔗 https://goal-tracking-portal-snowy.vercel.app

---

# 📌 Problem Statement

Organizations often rely on fragmented spreadsheets, emails, and manual review cycles for performance tracking, leading to poor visibility, misalignment, and inefficient appraisal workflows.

This project provides a structured digital platform that enables:

- Goal creation & approval workflows
- Quarterly performance check-ins
- Achievement tracking
- Role-based dashboards
- Audit-ready governance
- Real-time analytics & reporting

---

# ✨ Core Features

## 👨‍💼 Employee Portal
- Create and manage goals
- Submit goal sheets
- Quarterly progress updates
- Achievement tracking
- Status management

## 👨‍💻 Manager Dashboard
- Review employee goals
- Approve / reject submissions
- Inline workflow management
- Quarterly check-ins
- Team progress visibility

## 🛡️ Admin / HR Portal
- Organizational oversight
- Reporting & analytics
- Goal governance
- Audit visibility
- Workflow monitoring

---

# ✅ Business Rules Implemented

- Total goal weightage must equal **100%**
- Minimum goal weightage: **10%**
- Maximum goals per employee: **8**
- Submitted goals become locked
- Role-based access enforcement
- Quarterly tracking workflows
- Goal approval lifecycle

---

# 📊 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Authentication | Supabase |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Version Control | Git & GitHub |

---

# 🏗️ System Architecture

## Architecture Flow

```text
Users
   ↓
Next.js Frontend
   ↓
API Routes / Backend Logic
   ↓
Supabase Backend
 ├── PostgreSQL Database
 ├── Authentication
 └── Role-Based Access
   ↓
Vercel Deployment
