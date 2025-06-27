# 💻 Take‑Home Assessment – Complete Solution

This repository contains the complete solution for the **Take‑Home Assessment**. The application has been evolved from a starter base into a **scalable, production-ready solution**, focusing on **performance**, **maintainability**, and **great user experience**.

---
```bash

branch-> main
```
## 🧠 Technical Highlights

- **Backend**
  - Full refactoring of the original codebase
  - Swagger/OpenAPI documentation ([localhost:3001/api-docs](http://localhost:3001/api-docs))
  - Efficient pagination and filtering
  - Redis caching
  - Structured logging
  - Security middleware: CORS, rate limiting, payload validation
  - Test coverage using `jest` and `supertest`

- **Frontend**
  - Modern interface inspired by the Apple Store
  - Responsive search with debounce
  - Optimized pagination
  - List virtualization for high performance
  - Memory leak detection and fixes
  - Tests with `vitest` and `react-testing-library`
  - Fully responsive and accessible

---

## ▶️ How to Run

### Prerequisites

- Node.js (>=18)
- Redis (running locally or in a container)
- NPM or Yarn

### Backend

```bash
cd backend
npm install
npm start
```


Frontend

```bash
cd frontend
npm install
npm start
```

✅ Automated Tests
Backend

```bash
cd backend
npm test
```
Frontend
```

cd frontend
npm test
Total: 54 passing tests (24 backend + 30 frontend)
```

📁 Structure

project-root/
├── backend/
│   ├── src/
│   ├── tests/
│   └── ...
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
└── SOLUTION.md  ← Technical reasoning and decisions

📌 Final Notes
This application was built with a strong focus on:

🔐 Security

⚙️ Performance

🧩 Modular architecture

🧪 Testability

👨‍💻 Developer experience

📈 Production readiness

All technical reasoning is documented in SOLUTION.md, including architectural decisions, improvements, and suggestions for future enhancements.

Thank you for the opportunity!
