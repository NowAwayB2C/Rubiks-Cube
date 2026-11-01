# ChronoFlow — Single-Action Timer & Stopwatch with Cloud History

ChronoFlow is a focused, distraction-free timing application featuring a single dynamic primary action button (and Spacebar control) that runs a 2-minute countdown before automatically transitioning into an open-ended precision stopwatch. Sessions are synchronized to Firebase Firestore for authenticated Google users and exportable as formatted JSON records.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during the interactive clarification phase:

- **Confirmed Decision 1 (Authentication)**: 1-click Google Sign-In with persistent session state in Firebase. The auth button toggles dynamically between "Mit Google anmelden" and "Abmelden (User Profil)".
- **Confirmed Decision 2 (Export Format)**: Structured `.json` export containing complete session metadata (start time, 2-minute completion timestamp, total elapsed stopwatch time, total session duration, formatted date & time).
- **Confirmed Decision 3 (Transition Cue)**: Purely visual transition pulse (fluid color shift and subtle ripple animation on the timer ring and button) when the 2-minute countdown concludes and the stopwatch activates, without audio beeps.
- **Single-Button Constraint**: Only ONE primary interaction button exists on screen at any time: "Starten" (idle) -> "Stoppen" (during timer & stopwatch) -> "Zurücksetzen / Neu starten" (finished). The Spacebar hotkey triggers this exact same primary action.

---

### 1. Overview & Core Concept

- **What It Does**: Provides an ultra-clean timing flow where a user presses a single primary button (or hits Spacebar) to begin a 2-minute countdown (120 seconds). Once 00:00 is reached, the app seamlessly rolls into an ascending stopwatch without pause, measuring extra overtime. Pressing the button stops the timer, captures the exact stopwatch duration, records the entry into a history list, and syncs it with Firebase Firestore.
- **Target Audience / Persona**: Professionals doing timed exercises (e.g. 2-minute planks, speech drills, calibration holds, sprints, Pomodoro bursts) where tracking overtime beyond the 2-minute minimum is critical.
- **Key Value**: Zero distraction, instant keyboard operability, zero cognitive load (only one main button to press), and permanent cloud history with instant JSON backup.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Idle State**:
   - Clean, dark slate instrumental canvas (`#090D16` / `#0F172A`).
   - Center displays `02:00.00` in crisp monospace tabular figures (`font-mono tabular-nums`).
   - Single large primary button: `"Starten"` (or Spacebar).
   - Top bar: Minimal brand logo on left, JSON Export button and Google Sign-In/Out on right.
2. **Phase 1: 2-Minute Countdown Running**:
   - Timer counts down from `02:00.00` to `00:00.00` with millisecond precision.
   - Primary button transforms to crimson/amber `"Stoppen"` (Spacebar works).
   - Subtle radial progress ring smoothly depletes.
3. **Phase 2: Automatic Stopwatch Transition (Overtime)**:
   - When reaching 0, the border and display pulse gently in electric cyan/emerald, indicating stopwatch mode.
   - Timer automatically counts UP from `+00:00.00` onwards.
   - Primary button remains `"Stoppen"`.
   - Distinctive badge indicator shifts from `"Countdown läuft"` to `"Stoppuhr aktiv (Nachspielzeit)"`.
4. **Session Stoppage & Saving**:
   - User hits `"Stoppen"` (or Spacebar).
   - Session instantly logged: Date & Time, 2-Minute Goal Met (Yes/No), Stopwatch Overtime Duration, Total Duration.
   - If signed in with Google, automatically writes to Firestore collection `timer_sessions`. If guest, stored in browser local storage and synched upon login.
   - Main button label switches to `"Neuer Durchgang"`.
5. **History & Export**:
   - Below the central timer viewport, a clean, dense tabular history log displays past sessions with delete option.
   - Top-bar `"Exportieren (.json)"` button downloads `chronoflow_history_<timestamp>.json`.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-precision studio chronometer / laboratory instrument. Clean, utilitarian, and uncluttered.
- **Color Palette**:
  - Background (60%): Deep Slate Canvas (`#0B0F19`) with subtle radial glow.
  - Surface (30%): Dark Slate Cards (`#131B2E`) with 1px hairline borders (`rgba(255, 255, 255, 0.08)`).
  - Accents (10%):
    - Idle/Start: Vibrant Emerald / Teal (`#10B981` / `#14B8A6`).
    - Running Countdown: Amber / Orange (`#F59E0B`).
    - Stopwatch Overtime: Cyan / Electric Blue (`#06B6D4` / `#3B82F6`).
    - Stop Action: Crimson (`#EF4444`).
