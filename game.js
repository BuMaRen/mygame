/* 九州行军录：所有规则与地图数据均在本地运行，存档保存在浏览器中。 */
const SAVE_KEY = 'jiuzhou-march-v1';
const W = 800, H = 544, TILE = 16;
const factions = {
  shu: { name: '刘备军', short: '蜀', color: '#c76146', light: '#f4b477' },
  wei: { name: '曹操军', short: '魏', color: '#6489aa', light: '#aec9e5' },
  wu: { name: '孙权军', short: '吴', color: '#d2ad55', light: '#f4d98b' }
};
const cityData = [
  ['chengdu','成都',118,341,'shu',5,4,1900,980,4200],
  ['hanzhong','汉中',203,246,'shu',4,3,1250,650,2700],
  ['jiangzhou','江州',237,384,'shu',3,3,900,450,2000],
  ['xiangyang','襄阳',379,302,'wei',5,5,1800,1100,3900],
  ['chang_an','长安',310,164,'wei',5,4,2000,900,4300],
  ['luoyang','洛阳',469,169,'wei',6,6,2700,1500,5600],
  ['ye','邺城',544,85,'wei',4,5,1700,1000,3500],
  ['xuchang','许昌',535,251,'wei',4,5,1500,1200,3300],
  ['shouchun','寿春',605,327,'wei',3,4,1000,660,2100],
  ['jiangling','江陵',358,412,'wu',4,4,1300,800,3100],
  ['changsha','长沙',477,446,'wu',4,3,1100,700,2400],
  ['jianye','建业',696,396,'wu',5,5,1900,1150,4300],
  ['chaisang','柴桑',570,425,'wu',3,4,900,660,2000],
  ['wuling','武陵',300,484,'wu',3,2,750,400,1600]
];
const roads = [
  ['chengdu','hanzhong'],['chengdu','jiangzhou'],['hanzhong','chang_an'],['hanzhong','xiangyang'],
  ['jiangzhou','xiangyang'],['jiangzhou','jiangling'],['jiangzhou','wuling'],['chang_an','luoyang'],
  ['chang_an','xiangyang'],['luoyang','ye'],['luoyang','xuchang'],['luoyang','xiangyang'],
  ['ye','xuchang'],['xuchang','xiangyang'],['xuchang','shouchun'],['xiangyang','jiangling'],
  ['xiangyang','shouchun'],['jiangling','wuling'],['jiangling','changsha'],['jiangling','chaisang'],
  ['changsha','chaisang'],['chaisang','shouchun'],['chaisang','jianye'],['shouchun','jianye']
];
const officerData = [
  ['刘备','shu','chengdu',71,77,88],['关羽','shu','hanzhong',96,78,70],['张飞','shu','hanzhong',98,49,57],
  ['诸葛亮','shu','chengdu',38,100,98],['赵云','shu','jiangzhou',95,75,84],['黄忠','shu','chengdu',91,64,72],
  ['马超','shu','jiangzhou',97,57,66],['魏延','shu','hanzhong',88,59,62],
  ['曹操','wei','luoyang',72,92,94],['夏侯惇','wei','chang_an',88,63,76],['夏侯渊','wei','ye',91,60,69],
  ['张辽','wei','xiangyang',92,72,78],['司马懿','wei','luoyang',63,99,92],['郭嘉','wei','xuchang',38,96,86],
  ['许褚','wei','shouchun',97,39,52],['典韦','wei','xiangyang',98,34,49],
  ['孙权','wu','jianye',63,78,88],['周瑜','wu','jiangling',72,96,88],['陆逊','wu','chaisang',68,94,85],
  ['甘宁','wu','changsha',94,59,61],['太史慈','wu','wuling',93,61,65],['吕蒙','wu','jianye',81,87,78],
  ['鲁肃','wu','chaisang',53,91,92],['黄盖','wu','jiangling',85,68,73]
];
const cityById = Object.fromEntries(cityData.map(c => [c[0], c]));
const adjacency = Object.fromEntries(cityData.map(c => [c[0], []]));
roads.forEach(([a,b]) => { adjacency[a].push(b); adjacency[b].push(a); });

