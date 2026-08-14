// RETIREMENT NOTICE — STAGE 2/4
//
// LoopDeck's browser entry point no longer orchestrates the application.
// Pack loading, persistence, Home/Module/Review/Import/Graphs navigation,
// worksheet routing, and screen-module delegation have all been removed here.
//
// The browser entry still mounts a visible retirement notice. That remaining
// doorway is the only responsibility left before stage 3 reduces it further.
//
// Completed:
// 1. announce retirement
// 2. remove navigation/orchestration responsibility
//
// Remaining:
// 3. reduce to a compatibility doorway
// 4. delete the file
//
// 玄関記録: 部屋番号はすべて剥がされた。受付だけが、まだ立っている。

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (appRoot) {
  const notice = document.createElement('main');
  notice.dataset.loopdeckRetirementStage = '2/4';

  const title = document.createElement('h1');
  title.textContent = 'LoopDeck — retirement stage 2/4';

  const body = document.createElement('p');
  body.textContent = 'Navigation and application orchestration have retired. This doorway no longer leads to study, review, import, graphs, or worksheets.';

  const epitaph = document.createElement('p');
  epitaph.textContent = '入口は残った。行き先だけが、先にいなくなった。';

  notice.append(title, body, epitaph);
  appRoot.replaceChildren(notice);
}
