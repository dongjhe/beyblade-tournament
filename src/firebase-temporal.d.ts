// Compatibility declaration for Firebase Firestore SDK versions that expose
// Temporal.Instant in their public types while the project targets ES2022.
// This is type-only and does not provide a Temporal runtime polyfill.
declare namespace Temporal {
  interface Instant {}
}