function newGame() {
  return {
    year: 208, month: 1, selected: 'chengdu', messages: [{ date: '208年1月', text: '刘备军据守巴蜀，天下大势由你决定。' }],
    cities: Object.fromEntries(cityData.map(([id,,x,y,owner,agri,trade,gold,food,troops]) => [id, {
      owner, agri, trade, gold, food, troops, walls: 2, morale: 75, actions: 2, x, y
    }])),
    officers: officerData.map(([name,faction,city,war,int,politics]) => ({ name,faction,city,war,int,politics,loyalty: 85 })),
    freeOfficers: [
      {name:'姜维',war:89,int:90,politics:81}, {name:'庞统',war:42,int:98,politics:88},
      {name:'徐庶',war:66,int:93,politics:87}, {name:'王平',war:79,int:74,politics:75},
      {name:'法正',war:42,int:94,politics:88}, {name:'孟获',war:92,int:42,politics:55}
    ],
    gameOver: false
  };
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const value = JSON.parse(raw);
      if (value && value.cities && value.officers && cityData.every(c => value.cities[c[0]])) return value;
    }
  } catch (_) { /* 无效存档时创建新局 */ }
  return newGame();
}
let state = loadGame();
const canvas = document.getElementById('worldMap');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = id => document.getElementById(id);
const cityName = id => cityById[id][1];
const owned = owner => cityData.filter(c => state.cities[c[0]].owner === owner).map(c => c[0]);
const officersAt = id => state.officers.filter(o => o.city === id);
const maxOfficer = (id, stat) => Math.max(35, ...officersAt(id).map(o => o[stat]));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const monthLabel = () => `${state.year}年${state.month}月`;
const fmt = n => Math.floor(n).toLocaleString('zh-CN');
function save(silent = false) { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); if (!silent) toast('进度已保存'); }
function log(text) { state.messages.unshift({ date: monthLabel(), text }); state.messages = state.messages.slice(0, 14); }
let toastTimer;
function toast(message) { const el = $('toast'); el.textContent = message; el.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add('hidden'), 2600); }
function modal(title, html) { $('modalTitle').textContent = title; $('modalContent').innerHTML = html; $('modal').classList.remove('hidden'); }
function closeModal() { $('modal').classList.add('hidden'); }

