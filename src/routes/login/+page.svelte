<script lang="ts">
    // auth logic is here, but it could be moved to the lib directory if you want to use this logic around multiple pages. with larger apps, that's what you want to do.
    import { auth, user } from "$lib/firebase";

    import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";


    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        // this makes the popup where ppl can sign in using google
        const user = await signInWithPopup(auth, provider);
        console.log(user)
    }
</script>

<h2>Login</h2>

<!-- conditional rendering based on user auth -->
{#if $user}
  <h2 class="card-title">Welcome, {$user.displayName}</h2>
  <p class="text-center text-success">You are logged in</p>
  <button class="btn btn-warning" on:click={() => signOut(auth)}>Sign out</button>
{:else}
  <button class="btn btn-primary" on:click={signInWithGoogle}>Sign in with Google</button>
{/if}