// RETIREMENT 6/10 — SHAPE HEURISTICS RETIRED
//
// Isolated honors, terminals, pairs, sequences, and red-tile preservation are gone.
// Discard ranking now leans almost entirely on shanten and immediate win state.

(function attachCpuStrategy(global){
  const Sanma=global.Sanma=global.Sanma||{};
  const seq=i=>(i>=9&&i<=17)||(i>=18&&i<=26);
  function standard(c,open){let best=8;function f(i,m,p,t){while(i<c.length&&!c[i])i+=1;if(i>=c.length){const mm=open+m,tt=Math.min(t,Math.max(0,4-mm));best=Math.min(best,8-mm*2-tt-p);return;}c[i]-=1;f(i,m,p,t);c[i]+=1;if(c[i]>=3){c[i]-=3;f(i,m+1,p,t);c[i]+=3;}if(seq(i)&&i%9<=6&&c[i+1]>0&&c[i+2]>0){c[i]-=1;c[i+1]-=1;c[i+2]-=1;f(i,m+1,p,t);c[i]+=1;c[i+1]+=1;c[i+2]+=1;}if(c[i]>=2){c[i]-=2;if(!p)f(i,m,1,t);f(i,m,p,t+1);c[i]+=2;}if(seq(i)&&i%9<=7&&c[i+1]>0){c[i]-=1;c[i+1]-=1;f(i,m,p,t+1);c[i]+=1;c[i+1]+=1;}if(seq(i)&&i%9<=6&&c[i+2]>0){c[i]-=1;c[i+2]-=1;f(i,m,p,t+1);c[i]+=1;c[i+2]+=1;}}f(0,0,0,0);return best;}
  function estimateShanten(input){const o=input||{},conv=Sanma.HandAnalysis.toCountArray(Array.isArray(o.tiles)?o.tiles:[],o.ruleConfig||{});if(!conv.isValid)return 99;const open=Math.max(0,Number(o.openMeldCount)||0),vals=[standard(conv.counts.slice(),open)];if(!open){const pairs=conv.counts.filter(x=>x>=2).length,unique=conv.counts.filter(Boolean).length;vals.push(6-pairs+Math.max(0,7-unique));if(!(o.ruleConfig&&o.ruleConfig.northMode==='disabled')){const req=[0,8,9,17,18,26,27,28,29,30,31,32,33],u=req.filter(i=>conv.counts[i]>0).length,p=req.some(i=>conv.counts[i]>=2);vals.push(13-u-(p?1:0));}}return Math.min(...vals);}
  function chooseDiscard(input){
    const o=input||{},p=o.player||{},hand=Array.isArray(p.hand)?p.hand:[],rule=o.ruleConfig||{},rand=typeof o.random==='function'?o.random:Math.random;
    if(!hand.length)return{tileInstanceId:null,reason:'手牌がありません。',candidates:[],score:0};
    const open=(p.melds||[]).length,win=Boolean(o.analysis&&o.analysis.scoreResult&&o.analysis.scoreResult.isValidWin);
    const cand=hand.map((t,i)=>{
      const left=hand.slice();left.splice(i,1);
      const sh=estimateShanten({tiles:left,ruleConfig:rule,openMeldCount:open}),tenpai=sh<=0;
      let score=-sh*35;
      if(tenpai)score+=60;
      if(win)score+=1000;
      const tie=rand();
      return{tileInstanceId:t.instanceId,tileLabel:Sanma.TileUtil.getTileAriaLabel(t),tileType:t.baseId,score:score+tie/1000,baseScore:score,shanten:sh,tenpai,reasons:['シャンテン優先'],tieBreaker:tie};
    }).sort((a,b)=>b.score-a.score||String(a.tileInstanceId).localeCompare(String(b.tileInstanceId)));
    const s=cand[0];
    return{tileInstanceId:s.tileInstanceId,reason:`シャンテン推定 ${s.shanten}。`,candidates:cand,score:s.baseScore};
  }
  function chooseCall(){return null;}
  Sanma.CpuStrategy={chooseDiscard,estimateShanten,chooseCall};
})(window);