function render() {
  const id = state.selected, city = state.cities[id], owner = factions[city.owner];
  $('dateLabel').textContent = monthLabel();
  $('factionLabel').textContent = '刘备军';
  $('ownedLabel').textContent = `城池 ${owned('shu').length} / ${cityData.length}`;
  $('cityName').textContent = cityName(id);
  $('citySubtitle').textContent = city.owner === 'shu' ? '治下城池 · 发号施令' : `${owner.name}治下 · ${adjacency[id].filter(n => state.cities[n].owner === 'shu').length ? '与我军接壤' : '尚未接壤'}`;
  $('cityOwnerBadge').textContent = owner.name;
  $('cityOwnerBadge').style.background = owner.color;
  $('cityLevel').textContent = `城防 ${city.walls} 级`;
  $('cityAction').textContent = city.owner === 'shu' ? `本月指令 ${city.actions} / 2` : '';
  const stats = [
    ['兵力',fmt(city.troops),'⚔'],['军粮',fmt(city.food),'穗'],
    ['金钱',fmt(city.gold),'枚'],['士气',`${city.morale}%`,'旗'],
    ['农业',`${city.agri} 级`,'月产'],['商业',`${city.trade} 级`,'月产']
  ];
  $('statsGrid').innerHTML = stats.map(([label,value,note]) => `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`).join('');
  const own = city.owner === 'shu' && !state.gameOver;
  const actions = [
    ['develop','开发农业','金 300 · 粮产提升','田'],['commerce','发展商业','金 300 · 金产提升','商'],
    ['recruit','征募士兵','金 260 / 粮 180','兵'],['fortify','修筑城防','金 400 · 防守提升','墙'],
    ['hire','寻访武将','金 500 · 招揽人才','将'],['train','整军训练','粮 200 · 提升士气','旗'],
    ['transfer','武将调任','调往相邻我方城池','令'],['march','出征调兵','沿道路进军','军']
  ];
  $('actions').innerHTML = own ? actions.map(([key,label,description,icon]) => `<button class="action-button" data-action="${key}" ${city.actions <= 0 ? 'disabled' : ''}><span class="action-icon">${icon}</span><strong>${label}</strong><small>${description}</small></button>`).join('') : `<div class="empty-note">${state.gameOver ? '本局已结束，可在“?”菜单中开启新局。' : '选择我方城池下达内政或军事指令。'}</div>`;
  const people = officersAt(id);
  $('officerCount').textContent = `${people.length} 人`;
  $('officers').innerHTML = people.length ? people.map(o => `<div class="officer"><span class="portrait">${o.name.slice(0,1)}</span><span class="officer-main"><strong>${o.name}</strong><small>武 ${o.war} · 智 ${o.int} · 政 ${o.politics}</small></span><span class="officer-role">${o.faction === 'shu' ? '麾下' : factions[o.faction].short + '军'}</span></div>`).join('') : '<div class="empty-note">暂无驻城武将</div>';
  $('log').innerHTML = state.messages.slice(0,5).map(m => `<div class="log-entry"><span class="month">${m.date}</span><span>${m.text}</span></div>`).join('');
  drawMap();
}

