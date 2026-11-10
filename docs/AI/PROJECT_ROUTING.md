# Canonical Project Router

**Purpose:** Stop cross-chat and cross-repository edits from landing in the wrong application. This file is the canonical project-identity map for work in the NowAwayB2C GitHub account.

## Non-negotiable scope rule

The **latest user request** determines the target project. Previous chat history, the last open browser tab, a previously selected repository, the last deployment, or a task completed immediately beforehand is not authority to choose the next target.

When the latest request explicitly names a different project, treat that as a project switch and discard the previous project's repository/branch/service as the target. Use prior context only for requirements that clearly remain relevant to the newly named project.

A generic follow-up such as "make it white", "remove that", or "change this too" does not authorize an inferred repository when multiple projects are plausible. Read-only discovery may identify candidates; **no Git write, file write, PR, deployment, configuration change, or other mutation is allowed until the exact target is resolved**. Ask one direct clarification when needed.

## Verified repository map

Repository identity and numeric IDs were checked against the live GitHub repository list and metadata on 2026-11-10. IDs are the stable distinguishing values; names alone are not enough.

| Product / purpose | Exact repository | GitHub repository ID | Routing terms / recognition |
|---|---|---:|---|
| Shared cross-project instructions and failure memory | `NowAwayB2C/THE-INTERNET` | `1341942635` | Global engineering memory, canonical router and shared standards |
| NowAway Brain | `NowAwayB2C/NowAway_Brain` | `1444847966` | "NowAway Brain", "Brain", "KI-Wissensplattform", personal knowledge system, Brain OneDrive UI |
| NowAway travel portal / BookedAIChat Goal-Tree codebase | `NowAwayB2C/NowAway` | `1346606745` | "NowAway" when the user explicitly means this repository, "BookedAIChat Goal-Tree" |
| NowAway active travel-planning / Booked AI application | `NowAwayB2C/NOWAWAY02` | `1414668806` | "NOWAWAY02", explicit active Booked AI planner / agent-engineering references |
| Private Revolut balance dashboard | `NowAwayB2C/Money` | `1447534746` | "Money", private read-only Revolut balance dashboard |
| Personal money/time dashboard | `NowAwayB2C/gehirn` | `1419855297` | "gehirn", "Nowaway Geld: Revolut Pro"; not NowAway Brain |
| Photo archive repository | `NowAwayB2C/Photos` | `1447498956` | "Photos", "GitHub Fotos" |
| Test-file repository | `NowAwayB2C/Test-Dateien` | `1351643016` | "Test-Dateien", test files |
| Dyad local AI app-builder repository | `NowAwayB2C/Internet` | `1350034917` | "Internet" or "Dyad"; separate from THE-INTERNET |
| Rubik's Cube project | `NowAwayB2C/Rubiks-Cube` | `1441814325` | "Rubiks-Cube", Rubik's Cube project |

## Ambiguous NowAway references

There are **two separate travel repositories**: `NowAwayB2C/NowAway` and `NowAwayB2C/NOWAWAY02`. A bare "NowAway" does not by itself prove which of those two is intended when both could contain the requested feature.

Use concrete clues from the latest request (for example, a named live URL, feature, code path, or repository name) and verify those clues against current repository metadata and project instructions. If one repository still cannot be established confidently, ask which one. Never silently select Brain because it was the active project in a prior chat; never silently select a travel repository just because it was used most recently.

Also keep these projects distinct:
- `NowAway_Brain` is the personal knowledge / OneDrive application.
- `gehirn` is a separate money/time dashboard.
- `Money` is a separate read-only Revolut balance app.
- `Internet` is the Dyad codebase; `THE-INTERNET` is the shared rules repository.

## Mandatory pre-mutation scope lock

Before the first write or deploy in every task, establish and record this exact tuple:

1. **Product:** the application the latest request names.
2. **Repository:** full GitHub repository name **and numeric ID**.
3. **Branch:** the existing or newly created branch that will receive the change.
4. **Target:** exact files/configuration in scope.
5. **Runtime/deployment:** service ID and URL, only when deployment is requested or required by an established project rule.

Cross-check the tuple against the latest user wording, the repository's root `AGENTS.md`, its project manifest/README, live GitHub metadata, and (for deploys) the actual hosting-service repository and branch. If any source disagrees, stop before mutation.

For an unambiguous request, proceed with the verified scope; do not make the user confirm every routine change. For an ambiguous request, the scope lock is blocked until one concise clarification is answered.

## Project-switch procedure

- Re-resolve project identity on **every new task**, including within the same chat.
- Explicit project names in the latest user turn override the project used in preceding turns.
- Never copy code, styling, environment settings, deployment IDs or assumptions from one product to another without an explicit multi-project request.
- A browser tab, uploaded file, prior PR or familiar path is supporting evidence, not proof of the latest target.
- For requests spanning multiple projects, list each exact repository and the operation intended for it before mutating any of them.
- If the central router or a local project manifest is unavailable, use read-only discovery and ask before any mutation. Do not invent a repository mapping.

## What this control can and cannot guarantee

This file and local `AGENTS.md` rules are durable instructions, not a technical sandbox: they only guide an AI/tool workflow that actually reads and obeys them. Stronger enforcement requires branch protection, required review of the repository/branch/changed-file scope, a CI check that rejects PRs without a completed scope record, and deployment permissions restricted to the intended service. No prompt or memory file can honestly guarantee that an AI will never make a mistake; the fail-closed process makes an unresolved mistake stop before it changes code or a deployment.

## Incident that motivated this rule

On 2026-11-10, a request intended for the NowAway travel project was mistakenly applied to NowAway Brain because the previous conversation context was carried forward. The Brain CSS was restored byte-for-byte to its pre-task blob in rollback commit `3681f65db87463c399296cc5bdde76058afbd9eb`. See Brain incident `INCIDENT-2026-11-10-013` and global lesson `GLOBAL-007`.
