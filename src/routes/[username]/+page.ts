import type { PageLoad } from './$types';
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "$lib/firebase";
import { error } from "@sveltejs/kit";

// this function will use the username value to fetch the data from firestore for that user so we can display it in the ui
export const load = (async ({ params }) => {
    // reference the user collection
    const collectionRef = collection(db, "users");

    // make a query to the user collection
    // it reads like a sql query 😂 
    const q = query(
        collectionRef,
        where("username", "==", params.username),
        limit(1)
    )

    // real time read of the document
    const snapshot = await getDocs(q); // returns an array
    const exists = snapshot.docs[0]?.exists();
    // extract the data here
    const data = snapshot.docs[0]?.data();

    // svelte error function used to handle accessing a user that doesnt exist
    if(!exists) {
        throw error(404, "that user does not exist!")
    } 

    // private users
    if(!data.published) {
        throw error(403, `The profile of @${data.username} is not public!`)
    }

    // return the data we wanna use
    return {
        username: data.username,
        photoURL: data.photoURL,
        bio: data.bio,
        links: data.links ?? [],
    }
}) satisfies PageLoad;