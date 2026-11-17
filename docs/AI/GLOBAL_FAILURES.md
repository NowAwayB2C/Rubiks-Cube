# Cross-Project AI Engineering Standard & Failure Register

This file is the shared, versioned source of truth for cross-project engineering AND operational lessons. Every AI agent must read it before any non-trivial task that changes code, configuration, data, persistent state, external systems, or user-facing outcomes—including automations, calendars, email, files, account operations, and multi-source research. Project-specific incidents belong in docs/AI/PROJECT_FAILURES.md or the canonical incident register named there. Project-specific incidents belong in docs/AI/PROJECT_FAILURES.md or the canonical incident register named there.

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


## Mandatory cross-task self-review and fail-closed gate

Apply this gate to every non-trivial task that reads from or changes an external system, persistent data, or user-visible state—not only software engineering.

1. **Define the scope before acting.** Identify every required source, account, calendar, repository, folder, page, date range, and expected postcondition. Record what is in scope and what is not.
2. **Use stable identity, never accidental position.** Join records by canonical provider IDs or verified stable keys. Array indexes, display names, result order, and truncated labels are not identities. If an index-to-ID mapping is used for compact storage, validate every entry against its canonical ID and reject missing, duplicate, out-of-range, or mismatched mappings.
3. **Prove collection completeness.** Follow every pagination cursor until the provider returns no next cursor / no more results. Track completion separately for every source. A successful first page, a partial list, or a successful tool response is not a complete collection.
4. **Normalize both sides identically.** Baseline and live records must pass through the same deterministic parser, canonicalizer, timezone/date conversion, identity-key builder, and field normalization. Do not compare records built with different schemas or ad-hoc rules.
5. **Check invariants before comparing or acting.** Require unique stable keys, valid source identities, expected field types, valid time-window boundaries, controlled overlap deduplication, no unprocessed cursors, and reconciled counts. Unexpected discrepancies are blockers, not items to silently repair by guessing.
6. **Fail closed.** If any required source, page, mapping, parser, permission, or validation is incomplete, do not update the authoritative baseline, report success, send a definitive change notification, or perform irreversible/destructive follow-up actions. Preserve the last known-good state and report the exact blocker.
7. **Commit state transactionally.** Stage writes separately from the active state. Read back and parse every written artifact, verify its content and cross-file references, then switch the authoritative pointer/manifest as the final operation. If any read-back fails, do not switch.
8. **Verify the actual postcondition independently.** After every write, move, send, delete, deployment, or other side effect, re-read the authoritative destination or provider state and confirm the intended result. A tool's accepted request or success flag is not proof that the intended final state exists.
9. **Test the real data path.** Test the production parser, identity mapping, pagination loop, diff logic, and transaction/notification guard with representative fixtures and failure injection. Generic Map/Set demonstrations do not prove that real records are parsed correctly.
10. **Prevent duplicate side effects.** Before retrying a send, move, delete, commit, payment, or other non-idempotent action after an ambiguous result, inspect the destination/provider state first.
11. **Separate evidence from interpretation.** Label facts as CONFIRMED, PROBABLE, or UNKNOWN. Report exact completed scope, skipped scope, tests actually run, side effects verified, and remaining uncertainties.
12. **Learn from every failure.** Record the observed symptom, proven root cause, why the former control failed, corrective control, and regression evidence in the durable failure register. Reuse the rule in future work; do not merely promise to remember it.

**Completion invariant:** A task may be called complete only when every mandatory source and page was processed, all identity/data invariants passed, all intended side effects were independently read back, and no unresolved blocker remains. Otherwise its status is PARTIAL or BLOCKED. Never turn uncertainty into success language.

## Cross-project failure patterns

### GLOBAL-007 — Incomplete multi-source collection and unverified record identity
- **Pattern:** A stateful comparison was assembled from multiple provider calls. Some pagination cursors were not proven exhausted, and a compact stored record used a positional calendar reference that did not match the canonical calendar identity encoded in the record and returned by the live provider. The run's generic comparison tests did not exercise the real record parser or mapping.
- **Confirmed evidence:** In the inspected iCloud baseline, at least one stored event row had calendar index `1`, which resolved through the stored calendar-name table to a different calendar than the canonical calendar ID associated with that event. A live provider lookup for the same event returned the canonical calendar ID, confirming the mismatch. The run also had outstanding Google pagination tokens that were not proven exhausted for every calendar. No new baseline was committed.
- **Why the previous controls failed:** Validation checked that the index existed, not that it resolved to the event's canonical calendar ID; pagination was orchestrated across separate calls without a single per-calendar completion ledger; tests exercised generic comparison maps rather than the production parser and key builder.
- **Prevention:** Maintain a per-source/per-calendar ledger of every page token and completion status; reject any remaining token. Validate every compact index against the canonical provider ID on both stored and live records. Build keys from canonical IDs plus provider event/instance IDs. Use the same production normalization function for baseline and live data. Run integration tests covering wrong-but-in-range indexes, reordered calendars, missing/duplicate IDs, recurring instances, boundary-window overlap, partial pagination, cursor repetition, and interrupted writes. Commit a new snapshot only after all invariants and independent read-backs pass.
- **Status:** Root-cause class and observed baseline mismatch CONFIRMED; original introduction point of the bad stored mapping UNKNOWN; full corrected calendar comparison NOT YET RUN. The baseline must remain unchanged until a separate complete repair and validation.
