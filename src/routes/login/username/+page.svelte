<script lang="ts">
    // users need to be logged in to choose a username
    import AuthCheck from "$lib/components/AuthCheck.svelte"
    import { db, user, userData } from "$lib/firebase";
    import { doc, getDoc, writeBatch } from "firebase/firestore"
    

    // LOCAL STATE
    // username is bound to the input
    let username = "";
    let loading = false;
    let isAvailable = false;

    // EXAMPLE OF REACTIVE DECLARATION
    // let count = 420
    // $: doubled = count * 2 // reactive to changes in count

    // Alphanumeric with . and _ but no repeating .. __ or beginning/ending with . or _
    const regex = /^(?=[a-zA-Z0-9._]{3,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
  
    $: isValid = username?.length > 2 && username.length < 16 && regex.test(username); // passes regex
    $: isTouched = username.length > 0; // if the user typed anything
    $: isTaken = isValid && !isAvailable && !loading // when checkAvailability() ends, we know if its taken

    // to prevent querying per key press, debounce will wait until a user has stopped typing
    let debounceTimer: NodeJS.Timeout;

    // queries the firestore to see if the username is taken
    async function checkAvailability() {
        // default's the value
        isAvailable = false;

        // reset the timer
        clearTimeout(debounceTimer)

        // wait while we check if that's available...
        loading = true
        
        // only run after 500ms of waiting
        debounceTimer = setTimeout(async () => {
            console.log("checking availability of", username);

            // doc is a firestore function that references (looks at) a document in the "usernames" collection that matches state var username
            const ref = doc(db, "usernames", username)
            const exists = await getDoc(ref).then((doc) => doc.exists())

            // if it exists, it's unavailable and vice versa
            isAvailable = !exists
            // we're done here
            loading = false
        }, 500)
    }

    // actually creates the username to the database
    async function confirmUsername() {
        // in this function, we have to write to 2 collections in the db, user and username.
        // user for all basic info, username so we have a list of taken names.
        console.log("confirming username", username)

        // When updating 2 connected documents, make that operation atomic,
        // meaning they should fail or succeed together.
        // a batch can define multiple write operations that should happen together
        const batch = writeBatch(db)

        // Set a document in the 'usernames' collection with the username as the document ID
        batch.set(doc(db, "usernames", username), {uid: $user?.uid})
        // Set a document in the 'users' collection with the user's uid as the document ID
        batch.set(doc(db, "users", $user!.uid), {
            username,
            photoURL: $user?.photoURL ?? null,
            published: true,
            bio: 'default bio',
            links: [
                {
                    title: 'Test link',
                    url: 'https://briancarela.com',
                    icon: 'custom'
                }
            ]
        })

        // the actions that have been gathered are used together
        await batch.commit();

        // reset state
        username = ''
        isAvailable = false
    }
</script>

<AuthCheck>
    <!-- subscribed on the routes/+layout.svelte -->
    {#if $userData.username}
        <p class="text-lg">
            Your Username is <span class="text-success font-bold">@{$userData.username}</span>
        </p>
        <p class="text-sm">(Usernames cannot be changed)</p>
        <a class="btn btn-primary" href="/login/photo">Proceed to Photo</a>
    {:else}
        <h2>Username</h2>
        <p class="italic">You cannot change this once set</p>
        <!-- thank god there's a quick preventDefault option -->
        <form class="w-2/5" on:submit|preventDefault={confirmUsername}>
            <!-- the conditional classes come drom daisy ui -->
            <input 
                type="text"
                placeholder="Username"
                class="input w-full"
                bind:value={username}
                on:input={checkAvailability}
                class:input-error={(!isValid && isTouched)}
                class:input-warning={isTaken}
                class:input-success={isAvailable && isValid && !loading}
            />
            <!-- username feedback -->
            <div class="my-4 min-h-16 px-8 w-full">
                {#if loading}
                    <p class="text-secondary">Checking availability of @{username}...</p>
                {/if}

                {#if !isValid && isTouched}
                    <p class="text-error text-sm">
                        must be 3-16 characters long, alphanumeric only
                    </p>
                {/if}

                {#if isValid && !isAvailable && !loading}
                    <p class="text-warning text-sm">
                        @{username} is not available
                    </p>
                {/if}

                {#if isAvailable}
                    <button class="btn btn-success">Confirm username @{username} </button>
                {/if}
            </div>
        </form>
    {/if}
</AuthCheck>
