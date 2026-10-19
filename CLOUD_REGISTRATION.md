# Cloud registration MVP

Firebase project: `beyblade-tournament-eeb50`; Firestore database: `(default)`.

1. In Firebase Console > Firestore Database > Rules, paste `firestore.rules` and **Publish**.
2. Authentication > Sign-in method > Anonymous must be enabled.
3. Run `npm install` (this adds the Firebase JS SDK) then `npm run build` / `npm start`.
4. Open the site in two browsers. Register in one and confirm both see the shared list.
5. The organizer can import cloud registrations into the **existing local tournament** once at least two names exist.

Security / limitations:
- Registration writes are restricted to each anonymous user's own document. Other users cannot overwrite or delete registrations.
- The current version does **not** cloud-sync matches, scores, tournament mode or registration open/close. Those remain local-only.
- The registration list is readable by any anonymously authenticated visitor. Do not collect private data.
- A browser identity can register once; clearing browser storage or using another device can create another identity. Duplicate-name checking is best effort, not server-enforced.
- 64-player limit is enforced in the client, not transactionally in Firestore.
- Do not deploy rules that permit anonymous writes to tournament scores or event settings.
- `events/main` is a temporary shared namespace; multi-event IDs and organizer login must be added before public production use.
