import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Mode='league'|'knockout';
interface Match { id:number; round:number; a:string|null; b:string|null; sa:number|null; sb:number|null; }
interface Standing { name:string; wins:number; losses:number; scored:number; against:number; points:number; }

@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./app.component.html',styleUrl:'./app.component.scss'})
export class AppComponent {
 title='戰鬥陀螺挑戰賽'; count=5; mode:Mode='league'; names:string[]=[]; players:string[]=[]; matches:Match[]=[]; started=false; error=''; private readonly storageKey='beybladeTournamentAngularV1';
 constructor(){this.resizeNames();this.restore();}
 resizeNames(){const n=Math.max(2,Math.min(64,Number(this.count)||2));this.count=n;this.names=Array.from({length:n},(_,i)=>this.names[i]??'');}
 trackByIndex(index:number){return index;}
 setMode(mode:Mode){this.mode=mode;}
 demo(){const d=['小明','小華','阿哲','小宇','小凱','小杰','小安','小翔'];this.names=this.names.map((_,i)=>d[i]??`選手${i+1}`);}
 start(){const p=this.names.map(x=>x.trim());if(p.some(x=>!x)){this.error='請輸入所有選手名稱';return;}if(new Set(p).size!==p.length){this.error='選手名稱不可重複';return;}this.error='';this.players=p;this.matches=[];this.mode==='league'?this.makeLeague():this.makeKnockout();this.started=true;this.save();}
 private makeLeague(){let id=0;for(let i=0;i<this.players.length;i++)for(let j=i+1;j<this.players.length;j++)this.matches.push({id:id++,round:1,a:this.players[i],b:this.players[j],sa:null,sb:null});}
 private makeKnockout(){const size=this.nextPow2(this.players.length);const seeded:(string|null)[]=[...this.players];while(seeded.length<size)seeded.push(null);for(let i=0;i<size/2;i++)this.matches.push({id:i,round:1,a:seeded[i],b:seeded[size-1-i],sa:null,sb:null});this.buildNextRounds();}
 private nextPow2(n:number){let x=1;while(x<n)x*=2;return x;}
 winner(m:Match):string|null|undefined{if(!m.a)return m.b;if(!m.b)return m.a;if(m.sa===null||m.sb===null||m.sa===m.sb)return undefined;return m.sa>m.sb?m.a:m.b;}
 updateScore(m:Match){m.sa=m.sa===null?null:Math.max(0,Number(m.sa));m.sb=m.sb===null?null:Math.max(0,Number(m.sb));if(this.mode==='knockout'){this.matches=this.matches.filter(x=>x.round<=m.round);this.buildNextRounds();}this.save();}
 private buildNextRounds(){const total=Math.log2(this.nextPow2(this.players.length));for(let r=1;r<total;r++){const prev=this.matches.filter(m=>m.round===r);if(!prev.length||!prev.every(m=>this.winner(m)!==undefined))break;if(this.matches.some(m=>m.round===r+1))continue;for(let i=0;i<prev.length;i+=2)this.matches.push({id:this.matches.length,round:r+1,a:this.winner(prev[i])??null,b:this.winner(prev[i+1])??null,sa:null,sb:null});}}
 get standings():Standing[]{const s=this.players.map(name=>({name,wins:0,losses:0,scored:0,against:0,points:0}));for(const m of this.matches){if(m.sa===null||m.sb===null||!m.a||!m.b)continue;const a=s.find(x=>x.name===m.a)!,b=s.find(x=>x.name===m.b)!;a.scored+=m.sa;a.against+=m.sb;b.scored+=m.sb;b.against+=m.sa;if(m.sa>m.sb){a.wins++;b.losses++;a.points+=3}else if(m.sb>m.sa){b.wins++;a.losses++;b.points+=3}else{a.points++;b.points++;}}return s.sort((a,b)=>b.points-a.points||b.wins-a.wins||(b.scored-b.against)-(a.scored-a.against)||b.scored-a.scored);}
 get rounds(){return Array.from({length:this.finalRound},(_,i)=>i+1);}
 roundMatches(r:number){return this.matches.filter(m=>m.round===r);}
 bracketSlotCount(r:number){return this.nextPow2(this.players.length)/Math.pow(2,r);}
 bracketMatches(r:number){const existing=this.roundMatches(r);return Array.from({length:this.bracketSlotCount(r)},(_,i)=>existing[i]??({id:-(r*100+i),round:r,a:null,b:null,sa:null,sb:null} as Match));}
 expectedLabel(r:number,index:number,side:'a'|'b'){if(r===1)return '輪空';const prevIndex=index*2+(side==='b'?1:0);return `第 ${r-1} 輪第 ${prevIndex+1} 場勝者`;}
 get finalRound(){return Math.log2(this.nextPow2(this.players.length));}
 get champion(){const f=this.matches.find(m=>m.round===this.finalRound);return f?this.winner(f):undefined;}
 back(){this.started=false;}
 clear(){if(confirm('確定清除目前比賽紀錄？')){localStorage.removeItem(this.storageKey);location.reload();}}
 private save(){localStorage.setItem(this.storageKey,JSON.stringify({title:this.title,count:this.count,mode:this.mode,names:this.names,players:this.players,matches:this.matches,started:this.started}));}
 private restore(){try{const d=JSON.parse(localStorage.getItem(this.storageKey)||'null');if(!d)return;Object.assign(this,d);}catch{}}
}