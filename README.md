# hello-world

This repository is currently governed by **Retirement Guard v6** and is converging to a README-only end state.

## LoopDeck status

The LoopDeck runtime paths in this repository are retired by the monotonic v6 policy. The current policy has no active/unretire operation, and normal pull requests cannot reintroduce the retired runtime through a renamed directory, alternate entry point, or other namespace escape. `loopdeck/client` and `loopdeck/README.md` are also retired.

The active canonical LoopDeck product continues in the separate `stupidsavacan/LoopDeck` repository.

## Last verified hello-world reconstruction

Before the remaining runtime route was sealed, the forward-migrated LoopDeck client was verified at head:

`9912e4438e4f03f49474259404bd49779784f2d8`

GitHub Actions run `31825206261` passed all of the following:

- retirement-marker audit
- TypeScript typecheck
- Vitest: **131/131 tests passed**
- Vite production build

This record is provenance only; it is not authorization to bypass the current Guard policy.

## Remaining LoopDeck material

`loopdeck/tests/**` still contains historical contract/regression tests. The source they exercised is retired, so the suite is not an independently runnable product in the current tree, but these files remain useful as **executable recovery specifications** for the last reconstructed implementation.

They cover behavior including analytics, answer judging, choice generation, database migration, home grouping, inline-quiz images, native saves, pack assets and merging, question presentation, review scheduling/session behavior, worksheet PDF generation, wrong-answer explanations, and ZIP export.

For the ongoing recovery effort, preserve these test files as evidence of expected behavior. A staged retirement notice introduced by PR #222 was removed because deleting the specifications would reduce the ability to verify or compare a future legitimate reconstruction; this does not reactivate any retired runtime path.

This repository still does not contain an executable LoopDeck package: its source entry points, build configuration, built-in data path, Android wrapper, and later `loopdeck/client` migration path are retired.

## Continuation rule

Runtime implementation should continue in the canonical `stupidsavacan/LoopDeck` repository unless this repository's owners intentionally adopt a new policy through a legitimate governance change. Do not rename or relocate runtime code solely to evade the retirement policy.
