# Cross-Project AI Engineering Standard & Failure Register

This file is the shared, versioned source of truth for engineering lessons that apply across projects. Every AI agent must read it before changing code, configuration, tests, deployment, or infrastructure. Project-specific incidents belong in docs/AI/PROJECT_FAILURES.md or the canonical incident register named there.

## Mandatory workflow: evidence before code

1. Establish the real starting point. Read this file, the project failure register, root agent instructions, relevant architecture/docs, current branch and commit, recent relevant commits, and the last known-good state.
2. Trace the whole execution path. Follow the real request from UI to server, configuration, provider/API, persistence, and deployed runtime. Do not diagnose from a single message when logs or source can identify the failing layer.
3. Separate facts from hypotheses. Label each item CONFIRMED, PROBABLE, or UNKNOWN. State what evidence would prove or disprove each hypothesis.
4. Preserve diagnostic evidence. Keep safe upstream status, provider error code/message, endpoint, request/correlation ID, runtime/deployment commit, and timestamp. Redact credentials, tokens, private keys, bank data, personal data, and sensitive payloads.
5. Change only after locating the cause. Each change must name the specific cause it is intended to fix and explain why it can fix it. Do not make another variation of a failed change without new evidence.
6. Check configuration as well as code. Identical source code does not imply identical runtime behavior. Compare the actual deployment, environment variable presence/format (never values), key-to-application pairing, permissions/scopes, callback URLs, allowed origins/IPs, feature flags, region, and provider environment.
7. Verify the actual result. Confirm the deployed commit and runtime, then reproduce the original failing action. A successful syntax check is not a build; a build is not a runtime test; a runtime start is not proof of a successful provider operation; a deployment is not proof that the user-visible function works.
8. Stop a loop. If the same failure remains after a change, do not repeat the same approach. Re-read the new trace, reassess the hypothesis, and move to the next unverified layer.
9. Record the learning. Append the project incident to the project-specific register. Add only the reusable, anonymized lesson here. Keep resolved incidents; update their status and add the fix and regression evidence instead of deleting history.
10. Report truthfully. Distinguish what was inspected, changed, deployed, and actually tested. Never call something fixed unless the original behavior passed a relevant verification.

## Cross-project failure patterns

### GLOBAL-001 — Coding before establishing the root cause
- Pattern: A plausible explanation is treated as fact and code is changed before the failing execution stage is identified.
- Why it fails: The change may improve an unrelated layer while the original cause remains untouched, creating repeated attempts and misleading progress.
- Prevention: Trace the execution path, capture a reproducer/log, define a falsifiable hypothesis, and identify the exact line/configuration/provider response before coding.
- Rule: No evidence, no corrective code change. Add diagnostics first when evidence is missing.

### GLOBAL-002 — Discarding the provider's actual error response
- Pattern: Code throws only a generic HTTP status and drops the response body from an external service.
- Why it fails: HTTP 401/403/404/409/429/5xx identifies a response class, not the provider's specific reason; different causes require different fixes.
- Prevention: Parse and safely record allowlisted provider fields (error code, bounded message/detail, endpoint, status, upstream request ID). Do not store raw bodies by default. Never log secrets or sensitive account data.
- Origin: Confirmed in the Money API history; see that project's incident register.

### GLOBAL-003 — Mistaking an internal correlation token for the actual error
- Pattern: A random application-generated reference is interpreted as a provider error code or root cause.
- Why it fails: The token only correlates a user-visible message to a server log entry.
- Prevention: Inspect the matching server log and its underlying exception. Label reference tokens explicitly as correlation IDs, never as diagnoses.
- Origin: Confirmed in the Money API handler, where a random token is generated for each failed request.

### GLOBAL-004 — Assuming identical code means identical deployment/configuration
- Pattern: A previously working codebase is copied to a different host or runtime and expected to work with no further verification.
- Why it fails: Secrets, secret formatting, key pairing, environment, callback registration, outbound IP, scopes, provider activation, storage and network policy may differ.
- Prevention: Compare a sanitized configuration checklist and verify the exact deployed commit/runtime before attributing the difference to code.