function hash(x,y,seed=0) { let n=(x*374761393+y*668265263+seed*1442695041)|0; n=(n^(n>>>13))*1274126177; return ((n^(n>>>16))>>>0)/4294967295; }
function terrain(x,y) {
  const nx=x/TILE, ny=y/TILE;
  const river = 360 + 45*Math.sin(y/79) + 30*Math.sin(y/35);
  if (Math.abs(x-river)<10 && y>75 && y<390) return 'river';
  if (x>620 && y>425+22*Math.sin(x/42)) return 'water';
  if ((x<90 && y<205) || (x<173 && y<105) || (x>730 && y<155)) return 'mountain';
  const h = hash(nx,ny);
  if ((x<300 && y<310 && h>.61) || (x>430 && y>320 && h>.72)) return 'forest';
  return 'grass';
}
function drawMap() {
  ctx.fillStyle='#77aa72';ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=TILE)for(let x=0;x<W;x+=TILE){
    const t=terrain(x,y),v=hash(x/TILE,y/TILE,9);
    const colors={grass:['#83ad70','#8ab472','#79a86b','#95ba7b'],forest:['#649463','#6c9b66','#5d8b5a','#78a36a'],mountain:['#999886','#a8a38c','#888d81','#aaa792'],river:['#679da6','#71a8ae','#5d96a1','#7aafb2'],water:['#6099a5','#68a3ac','#5b95a3','#76aeb3']};
    const palette=colors[t];ctx.fillStyle=palette[Math.floor(v*palette.length)];ctx.fillRect(x,y,TILE,TILE);
    if(t==='grass'||t==='forest'){
      if(v>.36){ctx.fillStyle=t==='forest'?'#3d7355':'#6d9d62';ctx.fillRect(x+3,y+8,2,4);ctx.fillRect(x+9,y+5,2,3)}
      if(t==='forest'&&v>.68){ctx.fillStyle='#315f48';ctx.fillRect(x+4,y+2,8,7);ctx.fillStyle='#4f8057';ctx.fillRect(x+5,y+1,5,4);ctx.fillStyle='#655e42';ctx.fillRect(x+7,y+9,2,4)}
    } else if(t==='mountain') {ctx.fillStyle='#727c76';ctx.fillRect(x+3,y+8,11,5);ctx.fillStyle='#c0ba9e';ctx.fillRect(x+6,y+3,6,6);ctx.fillStyle='#e4d9b6';ctx.fillRect(x+8,y+2,2,3)}
    else {ctx.fillStyle='#a2c7be';ctx.fillRect(x+3+(v>.5?6:0),y+8,5,1)}
  }
  // Roads join cities. Their dark border preserves clarity against forests and rivers.
  roads.forEach(([a,b])=>{
    const ca=state.cities[a],cb=state.cities[b];
    const midX=Math.round((ca.x+cb.x)/2/TILE)*TILE;
    ctx.strokeStyle='#655b42';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(ca.x,ca.y);ctx.lineTo(midX,ca.y);ctx.lineTo(midX,cb.y);ctx.lineTo(cb.x,cb.y);ctx.stroke();
    ctx.strokeStyle='#d5ba77';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.stroke();ctx.setLineDash([]);
  });
  // Regional labels and decorative compass.
  ctx.fillStyle='#224d4b88';ctx.font='bold 21px serif';
  [['益 州',101,447],['荆 州',384,365],['中 原',493,214],['江 东',653,484]].forEach(([label,x,y])=>ctx.fillText(label,x,y));
  ctx.fillStyle='#173a3d';ctx.fillRect(745,16,39,42);ctx.strokeStyle='#e6d3a6';ctx.strokeRect(747,18,35,38);ctx.fillStyle='#f6e6b6';ctx.font='bold 17px serif';ctx.fillText('北',754,43);
  cityData.forEach(([id,name])=>drawCity(id,name));
}
function drawCity(id,name) {
  const c=state.cities[id],f=factions[c.owner],selected=state.selected===id;
  ctx.save();ctx.translate(c.x,c.y);
  if(selected){ctx.fillStyle='#fff0b5';ctx.fillRect(-22,-24,44,3);ctx.fillRect(-22,17,44,3);ctx.fillRect(-22,-24,3,12);ctx.fillRect(19,-24,3,12);ctx.fillRect(-22,8,3,12);ctx.fillRect(19,8,3,12)}
  ctx.fillStyle='#1d3231';ctx.fillRect(-16,-16,32,30);
  ctx.fillStyle='#e4d4a1';ctx.fillRect(-14,-14,28,27);
  ctx.fillStyle='#7b5540';ctx.fillRect(-12,-8,24,19);
  ctx.fillStyle=f.color;ctx.fillRect(-13,-17,26,7);ctx.fillRect(-9,-20,5,4);ctx.fillRect(4,-20,5,4);
  ctx.fillStyle='#e9dda9';ctx.fillRect(-9,-4,5,5);ctx.fillRect(4,-4,5,5);
  ctx.fillStyle='#2e2b26';ctx.fillRect(-3,3,6,8);ctx.fillStyle='#b78c56';ctx.fillRect(-1,4,2,7);
  ctx.fillStyle='#142a2d';ctx.fillRect(-20,19,40,17);ctx.fillStyle=f.light;ctx.font='bold 14px "Noto Sans SC",sans-serif';ctx.textAlign='center';ctx.fillText(name,0,32);
  ctx.restore();
}

