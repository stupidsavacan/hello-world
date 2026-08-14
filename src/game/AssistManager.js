// DEPRECATION NOTICE
//
// AssistManager is entering a deliberate five-pull-request retirement sequence.
// This first stage changes no runtime behavior. It exists only to make the
// retirement explicit before any implementation is removed.
//
// Planned sequence:
// 1. announce retirement
// 2. disable mutation while preserving the public surface
// 3. reduce to a compatibility shell
// 4. leave only a tombstone
// 5. delete the file

(function attachAssistManager(global){
  const Sanma=global.Sanma=global.Sanma||{};
  function ids(state){const out=[],wall=state&&state.wall;['tiles','deadWall'].forEach(k=>(wall&&Array.isArray(wall[k])?wall[k]:[]).forEach(t=>t&&t.instanceId&&out.push(t.instanceId)));(state&&Array.isArray(state.players)?state.players:[]).forEach(p=>{['hand','discards','kitaTiles'].forEach(k=>(p&&Array.isArray(p[k])?p[k]:[]).forEach(t=>t&&t.instanceId&&out.push(t.instanceId)));(p&&Array.isArray(p.melds)?p.melds:[]).forEach(m=>(m&&Array.isArray(m.tiles)?m.tiles:[]).forEach(t=>t&&t.instanceId&&out.push(t.instanceId)));});return out;}
  function integrity(state){const all=ids(state),seen=new Set(),dups=[];all.forEach(id=>{if(seen.has(id))dups.push(id);seen.add(id);});return{tileCount:all.length,duplicateInstanceIds:dups,valid:dups.length===0};}
  function rate(rule,phase,player){if(phase==='opening')return Number(rule.dramaticOpeningHandRate)||0;if(phase!=='draw'||rule.dramaticDrawAssist!==true)return 0;return player&&player.isHuman?Number(rule.dramaticDrawAssistRate)||0:Number(rule.cpuDramaticDrawAssistRate)||0;}
  function usage(state){state.assistUsage=state.assistUsage||{opening:0,drawsByPlayer:Object.create(null)};state.assistUsage.drawsByPlayer=state.assistUsage.drawsByPlayer||Object.create(null);return state.assistUsage;}
  function allowed(state,rule,phase,p){const u=usage(state);if(phase==='opening')return u.opening<1;const used=Number(u.drawsByPlayer[p.id])||0,limit=p.isHuman?Number(rule.maxAssistDrawsPerRoundForHuman)||0:Number(rule.maxAssistDrawsPerRoundForCpu)||0;return used<limit;}
  function mark(state,phase,p){const u=usage(state);if(phase==='opening')u.opening+=1;else u.drawsByPlayer[p.id]=(Number(u.drawsByPlayer[p.id])||0)+1;}
  function shanten(p,hand,rule){return Sanma.CpuStrategy.estimateShanten({tiles:hand,ruleConfig:rule,openMeldCount:Array.isArray(p.melds)?p.melds.length:0});}
  function findSwap(state,p,phase,rule){if(!p||!Array.isArray(p.hand)||!state.wall||!Array.isArray(state.wall.tiles)||!p.hand.length||!state.wall.tiles.length)return null;let handIndices;if(phase==='draw'){const i=p.lastDraw?p.hand.findIndex(t=>t.instanceId===p.lastDraw.instanceId):-1;if(i<0)return null;handIndices=[i];}else{const discard=Sanma.CpuStrategy.chooseDiscard({player:p,ruleConfig:rule,random:()=>0}),i=p.hand.findIndex(t=>t.instanceId===discard.tileInstanceId);handIndices=i>=0?[i]:[];}const before=shanten(p,p.hand,rule);let best=null;handIndices.forEach(hi=>state.wall.tiles.forEach((incoming,wi)=>{const sim=p.hand.slice();sim[hi]=incoming;const after=shanten(p,sim,rule);if(after>=before)return;if(!best||after<best.afterShanten||(after===best.afterShanten&&String(incoming.instanceId).localeCompare(String(best.incoming.instanceId))<0))best={handIndex:hi,wallIndex:wi,outgoing:p.hand[hi],incoming,beforeShanten:before,afterShanten:after};}));return best;}
  function apply(state,p,phase,swap){const last=p.lastDraw&&swap.outgoing&&p.lastDraw.instanceId===swap.outgoing.instanceId;p.hand[swap.handIndex]=swap.incoming;state.wall.tiles[swap.wallIndex]=swap.outgoing;if(phase==='draw'||last)p.lastDraw=swap.incoming;if(typeof p.sortHand==='function')p.sortHand();}
  function evaluate(input){const o=input||{},state=o.state||{},rule=o.ruleConfig||state.ruleConfig||{},p=o.player||null,phase=o.phase||'draw',before=integrity(state),enabled=rule.dramaticLuckAssist===true&&rate(rule,phase,p)>0,random=typeof o.random==='function'?o.random:Math.random,r=enabled?rate(rule,phase,p):0,roll=enabled?random():null,ok=enabled&&p&&allowed(state,rule,phase,p),condition=ok&&roll<r,swap=condition?findSwap(state,p,phase,rule):null;if(swap){apply(state,p,phase,swap);mark(state,phase,p);}const after=integrity(state);let reason='補助設定が無効です。';if(enabled&&!ok)reason='この局の補助回数上限に達しています。';else if(ok&&!condition)reason='補助条件に達しませんでした。';else if(condition&&!swap)reason='手牌を改善する安全な交換候補がありません。';else if(swap)reason=`手牌改善のため山牌と交換しました。シャンテン推定 ${swap.beforeShanten} → ${swap.afterShanten}`;return{type:'assist',phase,playerIndex:p&&Number.isInteger(p.id)?p.id:null,enabled,applied:Boolean(swap),rate:r,roll,reason,beforeShanten:swap?swap.beforeShanten:null,afterShanten:swap?swap.afterShanten:null,outgoing:swap?swap.outgoing:null,incoming:swap?swap.incoming:null,tileCountIntegrityChecked:true,beforeTileCount:before.tileCount,afterTileCount:after.tileCount,duplicateInstanceIds:after.duplicateInstanceIds,integrityValid:before.valid&&after.valid&&before.tileCount===after.tileCount};}
  Sanma.AssistManager={evaluate,evaluateOpening:i=>evaluate(Object.assign({},i||{},{phase:'opening'})),evaluateDraw:i=>evaluate(Object.assign({},i||{},{phase:'draw'})),tileIntegrity:integrity,findSwap};
})(window);
