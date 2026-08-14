// RETIREMENT NOTICE — STAGE 3/4
//
// The LoopDeck browser entry point is now a compatibility doorway only.
// It imports nothing, loads nothing, persists nothing, and routes nowhere.
//
// Completed:
// 1. announce retirement
// 2. remove navigation/orchestration responsibility
// 3. reduce to a compatibility doorway
//
// Remaining:
// 4. delete the file
//
// 玄関記録: 建物はもう案内しない。扉に残った一文だけが住所を名乗る。

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) appRoot.textContent = 'LoopDeck retirement stage 3/4 — doorway only.';
