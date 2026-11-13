(() => {
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=960,H=440,ground=365;
const face=new Image();face.src='assets/adasiu-face.png';
const factoryBg=new Image();factoryBg.src='assets/factory-background.jpg';
const sausageImg=new Image();sausageImg.src='assets/sausage.png';
const cutletImg=new Image();cutletImg.src='assets/cutlet.png';
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),overlay=document.getElementById('overlay');
let best=Number(localStorage.getItem('adasiuRunBest')||0),score=0,speed=5.2,frames=0,playing=false,paused=false,over=false,spawn=0,lives=3,items=[],particles=[];
bestEl.textContent=String(best).padStart(5,'0');
const player={x:118,y:ground-112,w:76,h:112,vy:0,jumping:false,open:0};
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function factory(){
 // Fotograficzne tło hali produkcyjnej z delikatnym ruchem paralaksy.
 if(factoryBg.complete&&factoryBg.naturalWidth){
   const shift=(frames*speed*.12)%90;
   ctx.drawImage(factoryBg,-shift,0,W+90,H);
   ctx.drawImage(factoryBg,W-shift,0,90,H);
 } else {
   const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#9aa8ad');g.addColorStop(1,'#344149');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 }
 // Chłodny grading, delikatne przyciemnienie krawędzi i światło hali.
 const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(8,18,25,.12)');shade.addColorStop(.72,'rgba(8,18,25,.03)');shade.addColorStop(1,'rgba(4,9,13,.55)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
 // Pas podłogi / toru gry.
 const floor=ctx.createLinearGradient(0,ground-18,0,H);floor.addColorStop(0,'rgba(125,139,143,.08)');floor.addColorStop(.12,'rgba(48,59,63,.48)');floor.addColorStop(1,'rgba(15,22,26,.96)');ctx.fillStyle=floor;ctx.fillRect(0,ground-18,W,H-ground+18);
 ctx.fillStyle='#e8bd32';ctx.fillRect(0,ground+4,W,5);ctx.fillStyle='#171e22';ctx.fillRect(0,ground+9,W,H-ground-9);
 for(let x=-((frames*speed*.9)%56);x<W;x+=56){ctx.fillStyle='#899398';ctx.fillRect(x,ground+19,30,3)}
 // winieta i refleksy na mokrej posadzce
 ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(0,ground-20,W,2);
}
function drawPlayer(){
 const bob=player.jumping?0:Math.sin(frames*.24)*2;const x=player.x,y=player.y+bob;
 // legs
 ctx.strokeStyle='#202832';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+34,y+77);ctx.lineTo(x+24+(player.jumping?-7:Math.sin(frames*.3)*8),y+100);ctx.lineTo(x+13,y+104);ctx.moveTo(x+47,y+77);ctx.lineTo(x+57+(player.jumping?8:-Math.sin(frames*.3)*8),y+99);ctx.lineTo(x+68,y+103);ctx.stroke();
 // shoes
 rounded(x+3,y+98,25,10,5,'#f5f5ef','#202832');rounded(x+58,y+98,25,10,5,'#f5f5ef','#202832');
 // torso, shirt and vest
 rounded(x+18,y+38,43,48,8,'#e9edf0','#26323a');ctx.fillStyle='#d6df27';ctx.fillRect(x+20,y+43,39,9);ctx.fillStyle='#38434b';ctx.beginPath();ctx.moveTo(x+29,y+40);ctx.lineTo(x+49,y+40);ctx.lineTo(x+56,y+83);ctx.lineTo(x+24,y+83);ctx.closePath();ctx.fill();ctx.strokeStyle='#d6dce0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+39,y+42);ctx.lineTo(x+39,y+81);ctx.stroke();
 // arms
 ctx.strokeStyle='#e7c1a6';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x+20,y+49);ctx.lineTo(x+7,y+65);ctx.lineTo(x+12,y+73);ctx.moveTo(x+59,y+48);ctx.lineTo(x+73,y+57);ctx.lineTo(x+69,y+67);ctx.stroke();
 // head image
 if(face.complete&&face.naturalWidth){ctx.save();ctx.beginPath();ctx.ellipse(x+40,y+24,29,34,0,0,Math.PI*2);ctx.clip();ctx.drawImage(face,x+10,y-12,60,75);ctx.restore();ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x+40,y+24,29,34,0,0,Math.PI*2);ctx.stroke();}
 else {rounded(x+15,y-7,50,61,15,'#d9ad91','#222')}
 // comic open mouth when airborne
 if(player.jumping){ctx.fillStyle='#251015';ctx.beginPath();ctx.ellipse(x+46,y+39,8,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x+42,y+31,8,3)}
 // ID badge
 rounded(x+47,y+57,11,15,2,'#e9f2f2','#26323a');ctx.fillStyle='#d72e31';ctx.fillRect(x+50,y+60,5,3);
}
function drawCrate(o){
 const x=o.x,y=ground-o.h,w=o.w,h=o.h;
 ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=12;ctx.shadowOffsetY=7;
 const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#f04b4d');g.addColorStop(.45,'#bd1425');g.addColorStop(1,'#720d1b');
 rounded(x,y,w,h,5,g,'#4b1119');ctx.restore();
 // rant i żebra typowej czerwonej skrzynki E2
 ctx.fillStyle='#f45b5b';ctx.fillRect(x+4,y+5,w-8,7);ctx.fillStyle='#8c101e';ctx.fillRect(x+5,y+h-12,w-10,7);
 ctx.strokeStyle='#7b1020';ctx.lineWidth=4;for(let k=10;k<w-5;k+=15){ctx.beginPath();ctx.moveTo(x+k,y+14);ctx.lineTo(x+k,y+h-15);ctx.stroke()}
 ctx.strokeStyle='#ff7770';ctx.lineWidth=2;ctx.strokeRect(x+7,y+14,w-14,h-28);
 rounded(x+w/2-15,y+h*.48-9,30,18,3,'#f0e9df','#75101b');ctx.fillStyle='#8c1722';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('E2',x+w/2,y+h*.48+4);
 // kawałki mięsa widoczne ponad krawędzią
 ctx.fillStyle='#a83237';ctx.beginPath();ctx.ellipse(x+w*.28,y+3,12,6,-.2,0,Math.PI*2);ctx.ellipse(x+w*.58,y+1,15,7,.15,0,Math.PI*2);ctx.ellipse(x+w*.78,y+4,9,5,.1,0,Math.PI*2);ctx.fill();
}
function drawFood(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot||0);
 const im=o.type==='sausage'?sausageImg:cutletImg;
 if(im.complete&&im.naturalWidth){const w=o.type==='sausage'?76:72,h=o.type==='sausage'?42:48;ctx.shadowColor='#0009';ctx.shadowBlur=8;ctx.drawImage(im,-w/2,-h/2,w,h)}
 else if(o.type==='sausage'){ctx.strokeStyle='#702319';ctx.lineWidth=20;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-28,0);ctx.quadraticCurveTo(0,-17,28,0);ctx.stroke();ctx.strokeStyle='#d66a42';ctx.lineWidth=13;ctx.stroke()}
 else{ctx.fillStyle='#b96a27';ctx.beginPath();ctx.ellipse(0,0,31,19,.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#edbd70';for(let i=0;i<18;i++){const a=i*2.4;ctx.beginPath();ctx.arc(Math.cos(a)*23,Math.sin(a)*12,2,0,Math.PI*2);ctx.fill()}}
 ctx.restore();
}
function drawItems(){for(const o of items){if(o.type==='crate')drawCrate(o);else drawFood(o)}}
function spawnItem(){const r=Math.random();if(r<.38){items.push({type:'crate',x:W+20,w:55+Math.random()*18,h:55+Math.random()*15})}else{items.push({type:r<.7?'cutlet':'sausage',x:W+20,y:ground-50-Math.random()*105,rot:Math.random()*.5-.25,w:52,h:35})}}
function collision(a,b){return a.x+17<b.x+b.w-7&&a.x+a.w-12>b.x+7&&a.y+12<b.y+b.h-5&&a.y+a.h-5>b.y+5}
function burst(x,y){for(let i=0;i<12;i++)particles.push({x,y,vx:(Math.random()-.5)*6,vy:-Math.random()*5,life:35})}
function update(){frames++;score+=Math.max(1,Math.floor(speed/5));speed=Math.min(12,speed+.0015);scoreEl.textContent=String(score).padStart(5,'0');
 player.vy+=.72;player.y+=player.vy;if(player.y>=ground-player.h){player.y=ground-player.h;player.vy=0;player.jumping=false}
 spawn--;if(spawn<=0){spawnItem();spawn=70+Math.random()*60-speed*2}
 for(const o of items){o.x-=speed+(o.type==='sausage'?1:0);if(o.type!=='crate')o.rot+=.025;if(!o.hit&&collision({x:player.x,y:player.y,w:player.w,h:player.h},{x:o.x,y:o.type==='crate'?ground-o.h:o.y-15,w:o.w||55,h:o.type==='crate'?o.h:30})){o.hit=true;lives--;burst(player.x+35,player.y+45);if(lives<=0){endGame();return}}}
 items=items.filter(o=>o.x>-100&&!o.hit);
 for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.life--}particles=particles.filter(p=>p.life>0);
}
function draw(){factory();drawItems();drawPlayer();for(const p of particles){ctx.fillStyle=`rgba(255,210,80,${p.life/35})`;ctx.fillRect(p.x,p.y,5,5)}
 // HUD hearts and speed strip
 for(let i=0;i<3;i++){ctx.fillStyle=i<lives?'#e7353e':'#5b5555';ctx.font='26px system-ui';ctx.fillText('♥',18+i*30,35)}
 rounded(790,18,145,35,8,'#1b252ddd','#e6bd4b');ctx.fillStyle='#fff';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('TEMPO  '+Math.round(speed*10)+'%',862,41);
}
function loop(){if(playing&&!paused){update();draw()}else if(!playing){draw()}requestAnimationFrame(loop)}
function start(){score=0;speed=5.2;frames=0;spawn=40;lives=3;items=[];particles=[];player.y=ground-player.h;player.vy=0;player.jumping=false;playing=true;paused=false;over=false;overlay.classList.add('hidden')}
function endGame(){playing=false;over=true;if(score>best){best=score;localStorage.setItem('adasiuRunBest',best);bestEl.textContent=String(best).padStart(5,'0')}overlay.classList.remove('hidden');overlay.querySelector('.eyebrow').textContent='KONIEC ZMIANY!';overlay.querySelector('h2').innerHTML='WYNIK: <em>'+score+'</em>';overlay.querySelector('p').textContent='Adasiu zaliczył spotkanie z produkcją. Spróbuj pobić swój rekord!';document.getElementById('start').textContent='JESZCZE RAZ!'}
function jump(){if(!playing){start();return}if(paused)return;if(!player.jumping){player.vy=-14.2;player.jumping=true}}
document.getElementById('start').addEventListener('click',start);document.getElementById('jump').addEventListener('pointerdown',e=>{e.preventDefault();jump()});canvas.addEventListener('pointerdown',e=>{if(playing)jump()});
document.getElementById('pause').addEventListener('click',()=>{if(playing){paused=!paused;document.getElementById('pause').textContent=paused?'▶':'Ⅱ'}});
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();jump()}if(e.code==='Escape'&&playing){paused=!paused;document.getElementById('pause').textContent=paused?'▶':'Ⅱ'}});
loop();
})();
