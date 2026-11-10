# Repository-wide Copilot instructions

Before any code, configuration, test or deployment change:
1. Read the root AGENTS.md.
2. Read docs/AI/GLOBAL_FAILURES.md and docs/AI/PROJECT_FAILURES.md.
3. Read any canonical incident register or project-specific instructions referenced there.
4. Inspect the actual branch/commit, relevant source, environment metadata and logs. Separate facts from hypotheses.
5. Diagnose the failing layer before changing code. Add safe diagnostics if the provider/runtime reason is hidden.
6. Do not repeat a failed fix without new evidence. Do not modify an earlier layer after the request has demonstrably passed it.
7. Verify the deployed/runtime commit and reproduce the original user workflow; a passing build is not an end-to-end test.
8. Append project-specific incidents and generalized anonymized learnings to their respective registers. Keep history append-only.
Never commit or log secrets, private keys, passwords, tokens, or sensitive personal data. Preserve all existing project instructions and required branch/PR workflows. If these files or GitHub access are unavailable, disclose that the shared failure memory could not be loaded.
