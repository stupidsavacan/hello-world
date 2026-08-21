const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const id of ['replayButton','replayDialog','replayRecordSelect','replayRoot','closeReplayButton'])assert.ok(html.includes(`id="${id}"`),`missing ${id}`);
assert.ok(html.includes('src/ui/ReplayViewer.js'));
assert.ok(html.includes('src/ui/ReplayPanel.js'));
assert.ok(html.includes('src/styles/replay.css'));
const viewer=fs.readFileSync(path.join(root,'src/ui/ReplayViewer.js'),'utf8');
for(const api of ['stepForward','stepBack','jumpToStart','jumpToEnd','setRound','mount'])assert.ok(viewer.includes(api),`missing ${api}`);
console.log('replay-panel-bootstrap: ok');
