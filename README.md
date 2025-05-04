# GraphQL Profile Page
## 🔍 Overview

This project authenticates a user with Zone01 Kisumu and fetches their profile data using GraphQL. It then presents the data in a clean and interactive UI, including visual charts for experience points (XP) and audit performance.

- **GraphQL API Endpoint**: [`https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql`](https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql)  
- **Authentication**: Requires a JWT (JSON Web Token) obtained via the login endpoint: [`/api/auth/signin`](https://learn.zone01kisumu.ke/api/auth/signin)

---

## ✨ Features

### 🔐 User Authentication
- Login via **username/password** or **email/password**
- Retrieves and uses **JWT Bearer Token** for secured API calls

### 👤 Profile Display
- User ID, login name, and other identity details
- Accumulated XP (experience points)
- Grades, skills, and learning progress
- Audit information (evaluations and peer reviews)

### 📊 Data Visualization
- XP progress over time
- Audit ratio breakdown

### ☁️ Hosting
- Deployed and publicly accessible on [Profile Dashboard](https://profile-dashboard-ud8e.onrender.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://learn.zone01kisumu.ke/git/bernaotieno/graphql.git
cd graphql
```
### 2. Start the Application

Do the following to run the application locally:

#### Using Live Server (Recommended)
Right-click index.html → "Open with Live Server"