function spendAction(id) { state.cities[id].actions--; save(true); render(); }
function requireResources(city,gold,food=0) { if(city.gold<gold||city.food<food){toast(`资源不足：需要金 ${gold}${food ? `、粮 ${food}` : ''}`);return false} return true; }
function act(key) {
  const id=state.selected,c=state.cities[id];
  if(c.owner!=='shu'||c.actions<=0||state.gameOver)return;
  const politics=maxOfficer(id,'politics');
  if(key==='develop'){
    if(!requireResources(c,300))return;c.gold-=300;c.agri=clamp(c.agri+1,1,10);log(`${cityName(id)}开垦田地，农业升至 ${c.agri} 级。`);spendAction(id);toast('农业提升，来月可获更多军粮');
  }else if(key==='commerce'){
    if(!requireResources(c,300))return;c.gold-=300;c.trade=clamp(c.trade+1,1,10);log(`${cityName(id)}整顿市集，商业升至 ${c.trade} 级。`);spendAction(id);toast('商业提升，来月可获更多金钱');
  }else if(key==='recruit'){
    if(!requireResources(c,260,180))return;c.gold-=260;c.food-=180;const gain=Math.round(450+politics*7);c.troops+=gain;c.morale=clamp(c.morale-3,30,100);log(`${cityName(id)}征得新兵 ${fmt(gain)} 人。`);spendAction(id);toast(`新增兵力 ${fmt(gain)}`);
  }else if(key==='fortify'){
    if(c.walls>=8){toast('城防已达上限');return}if(!requireResources(c,400))return;c.gold-=400;c.walls++;log(`${cityName(id)}加固城墙，城防升至 ${c.walls} 级。`);spendAction(id);toast('城防提升');
  }else if(key==='hire') openHire(id);
  else if(key==='train'){
    if(c.morale>=100){toast('士气已达上限');return}if(!requireResources(c,0,200))return;c.food-=200;c.morale=clamp(c.morale+16,20,100);log(`${cityName(id)}整军训练，士气升至 ${c.morale}%。`);spendAction(id);toast('部队士气提升');
  }else if(key==='transfer') openTransfer(id);
  else if(key==='march') openMarch(id);
}
function openTransfer(id) {
  const candidates=officersAt(id),targets=adjacency[id].filter(t=>state.cities[t].owner==='shu');
  if(!candidates.length){toast('本城没有可调任的武将');return}
  if(!targets.length){toast('没有相邻的我方城池');return}
  modal('武将调任',`<p>调任一名武将至相邻我方城池，占用本城一条指令。驻城武将的能力会影响内政与战斗。</p><label for="officerSelect">选择武将</label><select id="officerSelect">${candidates.map((o,i)=>`<option value="${i}">${o.name}　武 ${o.war} · 智 ${o.int} · 政 ${o.politics}</option>`).join('')}</select><label for="transferTarget">调往城池</label><select id="transferTarget">${targets.map(t=>`<option value="${t}">${cityName(t)}</option>`).join('')}</select><div class="modal-actions"><button id="confirmTransfer">确认调任</button></div>`);
  $('confirmTransfer').onclick=()=>{
    const officer=candidates[Number($('officerSelect').value)],target=$('transferTarget').value;
    if(!officer||!targets.includes(target))return;
    officer.city=target;log(`${officer.name}由${cityName(id)}调任${cityName(target)}。`);closeModal();spendAction(id);toast('武将调任完成');
  };
}
function openHire(id) {
  const c=state.cities[id];if(!requireResources(c,500))return;
  if(!state.freeOfficers.length){toast('暂时没有在野武将');return}
  const options=state.freeOfficers.map((o,i)=>`<option value="${i}">${o.name}　武 ${o.war} · 智 ${o.int} · 政 ${o.politics}</option>`).join('');
  modal('寻访武将',`<p>派人寻访在野豪杰。花费金 500，占用一条城池指令。</p><label for="hireSelect">选择目标武将</label><select id="hireSelect">${options}</select><div class="modal-info">寻访成功率受本城最高政治能力影响；失败仍会消耗资源。</div><div class="modal-actions"><button id="confirmHire">开始寻访</button></div>`);
  $('confirmHire').onclick=()=>{
    const index=Number($('hireSelect').value),person=state.freeOfficers[index];if(!person)return;
    c.gold-=500;const chance=clamp(0.52+maxOfficer(id,'politics')/250,0.55,0.9);
    if(Math.random()<chance){state.officers.push({...person,city:id,faction:'shu',loyalty:75});state.freeOfficers.splice(index,1);log(`${cityName(id)}招得${person.name}归附。`);toast(`${person.name}加入我军！`)}
    else {log(`使者未能说服${person.name}，寻访无果。`);toast('寻访失败，下月可再试')}
    closeModal();spendAction(id);
  };
}
function openMarch(id) {
  const c=state.cities[id],targets=adjacency[id];
  if(c.troops<700){toast('至少需要 700 兵才能出征，并留守 200 兵');return}
  const options=targets.map(t=>`<option value="${t}">${cityName(t)} · ${factions[state.cities[t].owner].name} · 守军 ${fmt(state.cities[t].troops)}</option>`).join('');
  modal('出征调兵',`<p>沿道路行军一城。进攻敌城将在地图上直接结算战斗，无需进入战场。</p><label for="targetSelect">目标城池</label><select id="targetSelect">${options}</select><label for="troopAmount">出征兵力（至少 500，最多保留 200 守军）</label><input id="troopAmount" type="number" min="500" step="100" max="${Math.max(500,c.troops-200)}" value="${Math.max(500,Math.floor((c.troops-200)*.7/100)*100)}"><div id="marchPreview" class="modal-info"></div><div class="modal-actions"><button id="confirmMarch">确认出征</button></div>`);
  function preview(){const t=$('targetSelect').value,d=state.cities[t],amount=Number($('troopAmount').value);const attack=Math.round(amount*(.8+maxOfficer(id,'war')/180)*(c.morale/85));const defense=Math.round(d.troops*(.8+maxOfficer(t,'war')/200)*(d.morale/85)*(1+d.walls*.09));$('marchPreview').textContent=d.owner==='shu'?`我方城池：可调拨 ${fmt(amount)} 兵与随军粮草。`:`预计军势 ${fmt(attack)} 对守城军势 ${fmt(defense)}。攻城还需携带军粮 ${fmt(Math.ceil(amount*.12))}。`;}
  $('targetSelect').onchange=preview;$('troopAmount').oninput=preview;preview();
  $('confirmMarch').onclick=()=>{
    const t=$('targetSelect').value,amount=Math.floor(Number($('troopAmount').value)),d=state.cities[t];
    if(!Number.isFinite(amount)||amount<500||amount>c.troops-200){toast('请设置有效兵力，并留下至少 200 守军');return}
    const foodCost=Math.ceil(amount*.12);
    if(c.food<foodCost){toast(`军粮不足，需要 ${fmt(foodCost)}`);return}
    c.food-=foodCost;c.troops-=amount;closeModal();
    if(d.owner==='shu'){
      d.troops+=amount;d.food+=Math.floor(foodCost*.7);const moved=officersAt(id).filter(o=>o.name!=='刘备');if(moved.length && officersAt(id).length>1){const general=moved.sort((a,b)=>b.war-a.war)[0];general.city=t;log(`${general.name}率 ${fmt(amount)} 兵自${cityName(id)}移驻${cityName(t)}。`)}else log(`${cityName(id)}向${cityName(t)}调拨 ${fmt(amount)} 兵。`);
      toast('调兵完成');
    } else {
      const result=resolveBattle(id,t,amount,'shu');log(result.text);toast(result.short);
      if(result.won)state.selected=t;
    }
    spendAction(id);checkVictory();render();
  };
}
function resolveBattle(from,to,amount,attacker) {
  const src=state.cities[from],dst=state.cities[to],defender=dst.owner;
  const attackOfficer=maxOfficer(from,'war'),defendOfficer=maxOfficer(to,'war');
  const attack=amount*(.78+attackOfficer/180)*(src.morale/85)*(0.9+Math.random()*.2);
  const defense=dst.troops*(.8+defendOfficer/200)*(dst.morale/85)*(1+dst.walls*.09)*(0.9+Math.random()*.2);
  const won=attack>defense;
  if(won){
    const survivors=Math.max(100,Math.round(amount*(.68-defense/attack*.34)));
    const fleeing=Math.round(dst.troops*.18);
    const escape=adjacency[to].find(n=>state.cities[n].owner===defender);
    if(escape)state.cities[escape].troops+=fleeing;
    const defeated=officersAt(to);defeated.forEach(o=>{if(escape)o.city=escape;else {o.faction=attacker;o.city=to;o.loyalty=55}});
    dst.owner=attacker;dst.troops=survivors;dst.morale=clamp(Math.round(src.morale*.75),40,80);dst.walls=Math.max(1,dst.walls-1);dst.gold=Math.round(dst.gold*.7);dst.food=Math.round(dst.food*.7);dst.actions=0;
    if(attacker==='shu'){
      const leader=officersAt(from).filter(o=>o.name!=='刘备').sort((a,b)=>b.war-a.war)[0];if(leader&&officersAt(from).length>1)leader.city=to;
    }
    return {won:true,text:`${factions[attacker].name}攻克${cityName(to)}，余兵 ${fmt(survivors)}。`,short:`攻克${cityName(to)}！`};
  }
  const survivors=Math.max(100,Math.round(dst.troops*(.79-attack/defense*.38)));
  dst.troops=survivors;dst.morale=clamp(dst.morale-6,30,100);
  return {won:false,text:`${factions[attacker].name}进攻${cityName(to)}失利，守军余 ${fmt(survivors)}。`,short:`进攻${cityName(to)}失利`};
}

