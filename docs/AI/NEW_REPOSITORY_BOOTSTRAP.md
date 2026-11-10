# New repository onboarding — mandatory AI failure memory

Run this before the first code/configuration change in every new repository created for or adopted into the user's GitHub workspace.

## Required files
1. Copy the current byte-identical `docs/AI/GLOBAL_FAILURES.md` from an already onboarded repository.
2. Create `docs/AI/PROJECT_FAILURES.md` with a project-specific, append-only incident register and evidence grades (CONFIRMED / PROBABLE / UNKNOWN).
3. Create `docs/AI/LEARNING_LOG.md` as an append-only record of every PR's review of prior failures and new learning.
4. Add root `AGENTS.md` instructions requiring every AI to read all three files before technical work, diagnose from evidence before code, and append a review record for each PR.
5. Add provider entry points for the AIs actually used: `.github/copilot-instructions.md`, `.cursor/rules/ai-failure-memory.mdc`, `CLAUDE.md`, and `GEMINI.md`. Each must direct the agent to root AGENTS.md and all failure-memory files.
6. Add `.github/PULL_REQUEST_TEMPLATE.md` and `.github/workflows/ai-failure-memory-gate.yml` from an onboarded repository, adapting only the project-register path if necessary.
7. Preserve any pre-existing project incident register and rules; link to the canonical register instead of creating a duplicate source of truth.

## Required behavior for every PR
- Read the shared global failure register and the project's failure register/canonical incidents.
- Append a unique entry in `docs/AI/LEARNING_LOG.md`, even if the conclusion is "no new incident and no new cross-project lesson".
- If a new project incident exists, record it in the project register and link the fix and regression evidence.
- If a reusable lesson exists, add it to the global register and synchronize that exact file to every onboarded repository.
- State the real verification level and all unresolved questions. A build/deployment is not an end-to-end proof.
- The PR must pass the **AI failure-memory review** status check.

## Actual GitHub enforcement — required administrator setup
A workflow alone cannot block merging. In repository Settings, configure a branch protection rule or ruleset targeting the default branch:
- Require a pull request before merging (block direct pushes).
- Require the status check named `AI failure-memory review`.
- Do not allow bypassing the rule, where the plan/settings allow it.
- Keep bypass access limited to the minimum necessary.

GitHub's required status checks and pull-request requirements are the actual merge gate. If an AI or contributor has write access but does not update the learning log, the required check must fail and prevent merge.

## Limits and honesty
A repository cannot force an unrelated AI product to read its files or force an administrator to configure branch protection. The agent must have repository access and load these instructions. If the required status check is not configured as required, report that merge enforcement is NOT ACTIVE. Never claim universal enforcement until the ruleset is verified.