### GLOBAL-005 — Treating a build or deployment as a functional test
- Pattern: A green build, successful process start, merge, or live deployment is reported as proof that the user workflow works.
- Why it fails: These checks prove only their own stage, not authentication, provider access, database behavior, browser behavior, or end-to-end success.
- Prevention: Use explicit evidence levels and test the original user action at the relevant layer. Record NOT RUN when it was not executed.

### GLOBAL-006 — Continuing to repair an earlier layer after execution has moved on
- Pattern: The parser/configuration layer is modified repeatedly even after the request has passed that layer and now fails at an external API.
- Why it fails: A fix to the previous stage cannot resolve the new rejection.
- Prevention: Reclassify the failing stage from each new trace. Once a stage is demonstrably passed, freeze it unless new evidence points back to it.

## Incident record requirements

Every project incident must record:
- Stable ID, date/time and status (OPEN, INVESTIGATING, RESOLVED, WONT_FIX).
- Exact symptom/error and affected component, endpoint, commit and deployment where known.
- Expected versus actual result and reproducible steps.
- Root cause evidence grade (CONFIRMED, PROBABLE, UNKNOWN).
- What was tested and what was not tested.
- Fix/commit and regression verification; keep history append-only.
- A generalized cross-project lesson here only when it is reusable beyond the originating project.

Never store credentials, private keys, session tokens, passwords, full bank data, or unnecessary personal data in Git. Do not invent missing trace details. Keep GitHub Actions/builds/tests proportionate; avoid unnecessary workflow runs.

## Mandatory pull-request learning gate

Every pull request must append one uniquely identified review record to `docs/AI/LEARNING_LOG.md`, even when no defect or new reusable lesson was found. The record must state that the global and project registers were reviewed, whether a project incident was added, whether a cross-project lesson was added, what verification actually ran, and what remains unresolved.

The PR template and `.github/workflows/ai-failure-memory-gate.yml` validate this. The required status check is named **AI failure-memory review**. Repository administrators must require that check on the default branch and require pull requests; otherwise the workflow reports failures but GitHub does not block merging. Do not invent incidents to satisfy the gate: use `NONE` when the review found none.

When a new project incident is found, append it to `docs/AI/PROJECT_FAILURES.md` (or the canonical register named there). When a reusable cross-project lesson is found, append it to `docs/AI/GLOBAL_FAILURES.md` and synchronize the exact updated file to every registered repository, then verify identical content.

For every new repository created or adopted for this user, run `docs/AI/NEW_REPOSITORY_BOOTSTRAP.md` before the first code change.


### GLOBAL-007 — Carrying project context across an explicit project switch
- Pattern: A follow-up request is applied to the repository used in the preceding chat/task even though the latest request names a different product, or the product name maps to multiple repositories.
- Confirmed example: On 2026-11-10, a request meant for the NowAway travel project was applied to NowAway Brain because the immediately preceding context was Brain. The Brain CSS was restored byte-for-byte to its pre-task blob in rollback commit `3681f65db87463c399296cc5bdde76058afbd9eb`; see `NowAwayB2C/NowAway_Brain` incident `INCIDENT-2026-11-10-013`.
- Why it fails: Conversation continuity is not repository identity. Similar product names, multiple active repositories, browser tabs and service associations can make stale context feel more authoritative than the latest user instruction.
- Prevention: Read `docs/AI/PROJECT_ROUTING.md` and resolve product + exact repository name + numeric GitHub ID from the latest user request on every task. A project switch resets the previous repository/branch/service scope. Before any mutation, create a scope lock containing product, repository ID, branch, target paths and deployment service/URL. If ambiguous, fail closed and ask one direct clarification.
- Enforcement limitation: Instructions and memory files cannot force an AI or tool to comply. Require PR review and a CI scope-record check through branch protection; restrict deployment permissions to the intended service. Never claim absolute prevention from prompts alone.
