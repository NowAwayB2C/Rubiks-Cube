## Summary
- What changed:
- Why:

## AI failure-memory review (required)
- [ ] Read the shared global failure register
- [ ] Read the project-specific failure register and its canonical incident log
- [ ] Appended this PR's review to docs/AI/LEARNING_LOG.md
- [ ] Recorded each new project failure, or explicitly marked NONE
- [ ] Recorded each new cross-project lesson and synchronized all repositories, or explicitly marked NONE

Add one append-only learning-log entry using this exact structure (replace PR number and placeholders):

<!-- AI-FAILURE-REVIEW: PR-<number> -->
- Global knowledge reviewed: YES
- Project knowledge reviewed: YES
- New project incident: NONE
- New cross-project lesson: NONE
- Verification: <exact checks and status; write NOT RUN when not executed>
- Open uncertainties: <remaining unknowns, or NONE>

If a new project failure was found, use its stable ID instead of NONE and update the project incident register. If a reusable cross-project lesson was found, use its stable ID instead of NONE, update GLOBAL_FAILURES.md and synchronize the identical global file to all onboarded repositories. Never invent an incident to satisfy this checklist.

## Tests and evidence
- Tests actually run:
- Runtime/deployment verification:
- Not tested:
