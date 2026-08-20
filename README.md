# hello-world

This repository is currently governed by **Retirement Guard v6** and is converging to a README-only end state.

## LoopDeck status

The LoopDeck runtime paths in this repository are retired by the monotonic v6 policy. The current policy has no active/unretire operation, and normal pull requests cannot reintroduce the retired runtime through a renamed directory, alternate entry point, or other namespace escape. `loopdeck/client` and `loopdeck/README.md` are also retired.

The active canonical LoopDeck product continues in the separate `stupidsavacan/LoopDeck` repository.

## Last verified hello-world reconstruction

Before the remaining runtime route was retired, the forward-migrated LoopDeck client was verified at head:

`9912e4438e4f03f49474259404bd49779784f2d8`

GitHub Actions run `31825206261` passed all of the following:

- retirement-marker audit
- TypeScript typecheck
- Vitest: **131/131 tests passed**
- Vite production build

This record is provenance only; it is not authorization to bypass the current Guard policy.

## Preserved pre-retirement test snapshot

PRs #224 and #226 subsequently removed all 18 non-Guard LoopDeck tests from `main`. Those deleted TypeScript tests cannot be re-added by an ordinary PR under the current v6 marker freeze without violating the retirement policy.

The exact pre-deletion tree remains preserved at commit:

`8495f96344410d603004c972f287a425510ec9dd`

and is pinned by the archival branch:

`archive/loopdeck-tests-pre-retirement-8495f963`

That snapshot contains the historical contract/regression tests before the two deletion stages. They cover behavior including analytics, answer judging, choice generation, database migration, home grouping, inline-quiz images, native saves, pack assets and merging, question presentation, review scheduling/session behavior, worksheet PDF generation, wrong-answer explanations, and ZIP export. The post-merge Retirement Guard run for the preservation commit, `31826669213`, completed successfully.

The archival branch is recovery evidence only. It does not reactivate retired runtime paths on `main`.

## Canonical cross-check

Cross-check performed on 2026-08-15 JST.

The canonical `stupidsavacan/LoopDeck` repository main was:

`a45d9cb1750d36c83c1f23d50c5597aef5dc5b09`

That canonical tree contains the active web application, Android wrapper, built-in data, and the recovered history image assets. The four history images retain the recovered Git blob identities:

- `graph63.png` — `653fe9ec8ab555a4426f36b78069f3826de66a35`
- `map62.png` — `cd0926c65c6c3aeb4cec7de6fbf02b061681a97e`
- `map64.png` — `319aea6f42fe3c2f02ccfb0e31eee17be7c13e51`
- `relation63.png` — `c9b87a533866e58a8b85de442cd14c0850671a45`

Canonical PR #22 is an **unmerged enhancement**, not the baseline above. Its head `0c6dac063530e37d0483efa9205f5206bc53f418` records successful LoopDeck CI with **147 tests passed**, the TypeScript/Vite production build, Android Debug APK build, and Android Signed Release APK build. Treat that head as additional validated implementation evidence until or unless it is merged.

## Remaining LoopDeck material on main

After PR #226, the non-Guard LoopDeck regression tests are no longer present on `main`; only Guard witness material remains in that area. This repository still does not contain an executable LoopDeck package: its source entry points, build configuration, built-in data path, Android wrapper, and later `loopdeck/client` migration path are retired.

For product recovery or behavior comparison, use the exact preserved commit/archival branch above together with the active canonical repository rather than attempting to recreate the deleted code through a namespace or extension loophole.

## Continuation rule

Runtime implementation should continue in the canonical `stupidsavacan/LoopDeck` repository unless this repository's owners intentionally adopt a new policy through a legitimate governance change. Do not rename or relocate runtime code solely to evade the retirement policy.
