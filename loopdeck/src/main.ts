// RETIREMENT NOTICE — STAGE 3/4
//
// LoopDeck's browser entry point is now a compatibility doorway only.
// No navigation, data loading, persistence, screens, imports, graphs, review,
// or worksheet behavior remains here.
//
// Completed:
// 1. announce retirement
// 2. remove navigation/orchestration responsibility
// 3. reduce to compatibility doorway
//
// Remaining:
// 4. delete the file
//
// 玄関記録: 扉も受付も消えた。住所だけが、まだ一行残っている。

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) appRoot.textContent = 'LoopDeck — retirement stage 3/4';
