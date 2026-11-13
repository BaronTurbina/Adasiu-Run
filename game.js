(() => {
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=960,H=440,ground=365;
const face=new Image();face.src='assets/adasiu-face.png';
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),overlay=document.getElementById('overlay');
let best=Number(localStorage.getItem('adasiuRunBest')||0),score=0,speed=5.2,frames=0,playing=false,paused=false,over=false,spawn=0,lives=3,items=[],particles=[];
bestEl.textContent=String(best).padStart(5,'0');
const player={x:118,y:ground-112,w:76,h:112,vy:0,jumping:false,open:0};
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function factory(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#b9c5c9');g.addColorStop(.6,'#7e8b91');g.addColorStop(1,'#424d53');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // ceiling and lights
 ctx.fillStyle='#53616a';ctx.fillRect(0,0,W,35);for(let x=35;x<W;x+=180){ctx.fillStyle='#f5f1d7';ctx.fillRect(x,18,100,8);ctx.fillStyle='#ffffff55';ctx.fillRect(x-10,26,120,3)}
 // back wall panels
 for(let x=0;x<W;x+=120){ctx.strokeStyle='#dce3e4';ctx.lineWidth=3;ctx.strokeRect(x,48,120,205);ctx.strokeStyle='#718087';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+12,48);ctx.lineTo(x+12,253);ctx.stroke()}
 // yellow door
 rounded(680,80,160,172,7,'#d2a72c','#39434a');rounded(692,92,136,152,4,'#6b7c82','#e9d7a0');ctx.fillStyle='#f5cf47';ctx.fillRect(695,99,130,9);
 // far conveyor
 ctx.fillStyle='#354149';ctx.fillRect(0,257,960,16);ctx.fillStyle='#aab5b8';ctx.fillRect(0,253,960,5);for(let x=20;x<960;x+=45){ctx.fillStyle='#1c252b';ctx.beginPath();ctx.arc(x,279,7,0,Math.PI*2);ctx.fill()}
 // distant workers
 for(let x of [330,520,790]){ctx.fillStyle='#25323a';ctx.fillRect(x,194,18,58);ctx.fillStyle='#d8e3e8';ctx.beginPath();ctx.arc(x+9,183,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2875a5';ctx.fillRect(x-3,199,24,36)}
 // floor
 const f=ctx.createLinearGradient(0,280,0,H);f.addColorStop(0,'#aeb9bb');f.addColorStop(1,'#59666b');ctx.fillStyle=f;ctx.fillRect(0,280,W,H-280);
 ctx.fillStyle='#e9bd34';ctx.fillRect(0,ground+5,W,8);ctx.fillStyle='#202a30';ctx.fillRect(0,ground+13,W,H-ground-13);
 for(let x=-((frames*speed*.7)%48);x<W;x+=48){ctx.fillStyle='#657178';ctx.fillRect(x,ground+20,25,4)}
 // safety sign
 rounded(845,128,86,70,5,'#f4c542','#303a40');ctx.fillStyle='#252c30';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('BHP',888,151);ctx.font='bold 9px system-ui';ctx.fillText('BEZPIECZNIE',888,169);
}
function drawPlayer(){
 const bob=player.jumping?0:Math.sin(frames*.24)*2;const x=player.x,y=player.y+bob;
 // legs
 ctx.strokeStyle='#202832';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+34,y+77);ctx.lineTo(x+24+(player.jumping?-7:Math.sin(frames*.3)*8),y+100);ctx.lineTo(x+13,y+104);ctx.moveTo(x+47,y+77);ctx.lineTo(x+57+(player.jumping?8:-Math.sin(frames*.3)*8),y+99);ctx.lineTo(x+68,y+103);ctx.stroke();
 // shoes
 rounded(x+3,y+98,25,10,5,'#f5f5ef','#202832');rounded(x+58,y+98,25,10,5,'#f5f5ef','#202832');
 // torso, shirt and vest
 rounded(x+18,y+38,43,48,8,'#e9edf0','#26323a');ctx.fillStyle='#38434b';ctx.beginPath();ctx.moveTo(x+29,y+40);ctx.lineTo(x+49,y+40);ctx.lineTo(x+56,y+83);ctx.lineTo(x+24,y+83);ctx.closePath();ctx.fill();ctx.strokeStyle='#d6dce0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+39,y+42);ctx.lineTo(x+39,y+81);ctx.stroke();
 // arms
 ctx.strokeStyle='#e7c1a6';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x+20,y+49);ctx.lineTo(x+7,y+65);ctx.lineTo(x+12,y+73);ctx.moveTo(x+59,y+48);ctx.lineTo(x+73,y+57);ctx.lineTo(x+69,y+67);ctx.stroke();
 // head image
 if(face.complete&&face.naturalWidth){ctx.save();ctx.beginPath();ctx.ellipse(x+40,y+24,29,34,0,0,Math.PI*2);ctx.clip();ctx.drawImage(face,x+10,y-12,60,75);ctx.restore();ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x+40,y+24,29,34,0,0,Math.PI*2);ctx.stroke();}
 else {rounded(x+15,y-7,50,61,15,'#d9ad91','#222')}
 // comic open mouth when airborne
 if(player.jumping){ctx.fillStyle='#351b20';ctx.beginPath();ctx.ellipse(x+46,y+39,7,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x+42,y+31,8,3)}
 // ID badge
 rounded(x+47,y+57,11,15,2,'#e9f2f2','#26323a');ctx.fillStyle='#d72e31';ctx.fillRect(x+50,y+60,5,3);
}
function drawCrate(o){const x=o.x,y=ground-o.h;rounded(x,y,o.w,o.h,7,'#bd1e2d','#67131e');ctx.fillStyle='#e3454d';ctx.fillRect(x+7,y+8,o.w-14,7);ctx.strokeStyle='#7e1520';ctx.lineWidth=4;for(let k=12;k<o.w;k+=23){ctx.strokeRect(x+k,y+15,13,o.h-22)}ctx.fillStyle='#f4d9d5';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('E2',x+o.w/2,y+o.h/2+5)}
function drawFood(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot||0);if(o.type==='sausage'){ctx.strokeStyle='#7b291c';ctx.lineWidth=19;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-23,0);ctx.quadraticCurveTo(0,-15,24,0);ctx.stroke();ctx.strokeStyle='#d46b43';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(-23,-2);ctx.quadraticCurveTo(0,-17,24,-2);ctx.stroke();ctx.fillStyle='#f5c6a3';ctx.beginPath();ctx.arc(-24,-3,4,0,Math.PI*2);ctx.arc(25,-3,4,0,Math.PI*2);ctx.fill()}else{ctx.fillStyle='#b86b27';ctx.beginPath();ctx.ellipse(0,0,29,17,.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e6a34a';for(let i=0;i<16;i++){const a=i*2.4;ctx.beginPath();ctx.arc(Math.cos(a)*22,Math.sin(a)*10,2,0,Math.PI*2);ctx.fill()}}ctx.restore()}
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