function nextMonth() {
  if(state.gameOver)return;
  state.month++;if(state.month>12){state.month=1;state.year++}
  for(const [id,c] of Object.entries(state.cities)){
    const revenue=Math.round(c.trade*(65+maxOfficer(id,'politics')*.35));
    const harvest=Math.round(c.agri*(90+maxOfficer(id,'politics')*.4));
    const upkeep=Math.ceil(c.troops*.065);
    c.gold+=revenue;c.food+=harvest-upkeep;
    if(c.food<0){const loss=Math.min(c.troops,Math.ceil(-c.food*1.8));c.troops-=loss;c.food=0;c.morale=clamp(c.morale-12,20,100);if(c.owner==='shu')log(`${cityName(id)}军粮不足，损失 ${fmt(loss)} 兵！`)}
    else c.morale=clamp(c.morale+3,20,100);
    c.actions=2;
  }
  aiTurn('wei');aiTurn('wu');
  log('新的一月开始，粮饷已结算，各城可继续下令。');
  checkVictory();save(true);render();
  if(!state.gameOver)toast(`${monthLabel()} · 月度结算完成`);
}
function aiTurn(faction) {
  const cities=owned(faction);
  for(const id of cities){
    const c=state.cities[id];if(c.owner!==faction)continue;
    if(c.gold>350&&c.food>350){const gain=420+Math.round(maxOfficer(id,'politics')*5);c.troops+=gain;c.gold-=240;c.food-=150}
    else if(c.gold>250&&Math.random()<.4){c.gold-=250;c.agri=clamp(c.agri+1,1,10)}
    if(c.gold>550&&Math.random()<.16){c.gold-=350;c.walls=clamp(c.walls+1,1,8)}
  }
  // Each faction considers one border assault per month.
  const opportunities=owned(faction).flatMap(from=>adjacency[from].filter(to=>state.cities[to].owner!==faction).map(to=>({from,to})));
  opportunities.sort((a,b)=>{
    const ra=state.cities[a.from].troops/(state.cities[a.to].troops+100);
    const rb=state.cities[b.from].troops/(state.cities[b.to].troops+100);return rb-ra;
  });
  const choice=opportunities[0];if(!choice)return;
  const source=state.cities[choice.from],target=state.cities[choice.to];
  if(source.troops<1500||source.food<350)return;
  const ratio=source.troops/(target.troops*(1+target.walls*.08)+200);
  if(ratio<1.24||Math.random()>.52)return;
  const amount=Math.floor(source.troops*.72);source.troops-=amount;source.food=Math.max(0,source.food-Math.ceil(amount*.1));
  const result=resolveBattle(choice.from,choice.to,amount,faction);log(result.text);
}
function checkVictory() {
  if(state.gameOver)return;
  const count=owned('shu').length;
  if(count===cityData.length){state.gameOver=true;modal('天下一统',`<p>你率领刘备军统一了九州！历时至 ${monthLabel()}，十四座城池皆归麾下。</p><div class="modal-actions"><button id="restartGame">再开一局</button></div>`);$('restartGame').onclick=restart;save(true)}
  else if(count===0){state.gameOver=true;modal('大势已去',`<p>刘备军已失去所有城池。重整旗鼓，试试先积粮固守，再集中兵力突围。</p><div class="modal-actions"><button id="restartGame">重新开始</button></div>`);$('restartGame').onclick=restart;save(true)}
}
function restart(){state=newGame();save(true);closeModal();render();toast('新的征途开始了')}

