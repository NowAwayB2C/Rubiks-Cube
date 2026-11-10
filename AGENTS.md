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


## Mandatory per-PR learning and merge gate
Before any technical work, read docs/AI/GLOBAL_FAILURES.md, docs/AI/PROJECT_FAILURES.md and docs/AI/LEARNING_LOG.md, plus the canonical incident register linked from the project register. Every PR must append a unique entry to docs/AI/LEARNING_LOG.md, even when both incident and reusable-learning outcomes are NONE. Record evidence, actual verification and unresolved questions. New project incidents must be appended to the project/canonical incident register; reusable lessons must be added to GLOBAL_FAILURES.md and synchronized byte-for-byte to every onboarded repository. Complete the PR checklist and pass the AI failure-memory review check. For every new repository created or adopted, run docs/AI/NEW_REPOSITORY_BOOTSTRAP.md before the first code change. If branch protection does not require the check, explicitly report that merge enforcement is not active.


## Mandatory project identity gate
Before any task that could touch code, files, Git, configuration, a PR or a deployment, read `docs/AI/PROJECT_ROUTING.md` and `docs/AI/GLOBAL_FAILURES.md` together with the project-specific manifest and instructions. The **latest user request** resolves the target; never inherit the repository, branch or service from the preceding chat after a project switch. Before the first mutation, establish: product, full repository name + numeric GitHub ID, branch, target paths and (for deployment) exact service ID/URL. Verify the repository ID from live GitHub metadata and confirm the hosting service is connected to that repository and branch. If the exact target is ambiguous, allow read-only discovery only; stop before writes/deployments and ask one direct clarification.
