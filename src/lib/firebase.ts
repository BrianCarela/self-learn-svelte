// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore, onSnapshot, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { writable, derived, type Readable } from 'svelte/store'
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// firebase has these hardcoded, make sure to .env it EVERY TIME
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DB_URL,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // it was giving me errors trying to access `window` from the server
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

// // a writeable store is basically just a data structure that has a current value, and then you have the option to push new values to it.
// // whenever the value changes, svelte will re-render to show the latest data
// const currentUser = writable<User | null>(null);

// // this function can tell us when the authentication state changes by listening to the current user
// onAuthStateChanged(auth, (user) => {
//   currentUser.set(user);
// });

/**
 * @returns a store with the current firebase user
 */
function userStore(){
    // `() => void` means that it takes no parameters `()` and returns nothing `void`
    let unsubscribe: () => void

    // sets the store to null if the firebase client SDK is not available.
    if (!auth || !globalThis.window) {
        console.warn('Auth is not initialized or not in browser');
        const { subscribe } = writable<User | null>(null);
        return {
          subscribe,
        }
    }
    // destructuring it's built-in subscribe method
    // the default value for the store will be the current user from Firebase Auth or null if it's not defined
    const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
        // the second argument is a callback that contains a set function that allows us to change the value of the store
        unsubscribe = onAuthStateChanged(auth, (user) => {
            set(user);
        });

        // unsub from the auth state when this store is no longer used in the ui.
        return () => unsubscribe();
    })

    // return an obj with the subscribe function on it
    return {
        subscribe
    }
} // overall keeps track of the current user reliably across the entire application

export const user = userStore();

// REALTIME STORE - listen to database and react
// onSnapshot(doc, (snapshot) => {
//     // handle realtime changes here
// })

// // define a writable store
// export const userData = writable<any>(null);

// // subscribe to the user store which will give the current user's id
// user.subscribe((user) => {

//   if (user) {
//     // reference the current user
//     const docRef = doc(db, `users/${user.uid}`);
//     // onSnapshot listens to changes on this document, and return the data from the db
//     onSnapshot(docRef, (snapshot) => {
//       userData.set(snapshot.data());
//     });
//   } 
// }); // this method does not scale well

/**
 * @params {string} path - document path or reference
 * @returns a store with realtime updates on document data
 */
// <T> is typescript generic. Generics allow you to write flexible, reusable functions that can operate with any data type while maintaining type safety. 
// This is a UNIVERSAL way of listening to firestore documents in svelte, provide you with real-time data, and auto unsubscribe when it's no longer needed.
export function docStore<T>(
    path: string
) {
    let unsubscribe: () => void;

    const docRef = doc(db, path);

    // this extracts the subscribe method frum a null writable
    // const { subscribe } = writable(null);

    // quickly read the db and update the front-end store to reflect such value
    const { subscribe } = writable<T | null>(null, (set) => {
        // Sets up a real-time listener for the Firestore document
        unsubscribe = onSnapshot(docRef, (snapshot) => {
            // Updates the store with the new data from the snapshot
            set((snapshot.data() as T) ?? null)
        });

        // Returns a cleanup function that unsubscribes from the Firestore listener
        return () => unsubscribe()
    })

    // returns real-time updates for a document, the doc itself so u can update it, and it's id
    return {
        subscribe,
        ref: docRef,
        id: docRef.id,
    };
}

// In our case, we want to subscribe to a document that also requires the current user's userId
// stores can be combined using something called a derived store.

// Used Typescript to define the data we expect to return from the derived store (provides intellisense as well)
// once it's defined, it can be used as a generic 
interface UserData {
    username: string;
    bio: string;
    photoURL: string;
    links: any[];
}

// derived stores take 2 or more stores and combines them into a single value
// with $user we pass the current user's current data
export const userData: Readable<UserData | null> = derived(user, ($user, set) => {
    // if the user is logged in, use their uid to find the document
    if($user){
        return docStore<UserData>(`users/${$user.uid}`).subscribe(set)
    } else {
        set(null)
    } // and now we can access the user doc & username anywhere in the app in real time
})