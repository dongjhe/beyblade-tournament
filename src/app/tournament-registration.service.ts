import { Injectable, NgZone } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, getFirestore, onSnapshot, serverTimestamp, Unsubscribe } from 'firebase/firestore';

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
const eventId = 'main';

@Injectable({ providedIn: 'root' })
export class TournamentRegistrationService {
  private unsubscribe?: Unsubscribe;
  constructor(private zone: NgZone) {}
  async connect(onNames: (names: CloudRegistration[]) => void, onError: (error: string) => void): Promise<void> {
    try {
      await signInAnonymously(auth);
      this.unsubscribe?.();
      this.unsubscribe = onSnapshot(collection(db, 'events', eventId, 'registrations'), snapshot => {
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