- **Typography**:
  - Brand & Headers: `Plus Jakarta Sans` or modern sans geometric.
  - Time & Numeric Readout: High-contrast `JetBrains Mono` / `Space Mono` (`tabular-nums font-mono`).
- **Component Styling & Layout**:
  - Strictly follows the Top Bar Contract (Wordmark — Navigation / Space — Action controls).
  - Center stage features the large, legible circular/pill timer dial.
  - Big thumb-friendly primary button at the center bottom, with keyboard shortcut helper hint `[ Leertaste ]`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Single Button Finite State Machine (FSM)**:
  - *Chosen Approach*: The button state transitions predictably: `IDLE` -> `COUNTDOWN` -> `STOPWATCH` -> `STOPPED` -> `IDLE`.
  - *Why*: User explicitly mandated "es gibt immer nur einen button und man kann es auch mit der leertaste drücken". A unified FSM ensures no conflicting actions or button clutter.
- **Decision 2: High-Precision RAF / Timestamp Delta Timing**:
  - *Chosen Approach*: Calculate elapsed time using `performance.now()` / `Date.now()` delta rather than naive `setInterval(10)`.
  - *Why*: Browsers throttle intervals when tabs lose focus or CPU spikes. Timestamp delta ensures 100% mathematical accuracy for stopwatch and countdown.
- **Decision 3: Firebase Integration & Offline Resilience**:
  - *Chosen Approach*: Use Firebase Firestore + Google Auth. When guest, save locally and offer smooth migration into cloud upon sign-in.
  - *Why*: Allows instant testing without forcing a login wall, while honoring user's Google Sign-In requirement for persistent cross-device records.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌──────────────────────────────────────────────────────────────────┐
│                          ChronoFlow Top Bar                      │
│   [ChronoFlow ⏱️]              [Export JSON]   [Google Auth]      │
└──────────────────────────────────────────────────────────────────┘
                                 │
┌──────────────────────────────────────────────────────────────────┐
│                     Central Timing Viewport                      │
│                                                                  │
│                     ┌──────────────────────┐                     │
│                     │      02:00.00        │                     │
│                     │  [ Phase Indicator ] │                     │
│                     └──────────────────────┘                     │
│                                                                  │
│                     ┌──────────────────────┐                     │
│                     │  [ PRIMARY BUTTON ]  │ <── Spacebar        │
│                     │     "Starten"        │                     │
│                     └──────────────────────┘                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                 │
┌──────────────────────────────────────────────────────────────────┐
│                   History & Records Data Table                   │
│   Datum & Uhrzeit  │  Timerzeit  │  Stoppuhr  │  Gesamt  │ Aktionen│
│   01.11.2026 13:15 │  02:00.00   │  00:43.12  │ 02:43.12 │ [Delete]│
└──────────────────────────────────────────────────────────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
        [ Firebase Firestore ]         [ Local Storage ]
        users/{uid}/sessions           chronoflow_cache
```

#### Data Model (`timer_sessions`)

```typescript
interface TimerSession {
  id: string;
  userId?: string;
  startedAt: string;          // ISO String
  stoppedAt: string;          // ISO String
  timerDurationMs: number;    // Exactly 120,000 ms (or time elapsed if stopped early)
  stopwatchDurationMs: number;// Overtime beyond 2 minutes (0 if stopped early)
  totalDurationMs: number;    // timerDurationMs + stopwatchDurationMs
  completedCountdown: boolean;// true if countdown reached 00:00
  createdAt: number;          // timestamp for sorting
}
```

#### Interactive Handlers & Key Sequences
- `onPrimaryAction()`: Triggers Start / Stop / Reset depending on `timerState`.
- `window.addEventListener('keydown')`: Listens for `e.code === 'Space'`, prevents page scroll, triggers `onPrimaryAction()`.
- `exportToJson()`: Generates a Blob from sessions state, triggers clean programmatic download.
- `handleGoogleAuth()`: Standard Firebase `signInWithPopup(auth, googleProvider)`.
- `syncSessions()`: Firestore realtime listener (`onSnapshot`) scoped to `where("userId", "==", user.uid)`.

---

### Next Execution Steps
1. Provision Firebase database and authentication via AI Studio setup tool.
2. Configure `firebase-blueprint.json` and deploy hardened `firestore.rules`.
3. Implement ChronoFlow application components (`TimerDisplay`, `PrimaryActionButton`, `HistoryTable`, `AuthBar`, `ExportButton`).
4. Validate compilation, tests, and responsiveness.
