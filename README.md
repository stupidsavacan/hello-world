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

## Preserved hello-world recovery snapshot

The surviving LoopDeck regression specifications were deliberately preserved at hello-world main commit:

`8495f96344410d603004c972f287a425510ec9dd`

The post-merge Retirement Guard run `31826669213` completed successfully. This snapshot is the recovery reference for the remaining `loopdeck/tests/**` material after the staged test-retirement notice from PR #222 was removed by PR #223.

## Canonical cross-check

Cross-check performed on 2026-08-15 JST.

The canonical `stupidsavacan/LoopDeck` repository main was:

`a45d9cb1750d36c83c1f23d50c5597aef5dc5b09`

That canonical tree contains the active web application, Android wrapper, built-in data, and the recovered history image assets. The four history images retain the previously recovered Git blob identities:

- `graph63.png` — `653fe9ec8ab555a4426f36b78069f3826de66a35`
- `map62.png` — `cd0926c65c6c3aeb4cec7de6fbf02b061681a97e`
- `map64.png` — `319aea6f42fe3c2f02ccfb0e31eee17be7c13e51`
- `relation63.png` — `c9b87a533866e58a8b85de442cd14c0850671a45`

Canonical PR #22 is an **unmerged enhancement**, not the baseline above. Its head `0c6dac063530e37d0483efa9205f5206bc53f418` records successful LoopDeck CI with **147 tests passed**, the TypeScript/Vite production build, Android Debug APK build, and Android Signed Release APK build. Treat that head as additional validated implementation evidence until or unless it is merged.

## Remaining LoopDeck material

`loopdeck/tests/**` still contains historical contract/regression tests. The source they exercised is retired, so the suite is not an independently runnable product in the current tree, but these files remain useful as **executable recovery specifications** for the last reconstructed implementation.

They cover behavior including analytics, answer judging, choice generation, database migration, home grouping, inline-quiz images, native saves, pack assets and merging, question presentation, review scheduling/session behavior, worksheet PDF generation, wrong-answer explanations, and ZIP export.

For the ongoing recovery effort, preserve these test files as evidence of expected behavior. A staged retirement notice introduced by PR #222 was removed because deleting the specifications would reduce the ability to verify or compare a future legitimate reconstruction; this does not reactivate any retired runtime path.

This repository still does not contain an executable LoopDeck package: its source entry points, build configuration, built-in data path, Android wrapper, and later `loopdeck/client` migration path are retired.

## Continuation rule

Runtime implementation should continue in the canonical `stupidsavacan/LoopDeck` repository unless this repository's owners intentionally adopt a new policy through a legitimate governance change. Do not rename or relocate runtime code solely to evade the retirement policy.
