import { Injectable, NgZone } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, EmailAuthProvider, linkWithCredential, User } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, where, serverTimestamp, setDoc, updateDoc, Unsubscribe } from 'firebase/firestore';

export interface CloudRegistration { uid: string; name: string; ownerUid: string; }
export interface CloudEvent { id:string; title:string; mode:'league'|'knockout'; open:boolean; date:string; location:string; }
const app = initializeApp({
  apiKey: 'AIzaSyAPWrWFXHPyIWaS7xw7thwVwtgi4rZ4xTs',
  authDomain: 'beyblade-tournament-eeb50.firebaseapp.com',
  projectId: 'beyblade-tournament-eeb50',
  storageBucket: 'beyblade-tournament-eeb50.firebasestorage.app',
  messagingSenderId: '671576185411',
  appId: '1:671576185411:web:2113f70893c6db9c3792f6'
});
const auth = getAuth(app);
const db = getFirestore(app);
// First cloud MVP uses one shared registration event. Multi-event support comes next.


@Injectable({ providedIn: 'root' })
export class TournamentRegistrationService {
  private unsubscribe?: Unsubscribe;
  private scheduleUnsubscribe?: Unsubscribe;
  private verifiedScheduleOwnerEventId: string | null = null;
  private eventId = 'main';
  onAuthChanged(callback:(user:User|null)=>void):Unsubscribe{return onAuthStateChanged(auth,callback);}
  get signedInUser():User|null{return auth.currentUser;}
  async waitForAuth():Promise<void>{await auth.authStateReady();}
  get isStaffSignedIn():boolean{return !!auth.currentUser && !auth.currentUser.isAnonymous;}
  async ensureParticipantAuth():Promise<void>{await auth.authStateReady();if(!auth.currentUser)await this.ensureParticipantAuth();}
  async signInStaff(email:string,password:string):Promise<void>{await signInWithEmailAndPassword(auth,email.trim(),password);}
  async signUpStaff(email:string,password:string):Promise<void>{
    await auth.authStateReady();
    const previous=auth.currentUser;
    if(previous?.isAnonymous){
      const credential=EmailAuthProvider.credential(email.trim(),password);
      await linkWithCredential(previous,credential);
    }else{
      await createUserWithEmailAndPassword(auth,email.trim(),password);
    }
    await this.ensureStaffProfile();
  }
  async signOutStaff():Promise<void>{await signOut(auth);}
  async ensureStaffProfile():Promise<void>{
    const user=auth.currentUser;if(!user||user.isAnonymous)return;
    const ref=doc(db,'staff',user.uid),snap=await getDoc(ref);
    if(!snap.exists())await setDoc(ref,{email:user.email??'',role:'pending',createdAt:serverTimestamp()});
  }
  async getStaffRole():Promise<'admin'|'judge'|'pending'|'none'>{
    const user=auth.currentUser;if(!user||user.isAnonymous)return 'none';
    const snap=await getDoc(doc(db,'staff',user.uid));
    const role=snap.data()?.['role'];
    return role==='admin'||role==='judge'?role:'pending';
  }
  async listStaff():Promise<{uid:string;email:string;role:string}[]>{
    const user=auth.currentUser;if(!user||user.isAnonymous)return [];
    const snapshot=await getDocs(collection(db,'staff'));
    return snapshot.docs.map(d=>({uid:d.id,email:String(d.data()['email']??''),role:String(d.data()['role']??'pending')}));
  }
  async setStaffRole(uid:string,role:'judge'|'pending'):Promise<void>{
    await updateDoc(doc(db,'staff',uid),{role});
  }

