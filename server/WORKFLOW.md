# SastoMarts Git & Engineering Workflow Guidelines

---

## 1. Institutionalized Git Workflow
All contributors must adhere to this standardized Git discipline:

1. **Active Branch Continuity**: Work directly on the designated active branch (`main`). Do not spawn extraneous branches unless explicitly instructed.
2. **Atomic Logical Commits**: Group related changes into small, discrete commits that accomplish a single logical milestone.
3. **Pre-Commit Diff Review**:
   - Always run `git status` to verify modified files.
   - Always inspect `git diff` or staged changes to ensure only intended changes are included.
4. **Absolute Zero Secret Policy**:
   - Never commit `.env`, credentials, API tokens, private keys, or passwords.
   - All runtime secrets must remain strictly in untracked `.env` files matching `.gitignore`.
5. **Preserve Published History**:
   - Never execute `git push --force` or rewrite history on shared/published branches.
   - Never rebase or squash commits that have been pushed to origin.
6. **Pre-Push Quality Verification**:
   - Frontend: Verify build compiles cleanly (`npm --prefix client run build`).
   - Backend: Verify syntax and lint pass (`npm --prefix server run lint`).
   - Health Check: Verify local health endpoint responds with HTTP 200 OK.
7. **Clean Remote Push**: Push verified commits directly to the current tracking branch (`origin main`).

---

## 2. Commit Message Standards & Conventions

### Format & Language
Commit messages must be written in **clear, plain English** using the imperative mood (e.g. `Add`, `Create`, `Update`, `Document`, `Refine`).

### Conventional Prefix Prohibition
Do **NOT** use conventional commit prefixes:
- ❌ `feat: add user model`
- ❌ `fix: resolve auth validation bug`
- ❌ `chore: update dependencies`
- ❌ `refactor(client): simplify hook`
- ❌ `docs: write api specification`

### Approved Commit Message Examples
- ✅ `Add database configuration`
- ✅ `Create user model`
- ✅ `Improve authentication validation`
- ✅ `Update order service`
- ✅ `Document API structure`
- ✅ `Refine payment error handling`

---

## 3. Production Readiness & Infrastructure Standards (Planning)

When deploying SastoMarts to production in future phases, the following infrastructure standards apply:

| Domain | Standard / Target Architecture |
| :--- | :--- |
| **Frontend Hosting** | Global Edge CDN (Cloudflare Pages / Vercel) with asset compression and caching headers. |
| **Backend API** | Containerized Node.js runtime managed with process supervision (PM2 / Docker) behind a reverse proxy. |
| **Database** | MongoDB Atlas multi-region replica set with encrypted storage, automated daily backups, and VPC peering. |
| **DNS & Edge Protection** | Cloudflare CDN + Web Application Firewall (WAF) enforcing TLS 1.3, DDoS mitigation, and HTTP to HTTPS redirects. |
| **Secrets Management** | Production environment variables injected at deployment runtime via hosting secrets manager (never checked in). |
| **Monitoring & Logging** | Structured JSON logs, error tracking (Sentry), and uptime alerting on `/api/v1/health`. |
| **SEO & Accessibility** | Server-side metadata tags, semantic HTML5, and WCAG AA accessibility compliance across all e-commerce flows. |

---

## 4. Optimized Pre-Commit & Verification Checklist

Before executing any commit:
- [ ] `git status` verifies only expected files are staged.
- [ ] `git diff --staged` verified for unwanted debug code or secrets.
- [ ] No `.env` or credential files staged.
- [ ] Commit message matches plain English imperative format.
- [ ] App builds cleanly without errors.
