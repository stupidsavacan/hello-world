import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app root.');

const shell = document.createElement('main');
shell.className = 'app-shell';

const title = document.createElement('h1');
title.textContent = 'LoopDeck';

const status = document.createElement('p');
status.textContent = 'Learning application foundation is ready.';

shell.append(title, status);
app.replaceChildren(shell);
