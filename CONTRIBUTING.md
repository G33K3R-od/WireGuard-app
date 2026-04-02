# Contributing to WirePN Windows Client

Thanks for your interest in contributing.

## Development Setup

1. Fork the repository and clone your fork.
2. Install dependencies:

```bash
npm install
```

3. Start development mode:

```bash
npm run dev
```

## Branching and Commits

- Create a feature branch from `main`
- Keep commits focused and descriptive
- Reference related issues in commit messages or PR description

## Pull Requests

Before opening a PR, run:

```bash
npm run typecheck
npm run test
npm run build
```

PRs should include:

- What changed
- Why it changed
- How it was tested

## Code Style

- Keep TypeScript types explicit where it improves readability
- Avoid unrelated refactors in feature/fix PRs
- Add tests for bug fixes and critical behavior changes

## Reporting Bugs

Use the issue templates and include:

- App version
- Windows version
- Reproduction steps
- Relevant logs (without secrets)

## Security

Please do not report vulnerabilities in public issues.
Use private disclosure via GitHub Security Advisories.
