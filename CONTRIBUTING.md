# Contributing to FinOpsGuard AI 🛡️

Thank you for your interest in contributing to **FinOpsGuard AI**! We welcome contributions from the cloud engineering, FinOps, and AI safety communities.

## 📋 Code of Conduct

Please be respectful, inclusive, and collaborative. We are committed to providing an open, welcoming environment for everyone.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Git**: For version control

### Quickstart
1. Fork the repository on GitHub: `https://github.com/jeeva5655/finopsguard-ai`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/finopsguard-ai.git
   cd finopsguard-ai
   ```
3. Install dependencies and start the backend:
   ```bash
   cd backend
   npm install
   node server.js
   ```
4. In a separate terminal, start the frontend dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Open `http://localhost:5173` to test changes locally.

---

## 🏗️ Architecture & Style Guidelines

- **Frontend**:
  - React 19 with Vite.
  - Component-driven modular architecture in `frontend/src/components/`.
  - **No Tailwind CSS**: Use modern, scoped vanilla CSS with custom properties (`--bg-primary`, `--accent-cyan`, `--glass-bg`, etc.) to maintain the cyber-dark glassmorphism design system.
  - Interactive charts use **Recharts**; icons use **lucide-react**.

- **Backend**:
  - Node.js / Express with ESM (`"type": "module"`).
  - Server-Sent Events (SSE) streaming for real-time agent execution telemetry.
  - Zero-Trust validation governed by the in-process **AWS Cedar PDP engine** (`backend/cedarEngine.js`).
  - GenAI and agent telemetry ingestion in `backend/genaiOptimizer.js`.

---

## 🧪 Testing & Verification

Before submitting a Pull Request:
1. Ensure the frontend builds cleanly without syntax errors:
   ```bash
   cd frontend
   npm run build
   ```
2. Verify all 7 operational tabs load without console errors.
3. Test Cedar policy evaluations to ensure default-deny semantics remain intact.

---

## 🚀 Submitting Pull Requests

1. Create a feature branch:
   ```bash
   git checkout -b feat/my-awesome-feature
   ```
2. Commit your changes with clear, descriptive commit messages following the Conventional Commits specification:
   ```bash
   git commit -m "feat(cedar): add automated tag enforcement policy"
   ```
3. Push to your branch and open a PR against `main`.
4. Clearly describe the problem solved, changes made, and include screenshots or GIFs of UI changes.

---

## 📄 License

By contributing to FinOpsGuard AI, you agree that your contributions will be licensed under the [MIT License](LICENSE).
