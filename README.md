<div align="center">

# 🧠 Cognivia

### Learn Smarter. Progress Faster.

An AI-powered personalized learning assistant designed to help students plan, learn, practice, and track their progress.

<br>

[![Live Demo](https://img.shields.io/badge/Live-Demo-6366F1?style=for-the-badge)](YOUR_VERCEL_URL)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2?style=for-the-badge)](https://ai.google.dev/)

</div>

---

## 🚀 About Cognivia

**Cognivia** is an AI-powered learning assistant that helps students turn their learning goals into structured study experiences.

Instead of simply providing information, Cognivia helps learners:

- 📚 Create personalized study plans
- 🤖 Generate AI-powered learning content
- 📝 Generate notes for specific topics
- 🧠 Practice through AI-generated quizzes
- 📊 Track study progress
- 🎯 Identify weak topics
- 💡 Receive personalized learning recommendations

The application combines a modern React interface with an Express backend and Google's Gemini API to generate structured learning content.

---

## ✨ Features

### 📚 Personalized Study Plans

Create a study plan based on:

- Subject
- Topic
- Available duration
- Difficulty level
- Learning goal

Cognivia generates a structured schedule with learning objectives and key concepts.

### 🤖 AI Notes

Generate focused learning notes for a selected topic using Gemini AI.

### 🧠 AI Quizzes

Generate quizzes based on the learner's study topic and evaluate performance.

### 📊 Progress Tracking

Track completed study-plan days and monitor learning progress through the dashboard.

### 🎯 Weak Topic Identification

Quiz history is used to identify topics where additional revision may be useful.

### 💡 Learning Recommendations

The dashboard provides recommendations based on the learner's current study plan and quiz performance.

---

## 🖥️ Screenshots

### Landing Page

<div align="center">

<img src="docs/screenshots/landing-page.png" width="90%" alt="Cognivia Landing Page">

</div>

---

### Study Planner & Dashboard

<div align="center">

<img src="docs/screenshots/dashboard-planner.png" width="90%" alt="Cognivia Dashboard and Study Planner">

</div>

---

### AI Notes

<div align="center">

<img src="docs/screenshots/notes.png" width="90%" alt="Cognivia AI Notes">

</div>

---

### Quiz

<div align="center">

<img src="docs/screenshots/quiz.png" width="90%" alt="Cognivia Quiz">

</div>

---

## ⚙️ How It Works

```text
                ┌─────────────────┐
                │      User       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ React Frontend  │
                │     + Vite      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Express Backend │
                │    REST API     │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Gemini API    │
                │  AI Generation  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Learning Content│
                │ Study / Notes / │
                │ Quiz / Analysis │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    Dashboard    │
                │ Progress & Data │
                └─────────────────┘