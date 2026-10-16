/* 独立的城内游览层：低分辨率像素画直接绘制，不改变战略地图。 */
const townBuildings = [
  { name:'府衙', x:15, y:7, actions:[['develop','开发农业'],['fortify','修筑城防'],['transfer','武将调任']] },
  { name:'市集', x:4, y:14, actions:[['commerce','发展商业'],['hire','寻访武将']] },
  { name:'兵营', x:25, y:14, actions:[['recruit','征募士兵'],['train','整军训练'],['march','出征调兵']] }
];
function enterTown() {
  if(state.cities[state.selected].owner!==state.playerFaction||state.gameOver)return;
  town={active:true,city:state.selected,x:15,y:12,dir:'down'};
  $('worldPanel').classList.add('hidden');
  $('townPanel').classList.remove('hidden');
  $('townTitle').textContent=`${cityName(town.city)} · 城内`;
  drawTown();updateTownHint();
}
function leaveTown() {
  town.active=false;
  $('townPanel').classList.add('hidden');
  $('worldPanel').classList.remove('hidden');
}
function blockedTown(x,y) {
  if(x<0||x>29||y<7||y>19)return true;
  if(x>=8&&x<=21&&y<=6)return true;
  if(x<=8&&y>=14)return true;
  if(x>=21&&y>=14)return true;
  return false;
}
function moveTown(dx,dy) {
  if(!town.active)return;
  town.dir=dx<0?'left':dx>0?'right':dy<0?'up':'down';
  if(!blockedTown(town.x+dx,town.y+dy)){town.x+=dx;town.y+=dy}
  drawTown();updateTownHint();
}
function nearbyTownBuilding() {
  return townBuildings.find(b=>Math.abs(town.x-b.x)+Math.abs(town.y-b.y)<=2);
}
function updateTownHint() {
  const building=nearbyTownBuilding();
  $('townHint').textContent=building?`靠近${building.name} · 按 Enter / E 交互`:'方向键 / WASD 行走，靠近建筑后按 Enter 交互';
}
function interactTown() {
  if(!town.active)return;
  const building=nearbyTownBuilding();
  if(!building){toast('靠近建筑入口后才能交互');return}
  const remaining=state.cities[town.city].actions;
  modal(`${cityName(town.city)} · ${building.name}`,`<p>本月剩余指令 ${remaining} / 2。选择一项事务，效果与战略地图上的城池指令相同。</p><div class="town-action-list">${building.actions.map(([key,label])=>`<button data-town-action="${key}" ${remaining<=0?'disabled':''}>${label}</button>`).join('')}</div>`);
}
function townRect(x,y,w,h,color){townCtx.fillStyle=color;townCtx.fillRect(x,y,w,h)}
function townBuilding(x,y,w,h,roof,doorX,kind) {
  townRect(x,y+9,w,h-9,'#54799b');
  townRect(x+2,y+13,w-4,h-17,'#c9d6cf');
  for(let yy=y+15;yy<y+h-4;yy+=8)for(let xx=x+3;xx<x+w-4;xx+=12){
    townRect(xx+(Math.floor(yy/8)%2)*5,yy,6,1,'#a7bebf');
    townRect(xx+4,yy+4,3,1,'#edf0d9');
  }
  townRect(x-2,y+2,w+4,12,'#574a61');
  townRect(x,y,w,11,roof);
  for(let xx=x+2;xx<x+w-3;xx+=7){townRect(xx,y+1,5,7,'#e1866d');townRect(xx+5,y+1,1,8,'#5a566e')}
  townRect(x,y+11,w,3,'#668db0');
  for(let xx=x+8;xx<x+w-8;xx+=22){
    if(Math.abs(xx-doorX)<9)continue;
    townRect(xx,y+24,12,13,'#789eae');townRect(xx+2,y+26,8,9,'#bad7dc');
    townRect(xx+5,y+26,2,9,'#e6ece0');townRect(xx,y+37,12,2,'#7791a1');
  }
  townRect(doorX-9,y+h-24,18,24,'#655a53');
  townRect(doorX-6,y+h-21,12,21,'#382f32');
  townRect(doorX-4,y+h-18,8,18,'#4b3a32');
  townRect(doorX+2,y+h-10,1,1,'#e9d490');
  townRect(x,y+h-3,w,3,'#92adb0');
  if(kind==='hall'){
    townRect(x+43,y+16,26,8,'#8b5049');
    townCtx.fillStyle='#f9e4af';townCtx.font='bold 7px sans-serif';townCtx.textAlign='center';townCtx.fillText('府 衙',x+w/2,y+23);
  }else{
    townRect(x+18,y+16,w-36,9,'#79574d');
    townCtx.fillStyle='#f9e4af';townCtx.font='bold 7px sans-serif';townCtx.textAlign='center';townCtx.fillText(kind==='market'?'市 集':'兵 营',x+w/2,y+23);
  }
}
function drawTownAvatar(x,y,dir,robe='#b44f44') {
  const px=x*8,py=y*8-5;
  townRect(px+1,py+10,2,2,'#363849');townRect(px+5,py+10,2,2,'#363849');
  townRect(px+1,py+5,6,5,robe);townRect(px,py+6,2,3,'#e5c2a0');townRect(px+6,py+6,2,3,'#e5c2a0');
  townRect(px+2,py+2,4,4,'#e9bd91');townRect(px+1,py,6,3,'#49342d');
  townRect(px+2,py-2,4,2,'#4c3c32');
  if(dir==='down'){townRect(px+2,py+4,1,1,'#2d3742');townRect(px+5,py+4,1,1,'#2d3742')}
  if(dir==='left')townRect(px+2,py+4,1,1,'#2d3742');
  if(dir==='right')townRect(px+5,py+4,1,1,'#2d3742');
}
function drawTown() {
  if(!town.active)return;
  const city=state.cities[town.city],accent=factions[city.owner].color;
  for(let y=0;y<160;y+=8)for(let x=0;x<240;x+=8){
    const seed=hash(x/8,y/8,52);
    townRect(x,y,8,8,['#75b99c','#7dbda2','#83c5a7','#79bba0'][Math.floor(seed*4)]);
    if(seed>.5){townRect(x+2,y+3,1,1,'#a9d7ad');townRect(x+6,y+5,1,1,'#4ea788')}
    if(seed>.89){townRect(x+5,y+2,2,2,'#eedba7');townRect(x+4,y+3,1,1,'#f6f1ce')}
  }
  // Connected light stone plaza, with a scattered GBA style cobble texture.
  for(let y=48;y<160;y+=8)for(let x=0;x<240;x+=8){
    const plaza=(x>=56&&x<184&&y<144)||(y>=96&&y<128)||(x>=112&&x<136);
    if(!plaza)continue;
    const seed=hash(x/8,y/8,4);
    townRect(x,y,8,8,['#d5d9d1','#dce0d5','#cbd3cc','#e2e2d8'][Math.floor(seed*4)]);
    townRect(x+1,y+1,5,1,'#e9eae0');townRect(x+6,y+3,1,3,'#aebfbd');
    if(seed>.55)townRect(x+2,y+6,4,1,'#bac8c3');
  }
  // Shrubs and signposts border the plaza without blocking the walking lane.
  for(const [x,y] of [[11,58],[27,68],[218,55],[231,69],[12,75],[220,76],[80,143],[157,145]]){
    townRect(x,y+5,10,3,'#357e68');townRect(x+2,y+1,7,7,'#4a9c76');townRect(x+4,y,3,3,'#75bb86');
  }
  townBuilding(64,-2,112,58,'#aa5051',120,'hall');
  townBuilding(0,89,72,55,'#c07e4e',36,'market');
  townBuilding(168,89,72,55,'#66668b',204,'barracks');
  // Small town sign and inhabitants establish the street scale.
  townRect(43,63,2,13,'#5c5148');townRect(37,60,14,9,'#b78f65');
  townCtx.fillStyle='#f9e9be';townCtx.font='6px sans-serif';townCtx.fillText(cityName(town.city),44,67);
  drawTownAvatar(9,11,'right','#6a789f');drawTownAvatar(22,10,'left','#7e9a6a');
  // The player carries the chosen faction colour without changing the town tiles.
  drawTownAvatar(town.x,town.y,town.dir,accent);
  townRect(2,2,44,10,'#203b43');townCtx.fillStyle='#fff0be';townCtx.font='bold 7px sans-serif';townCtx.textAlign='left';townCtx.fillText(`${cityName(town.city)}城`,6,9);
}
$('enterTownButton').onclick=enterTown;
$('leaveTownButton').onclick=leaveTown;
$('interactButton').onclick=interactTown;
document.querySelectorAll('[data-move]').forEach(button=>{
  button.onclick=()=>{const moves={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};moveTown(...moves[button.dataset.move])};
});
