# AI Agent Instructions — Rubiks-Cube

This repository uses versioned, append-only engineering memory. Before any technical work, read:
1. docs/AI/GLOBAL_FAILURES.md — shared engineering standard and cross-project failure patterns.
2. docs/AI/PROJECT_FAILURES.md — failures and learnings specific to this repository.
3. Any additional project-specific rules referenced below or in the relevant code area.

## Evidence before code
Establish the live branch/commit and last known-good state; trace the complete execution path; distinguish confirmed facts from hypotheses; add safe diagnostics when evidence is missing; make only evidence-based changes; and verify the original user workflow against the actual runtime/deployment. Do not repeat the same ineffective fix without new evidence. A green build is not proof of end-to-end behavior.

## Failure memory
Append every newly observed project-specific failure to docs/AI/PROJECT_FAILURES.md or the canonical incident register named there. Add generalized, anonymized lessons to docs/AI/GLOBAL_FAILURES.md. Never delete resolved incidents; retain their fix and regression-test evidence. Never commit secrets, credentials, private keys, tokens, passwords, or sensitive personal data.

## Repository-specific rules
Read and preserve existing README, CONTRIBUTING, architecture, security, deployment and nested agent instructions. They remain in force and are not replaced by this file. Use branches/PRs and required tests where the repository requires them. Do not claim a fix, test, deployment or write-back unless it was verified.
