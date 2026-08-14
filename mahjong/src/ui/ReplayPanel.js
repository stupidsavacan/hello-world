(function(global){
const S=global.Sanma,$=id=>document.getElementById(id);let active=null;
function open(){const root=$('replayRoot'),list=$('replayRecordSelect'),records=S.GameRecordStorage.loadRecords();list.innerHTML='';records.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${r.completedAt?'完了':'進行中'} ${(r.rounds||[]).length}局 / ${r.id}`;list.appendChild(o)});function show(){if(active)active.stop();const r=records[Number(list.value)||0];root.innerHTML='';if(r)active=S.ReplayViewer.mount(root,r);else root.textContent='保存済み牌譜がありません'}list.onchange=show;show();$('replayDialog').showModal()}
$('replayButton').onclick=open;$('closeReplayButton').onclick=()=>{if(active)active.stop();$('replayDialog').close()};
})(window);
