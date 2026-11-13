(() => {
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const FLOOR = 700, BAR = 735;
const $ = id => document.getElementById(id);
const assets = {};
const load = (name, src) => { const im = new Image(); im.src = src; assets[name] = im; };
load('bg','assets/factory-background-v4.jpg');
load('run1','assets/adasiu-run1-v4.png');
load('run2','assets/adasiu-run2-v4.png');
load('jump','assets/adasiu-jump-v4.png');
load('sausage','assets/sausage-v4.png');
load('cutlet','assets/cutlet-v4.png');
let score=0, best=Number(localStorage.getItem('adasiuRunBest')||0), lives=3;
let speed=7.4, tick=0, spawnIn=75, objects=[], particles=[], playing=false, paused=false, turbo=0;
let lastTime=0;
const player={x:220,y:FLOOR-360,w:360,h:360,vy:0,jumps:0,invuln:0,anim:0};
function rr(x,y,w,h,r,fill,stroke,sw=2){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.stroke()}
}
function imageCover(im,x,y,w,h){
 if(!im||!im.complete||!im.naturalWidth)return;
 const s=Math.max(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;
 ctx.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function drawBackground(){
 const im=assets.bg;
 if(im&&im.complete&&im.naturalWidth){
  const s=Math.max(W/im.width,H/im.height),dw=im.width*s,dh=im.height*s;
  const shift=(tick*speed*.045)%(Math.max(1,dw-W+80));
  ctx.drawImage(im,-shift,0,dw,dh);
  ctx.drawImage(im,dw-shift-2,0,dw,dh);
 } else {ctx.fillStyle='#68747a';ctx.fillRect(0,0,W,H)}
 const shade=ctx.createLinearGradient(0,0,0,H);
 shade.addColorStop(0,'#08121b55');shade.addColorStop(.58,'#08121b00');shade.addColorStop(1,'#08121b66');
 ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
 // subtle moving floor reflections
 ctx.fillStyle='#00000018';ctx.fillRect(0,FLOOR,W,H-FLOOR);
}
function drawPanel(x,y,w,h,accent='#ff3b42'){
 rr(x,y,w,h,22,'rgba(5,7,10,.88)',accent,3);
 ctx.save();ctx.shadowColor=accent;ctx.shadowBlur=15;ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+5,y+5,w-10,h-10,18);ctx.stroke();ctx.restore();
}
function drawHud(){
 // logo
 ctx.save();
 ctx.translate(42,18);ctx.rotate(-.035);
 ctx.shadowColor='#000';ctx.shadowBlur=9;ctx.shadowOffsetY=6;
 ctx.fillStyle='#f3f2ed';ctx.font='italic 1000 82px Arial';ctx.strokeStyle='#111';ctx.lineWidth=12;ctx.strokeText('ADASIU',0,75);ctx.fillText('ADASIU',0,75);
 ctx.fillStyle='#ed1c24';ctx.font='italic 1000 90px Arial';ctx.strokeText('RUN',290,75);ctx.fillText('RUN',290,75);
 ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='italic 1000 24px Arial';ctx.fillText('MEAT FACTORY EDITION',75,112);
 ctx.fillStyle='#c8101d';ctx.fillRect(70,121,340,7);ctx.restore();
 // score and record
 drawPanel(555,12,350,72);ctx.fillStyle='#fff';ctx.font='900 24px Arial';ctx.fillText('WYNIK:',585,57);ctx.font='1000 48px Arial';ctx.fillText(String(Math.floor(score)).padStart(6,'0'),700,61);
 drawPanel(930,12,365,72,'#d9a72b');ctx.font='900 24px Arial';ctx.fillText('🏆 REKORD:',960,57);ctx.font='1000 48px Arial';ctx.fillText(String(best).padStart(6,'0'),1125,61);
 drawPanel(1350,12,220,72);ctx.font='42px Arial';for(let i=0;i<3;i++)ctx.fillText(i<lives?'❤️':'🖤',1370+i*62,60);
 drawPanel(1625,8,105,82);ctx.fillStyle='#fff';ctx.font='1000 48px Arial';ctx.fillText(paused?'▶':'Ⅱ',1651,66);
 // bottom control rail
 ctx.fillStyle='rgba(4,6,8,.92)';ctx.fillRect(0,BAR,W,H-BAR);
 ctx.fillStyle='#ff4148';ctx.fillRect(0,BAR,W,4);
 ctx.fillStyle='#fff';ctx.font='900 26px Arial';ctx.fillText('←   ↑   →',48,812);
 ctx.font='900 22px Arial';ctx.fillText('RUCH:  ← →     SKOK: ↑',245,812);
 drawPanel(610,752,570,115);
 ctx.font='1000 34px Arial';ctx.fillText('SPACJA  /  ↑  =  SKOK',660,817);
 ctx.fillStyle='#ffcf35';ctx.font='1000 22px Arial';ctx.fillText('↑  DRUGI RAZ W POWIETRZU = PODWÓJNY SKOK',650,850);
 drawPanel(1370,748,350,125,'#ff4148');
 ctx.font='bold 24px Arial';ctx.fillText('☕  POWER-UP:',1400,785);
 ctx.fillStyle='#ffcf35';ctx.font='1000 32px Arial';ctx.fillText('KAWA TURBO',1400,823);
 ctx.fillStyle='#fff';ctx.font='bold 22px Arial';ctx.fillText('+ PRĘDKOŚĆ',1400,852);
}
function drawCrate(o){
 const x=o.x,y=FLOOR-o.h,w=o.w,h=o.h;
 ctx.save();ctx.shadowColor='#000a';ctx.shadowBlur=22;ctx.shadowOffsetY=13;
 const gr=ctx.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#ff4548');gr.addColorStop(.45,'#d41427');gr.addColorStop(1,'#720b18');
 rr(x,y,w,h,8,gr,'#ff7776',5);ctx.restore();
 ctx.strokeStyle='#8c101b';ctx.lineWidth=9;
 for(let xx=x+17;xx<x+w-8;xx+=25){ctx.beginPath();ctx.moveTo(xx,y+12);ctx.lineTo(xx,y+h-12);ctx.stroke()}
 ctx.fillStyle='#f7e8e4';ctx.font='italic 1000 36px Arial';ctx.textAlign='center';ctx.fillText('HF',x+w/2,y+h*.69);ctx.textAlign='left';
 ctx.fillStyle='#f4a4a0';ctx.fillRect(x+8,y+10,w-16,5);
 // meat visible above crate rim
 ctx.fillStyle='#b8202c';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x+24+i*26,y+7,22,12,-.12,0,Math.PI*2);ctx.fill()}
}
function drawFood(o){
 if(o.type==='coffee'){
  ctx.save();ctx.translate(o.x,o.y);ctx.shadowColor='#ffc52e';ctx.shadowBlur=24;
  ctx.font='68px Arial';ctx.textAlign='center';ctx.fillText('☕',0,22);
  ctx.font='bold 16px Arial';ctx.fillStyle='#fff';ctx.fillText('TURBO',0,47);ctx.restore();return;
 }
 const im=assets[o.type];if(!im||!im.complete||!im.naturalWidth)return;
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);
 ctx.shadowColor='#000a';ctx.shadowBlur=15;ctx.drawImage(im,-o.w/2,-o.h/2,o.w,o.h);
 ctx.restore();
}
function drawPlayer(){
 if(player.invuln>0&&Math.floor(tick/5)%2===0)return;
 let im;
 if(player.jumps>0) im=assets.jump;
 else im=(Math.floor(player.anim/8)%2===0)?assets.run1:assets.run2;
 if(im&&im.complete&&im.naturalWidth){
  ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=18;
  ctx.drawImage(im,player.x,player.y,player.w,player.h);ctx.restore();
 }
 if(player.jumps===2){
  ctx.save();ctx.fillStyle='#43d9ff';ctx.font='1000 28px Arial';ctx.shadowColor='#00bfff';ctx.shadowBlur=18;ctx.fillText('2× SKOK!',player.x+85,player.y-14);ctx.restore();
 }
}
function spawnObject(){
 const r=Math.random();
 if(r<.07) objects.push({type:'coffee',x:W+55,y:FLOOR-210,w:76,h:82,hit:false});
 else if(r<.43) objects.push({type:'crate',x:W+50,w:155+Math.random()*35,h:126+Math.random()*22,hit:false});
 else {
  const type=r<.70?'cutlet':'sausage';
  objects.push({type,x:W+60,y:FLOOR-(115+Math.random()*230),w:type==='sausage'?142:132,h:type==='sausage'?75:82,rot:(Math.random()-.5)*.25,phase:Math.random()*6.28,hit:false});
 }
}
function overlaps(a,b){return a.x+34<b.x+b.w-16&&a.x+a.w-30>b.x+16&&a.y+42<b.y+b.h-8&&a.y+a.h-24>b.y+8}
function burst(x,y,color='#ffcf48'){
 for(let i=0;i<22;i++)particles.push({x,y,vx:(Math.random()-.5)*12,vy:-Math.random()*10,life:34,color});
}
function update(dt){
 const k=dt/16.667;tick+=k;player.anim+=k;score+=Math.max(1,Math.floor(speed/7)*k);speed=Math.min(17,speed+.0013*k);
 player.vy+=.82*k;player.y+=player.vy*k;
 if(player.y>=FLOOR-player.h){player.y=FLOOR-player.h;player.vy=0;player.jumps=0}
 if(player.invuln>0)player.invuln-=k;
 if(turbo>0)turbo-=k;
 spawnIn-=k;if(spawnIn<=0){spawnObject();spawnIn=Math.max(45,82+Math.random()*42-speed*1.6)}
 for(const o of objects){
  o.x-=(speed+(turbo>0?3.2:0)+(o.type==='sausage'?1.5:0))*k;
  if(o.type!=='crate'){o.rot+=.018*k;o.y+=Math.sin(tick*.07+o.phase)*.45*k}
  const b=o.type==='crate'?{x:o.x,y:FLOOR-o.h,w:o.w,h:o.h}:{x:o.x-o.w/2,y:o.y-o.h/2,w:o.w,h:o.h};
  const pbox={x:player.x+72,y:player.y+48,w:player.w-132,h:player.h-72};
  if(!o.hit&&overlaps(pbox,b)){
   if(o.type==='coffee'){o.hit=true;turbo=300;score+=150;burst(o.x,o.y,'#ffcf35')}
   else if(player.invuln<=0){o.hit=true;lives--;player.invuln=90;burst(player.x+player.w/2,player.y+player.h/2,'#ff5a50');if(lives<=0){finish();return}}
  }
 }
 objects=objects.filter(o=>o.x>-220&&!o.hit);
 for(const q of particles){q.x+=q.vx*k;q.y+=q.vy*k;q.vy+=.3*k;q.life-=k}
 particles=particles.filter(q=>q.life>0);
 if(Math.floor(score)%5===0){} 
}
function draw(){
 ctx.clearRect(0,0,W,H);drawBackground();
 // objects in the factory foreground
 for(const o of objects){if(o.type==='crate')drawCrate(o);else drawFood(o)}
 drawPlayer();
 for(const q of particles){ctx.globalAlpha=Math.max(0,q.life/34);ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,5,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 if(turbo>0){ctx.fillStyle='#ffdb4a';ctx.font='1000 34px Arial';ctx.fillText('☕ TURBO!',W-340,175)}
 drawHud();
 if(paused&&playing){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);drawPanel(650,330,470,150);ctx.fillStyle='#fff';ctx.font='1000 64px Arial';ctx.textAlign='center';ctx.fillText('PAUZA',885,420);ctx.font='bold 24px Arial';ctx.fillText('NACIŚNIJ P, ABY WRÓCIĆ',885,458);ctx.textAlign='left';}
}
function loop(now){
 const dt=Math.min(34,now-(lastTime||now));lastTime=now;
 if(playing&&!paused)update(dt);
 draw();requestAnimationFrame(loop);
}
function start(){
 score=0;lives=3;speed=7.4;tick=0;spawnIn=65;objects=[];particles=[];turbo=0;
 player.x=220;player.y=FLOOR-player.h;player.vy=0;player.jumps=0;player.invuln=0;player.anim=0;
 playing=true;paused=false;$('overlay').classList.add('hidden');$('gameover').classList.remove('show');
}
function finish(){
 playing=false;
 if(score>best){best=Math.floor(score);localStorage.setItem('adasiuRunBest',String(best))}
 $('finalScore').textContent=String(Math.floor(score)).padStart(6,'0');$('gameover').classList.add('show');
}
function jump(){
 if(!playing){start();return}if(paused)return;
 if(player.jumps<2){player.vy=player.jumps===0?-20.5:-18.8;player.jumps++;if(player.jumps===2){burst(player.x+player.w*.62,player.y+player.h*.58,'#43d9ff');player.anim=0}}
}
function pauseToggle(){if(!playing)return;paused=!paused}
$('start').addEventListener('click',start);$('restart').addEventListener('click',start);
$('mobileJump').addEventListener('pointerdown',e=>{e.preventDefault();jump()});
$('mobilePause').addEventListener('click',pauseToggle);
canvas.addEventListener('pointerdown',e=>{if(e.target===canvas){e.preventDefault();const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width;const y=(e.clientY-r.top)*H/r.height;if(x>1600&&y<110)pauseToggle();else jump()}});
$('game').addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
 if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)jump()}
 if(['ArrowLeft','KeyA'].includes(e.code))player.x=Math.max(100,player.x-28);
 if(['ArrowRight','KeyD'].includes(e.code))player.x=Math.min(520,player.x+28);
 if(e.code==='KeyP'||e.code==='Escape')pauseToggle();
});

requestAnimationFrame(loop);
})();