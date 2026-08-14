(function attachCpuVisibleTiles(global){
  const Sanma=global.Sanma=global.Sanma||{};
  const add=(out,tiles)=>Array.isArray(tiles)&&tiles.forEach(t=>t&&out.push(t));
  function visible(state,playerIndex){
    const out=[],players=Array.isArray(state&&state.players)?state.players:[],self=players[playerIndex];
    if(self)add(out,self.hand);
    players.forEach(p=>{if(!p)return;add(out,p.discards);add(out,p.kitaTiles);(p.melds||[]).forEach(m=>add(out,m&&m.tiles));});
    add(out,state&&state.wall&&Array.isArray(state.wall.doraIndicators)?state.wall.doraIndicators:(state&&state.doraIndicators)||[]);
    const last=state&&state.lastDiscard&&state.lastDiscard.tile;
    if(last&&!out.some(t=>t&&t.instanceId===last.instanceId))out.push(last);
    return out;
  }
  function counts(state,playerIndex){const out=Object.create(null);visible(state,playerIndex).forEach(t=>{out[t.baseId]=(out[t.baseId]||0)+1;});return out;}
  function maxCopies(baseId,ruleConfig){return ruleConfig&&ruleConfig.northMode==='disabled'&&baseId==='z4'?0:4;}
  function remaining(state,playerIndex,baseId){const rule=state&&state.ruleConfig||{};return Math.max(0,maxCopies(baseId,rule)-(counts(state,playerIndex)[baseId]||0));}
  function legalTypes(rule){
    if(Sanma.HandAnalysis&&typeof Sanma.HandAnalysis.getLegalTileTypes==='function')return Sanma.HandAnalysis.getLegalTileTypes(rule);
    const out=[];['m','p','s'].forEach(s=>{for(let r=1;r<=9;r+=1){if(s==='m'&&r>1&&r<9)continue;out.push({tileType:Sanma.TileUtil.baseId(s,r)});}});
    for(let r=1;r<=7;r+=1){if(r===4&&rule.northMode==='disabled')continue;out.push({tileType:Sanma.TileUtil.baseId('z',r)});}return out;
  }
  function remainingAll(state,playerIndex){const rule=state&&state.ruleConfig||{},out=Object.create(null);legalTypes(rule).forEach(t=>{const id=t.tileType||t.baseId;if(id)out[id]=remaining(state,playerIndex,id);});if(rule.northMode==='disabled')out.z4=0;return out;}
  Sanma.CpuVisibleTiles={getVisibleTilesForPlayer:visible,getVisibleCountsForPlayer:counts,getRemainingVisibleEstimate:remaining,getRemainingByBaseId:remainingAll};
})(window);
