# Contributing to WirePN Windows Client

Thanks for your interest in contributing.

## Contribution workflow

1. **Check existing work** — Search the issue tracker and open PRs so you do not duplicate effort. Comment on an issue if you plan to work on it.
2. **Open or pick an issue** — For non-trivial changes, open an issue first (or use an existing one) to align on scope and approach. Small fixes (typos, obvious bugs) can go straight to a PR with a short description.
3. **Fork and branch** — Fork the repository, clone your fork, and create a branch from `main`:

   ```bash
   git checkout -b short-description-of-change
   ```

4. **Develop** — Follow the setup below. Keep changes focused on one concern per PR.
5. **Validate locally** — Before opening a PR, run the checks in [Pull requests](#pull-requests).
6. **Open a PR** — Target `main`. Describe what changed, why, and how you tested. Link related issues (`Fixes #123`).
7. **Review** — Address feedback from maintainers. Once approved, a maintainer will merge.

## Development setup

1. Fork the repository and clone your fork.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development mode:

   ```bash
   npm run dev
   ```

## Branching and commits

- Create a feature branch from `main`.
- Keep commits focused and descriptive.
- Reference related issues in commit messages or the PR description.

## Releases (maintainers)

Tagging and GitHub Release assets are described in [`RELEASING.md`](RELEASING.md).

## Pull requests

Before opening a PR, run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

PRs should include:

- What changed
- Why it changed
- How it was tested

## Code style

- Keep TypeScript types explicit where it improves readability.
- Avoid unrelated refactors in feature or fix PRs.
- Add tests for bug fixes and critical behavior changes.

## Reporting bugs

Use the issue templates and include:

- App version
- Windows version
- Reproduction steps
- Relevant logs (without secrets)

## Security

Please do not report vulnerabilities in public issues. Use private disclosure via GitHub Security Advisories.
