import { Injectable, NgZone } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc, Unsubscribe } from 'firebase/firestore';

export interface CloudRegistration { uid: string; name: string; }
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
  private eventId = 'main';
  get currentEventId(): string { return this.eventId; }
  get currentUserId(): string | null { return auth.currentUser?.uid ?? null; }
  async createEvent(title: string, mode: 'league' | 'knockout'): Promise<string> {
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
    const eventRef = doc(collection(db, 'events'));
    await setDoc(eventRef, { title, mode, ownerUid: user.uid, open: true, createdAt: serverTimestamp() });
    return eventRef.id;
  }
  async loadEvent(eventId: string): Promise<{title:string;mode:'league'|'knockout';open:boolean;ownerUid:string}> {
    const snap = await getDoc(doc(db, 'events', eventId));
    if (!snap.exists()) throw new Error('找不到賽事');
    const data = snap.data();
    return {title:String(data['title']),mode:data['mode']==='knockout'?'knockout':'league',open:data['open']===true,ownerUid:String(data['ownerUid'])};
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
  async useEvent(eventId:string):Promise<void>{this.eventId=eventId;this.unsubscribe?.();}

  constructor(private zone: NgZone) {}
  async connect(onNames: (names: CloudRegistration[]) => void, onError: (error: string) => void): Promise<void> {
    try {
      await signInAnonymously(auth);
      this.unsubscribe?.();
      this.unsubscribe = onSnapshot(collection(db, 'events', this.eventId, 'registrations'), snapshot => {
        const names = snapshot.docs.map(d => ({ uid: d.id, name: String(d.data()['name'] ?? '') }))
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
    await addDoc(collection(db, 'events', eventId, 'registrations'), {
      name, uid: user.uid, createdAt: serverTimestamp()
    });
  }
}