  get currentEventId(): string { return this.eventId; }
  get currentUserId(): string | null { return auth.currentUser?.uid ?? null; }
  async listOwnedEvents():Promise<CloudEvent[]> {
    const user=auth.currentUser;
    if(!user||user.isAnonymous)return [];
    const snapshot=await getDocs(query(collection(db,'events'),where('ownerUid','==',user.uid)));
    return snapshot.docs.filter(item=>item.data()['deleted']!==true).map(item=>({id:item.id,title:String(item.data()['title']??''),mode:item.data()['mode']==='knockout'?'knockout' as const:'league' as const,open:item.data()['open']===true,date:String(item.data()['date']??''),location:String(item.data()['location']??'')})).sort((a,b)=>a.title.localeCompare(b.title,'zh-Hant'));
  }
  async createEvent(title: string, mode: 'league' | 'knockout', date:string, location:string): Promise<string> {
    const user = auth.currentUser;
    if(!user||user.isAnonymous)throw new Error('請先以管理者帳號登入');
    const eventRef = doc(collection(db, 'events'));
    await setDoc(eventRef, { title, mode, date, location, ownerUid: user.uid, open: true, deleted:false, createdAt: serverTimestamp() });
    return eventRef.id;
  }
  async loadEvent(eventId: string): Promise<{title:string;mode:'league'|'knockout';open:boolean;ownerUid:string;date:string;location:string}> {
    if(!auth.currentUser)await signInAnonymously(auth);
    const snap = await getDoc(doc(db, 'events', eventId));
    if (!snap.exists() || snap.data()['deleted']===true) throw new Error('找不到賽事或賽事已刪除');
    const data = snap.data();
    return {title:String(data['title']),mode:data['mode']==='knockout'?'knockout':'league',open:data['open']===true,ownerUid:String(data['ownerUid']),date:String(data['date']??''),location:String(data['location']??'')};
  }
  async setRegistrationOpen(open:boolean):Promise<void> {
    const user=auth.currentUser;
    if(!user)throw new Error('請先完成匿名驗證');
    const ref=doc(db,'events',this.eventId);
    const snap=await getDoc(ref);
    if(!snap.exists()||snap.data()['ownerUid']!==user.uid)throw new Error('只有建立賽事的裝置可以管理報名');
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(ref,{open});
  }
  async deleteEvent(eventId:string):Promise<void>{
    const user=auth.currentUser;
    if(!user)throw new Error('請先完成匿名驗證');
    const ref=doc(db,'events',eventId);
    const snapshot=await getDoc(ref);
    if(!snapshot.exists()||snapshot.data()['ownerUid']!==user.uid)throw new Error('只有賽事建立者可以刪除');
    await updateDoc(ref,{deleted:true,open:false});
  }
  async useEvent(eventId:string):Promise<void>{this.unsubscribe?.();this.unsubscribe=undefined;this.scheduleUnsubscribe?.();this.scheduleUnsubscribe=undefined;this.eventId=eventId;this.verifiedScheduleOwnerEventId=null;}

  async publishSchedule(payload:{mode:'league'|'knockout';players:string[];matches:{id:number;round:number;a:string|null;b:string|null;sa:number|null;sb:number|null;battleRound?:number}[]}):Promise<void>{
    const user=auth.currentUser;
    if(!user||this.eventId==='main')throw new Error('請先選擇有效賽事');
    const eventId=this.eventId;
    if(this.verifiedScheduleOwnerEventId!==eventId){
      const event=await getDoc(doc(db,'events',eventId));
      if(!event.exists()||event.data()['ownerUid']!==user.uid||event.data()['deleted']===true)throw new Error('只有賽事主辦方可以發布賽程');
      this.verifiedScheduleOwnerEventId=eventId;
    }
    await setDoc(doc(db,'events',eventId,'public','schedule'),{...payload,updatedAt:serverTimestamp()});
  }
  async watchSchedule(onData:(data:{mode:'league'|'knockout';players:string[];matches:{id:number;round:number;a:string|null;b:string|null;sa:number|null;sb:number|null;battleRound?:number}[]}|null)=>void,onError:(message:string)=>void):Promise<void>{
    if(!auth.currentUser)await signInAnonymously(auth);
    this.scheduleUnsubscribe?.();
    this.scheduleUnsubscribe=onSnapshot(doc(db,'events',this.eventId,'public','schedule'),snap=>{
      const data=snap.data();
      this.zone.run(()=>onData(data?{mode:data['mode']==='knockout'?'knockout':'league',players:Array.isArray(data['players'])?data['players']:[],matches:Array.isArray(data['matches'])?data['matches']:[]}:null));
    },error=>this.zone.run(()=>onError(error.message)));
  }
  constructor(private zone: NgZone) {}
  async connect(onNames: (names: CloudRegistration[]) => void, onError: (error: string) => void): Promise<void> {
    try {
      if(!auth.currentUser)await signInAnonymously(auth);
      this.unsubscribe?.();
      this.unsubscribe = onSnapshot(collection(db, 'events', this.eventId, 'registrations'), snapshot => {
        const names = snapshot.docs.map(d => ({ uid: d.id, name: String(d.data()['name'] ?? ''), ownerUid: String(d.data()['uid'] ?? '') }))
          .filter(item => item.name.length > 0).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
        this.zone.run(() => onNames(names));
      }, error => this.zone.run(() => onError(error.message)));
    } catch (error) {
      this.zone.run(() => onError(error instanceof Error ? error.message : String(error)));
    }
  }
  async register(name: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('匿名登入尚未完成');
    await addDoc(collection(db, 'events', this.eventId, 'registrations'), {
      name, uid: user.uid, createdAt: serverTimestamp()
    });
  }
}