canvas.addEventListener('click',event=>{
  const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*W/r.width,y=(event.clientY-r.top)*H/r.height;
  const found=cityData.find(([id,,cx,cy])=>Math.abs(cx-x)<24&&Math.abs(cy-y)<26);
  if(found){state.selected=found[0];render()}
});
canvas.addEventListener('mousemove',event=>{
  const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*W/r.width,y=(event.clientY-r.top)*H/r.height;
  const found=cityData.find(([id,,cx,cy])=>Math.abs(cx-x)<24&&Math.abs(cy-y)<26);
  canvas.style.cursor=found?'pointer':'default';
  $('mapHint').textContent=found?`${found[1]} · ${factions[state.cities[found[0]].owner].name} · 兵力 ${fmt(state.cities[found[0]].troops)}`:'点击城池查看详情 · 沿道路向相邻城池进军';
});
$('actions').addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button)act(button.dataset.action)});
$('endTurnButton').onclick=nextMonth;
$('saveButton').onclick=()=>save();
$('modalClose').onclick=closeModal;
$('modal').addEventListener('click',event=>{if(event.target===$('modal'))closeModal()});
$('helpButton').onclick=()=>modal('行军指南',`<p>目标是统一地图上的 14 座城池。每座我方城池每月可执行两次指令。月末会获得金钱和军粮，同时部队消耗军粮。</p><h3>内政与人才</h3><p>农业提高军粮产量，商业提高金钱收入。征兵、筑城和寻访武将都消耗金钱。武将的政治影响收入和征兵，武力影响战斗。</p><h3>行军与战斗</h3><p>先选择我方城池，再点“出征调兵”。只能沿道路前往相邻城池。进攻敌城会按兵力、武将武力、士气、城防与少量随机因素即时结算。</p><h3>地图操作</h3><p>点击城池选择；方向键或 WASD 可切换城池。N 键结束本月，Esc 关闭窗口。进度存于当前浏览器。</p><div class="modal-actions"><button id="newGameButton">开启新局</button></div>`);
$('modalContent').addEventListener('click',event=>{if(event.target.id==='newGameButton'){modal('开启新局',`<p>当前进度将被覆盖。确定重新开始吗？</p><div class="modal-actions"><button id="confirmRestart">确定，重新开始</button></div>`)}else if(event.target.id==='confirmRestart')restart()});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){closeModal();return}
  if(!$('modal').classList.contains('hidden')||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;
  if(event.key.toLowerCase()==='n'){nextMonth();return}
  if(event.key==='Enter'){if(state.cities[state.selected].owner==='shu')openMarch(state.selected);return}
  const directions={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]};
  const dir=directions[event.key];if(!dir)return;event.preventDefault();
  const current=state.cities[state.selected];let best=null,bestScore=Infinity;
  for(const [id,c] of Object.entries(state.cities)){
    if(id===state.selected)continue;
    const dx=c.x-current.x,dy=c.y-current.y,projection=dx*dir[0]+dy*dir[1];if(projection<=0)continue;
    const cross=Math.abs(dx*dir[1]-dy*dir[0]);const score=projection+cross*2.3;
    if(score<bestScore){best=id;bestScore=score}
  }
  if(best){state.selected=best;render()}
});
render();
