# SastoMarts Git & Development Workflow

## Git Development Workflow
1. **Current Branch:** Always develop on the designated active branch (`main`). Do not create unneeded branches.
2. **Small Logical Commits:** Break tasks into small, self-contained, reviewable commits.
3. **Pre-Commit Diff Inspection:** Run `git status` and `git diff` before staging to avoid accidental inclusions.
4. **Zero Secret Policy:** Never commit `.env`, credentials, API keys, or private certificates.
5. **No Force Push:** Never run `git push --force` or rewrite published remote history.
6. **Pre-Push Quality Verification:** Always test `npm run build`, `npm run lint`, and verify backend health before pushing.
7. **Clean Push:** Push completed commits to the configured remote repository on the active branch.

## Commit Message Standards
- **Style:** Direct, plain English description of what was accomplished.
- **Convention:** Do NOT use conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`).
- **Good Examples:**
  - `Add database configuration`
  - `Create user model`
  - `Improve authentication validation`
  - `Update order service`
  - `Document API structure`
