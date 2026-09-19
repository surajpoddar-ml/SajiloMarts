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
