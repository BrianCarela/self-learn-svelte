<script lang="ts">
    import AuthCheck from "$lib/components/AuthCheck.svelte";
    import { user, userData, storage, db } from "$lib/firebase";
    import { doc, updateDoc } from "firebase/firestore";
    import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

    // state variables
    let previewURL: string; // for the file
    let uploading = false;
    // reactive link
    $: href = `/${$userData?.username}/edit`;

    async function upload(e: any) {
        // begin the upload process
        uploading = true;
        // contains the file(s) from the form input
        const file = e.target.files[0];
        // URL is built into the browser
        previewURL = URL.createObjectURL(file);
        // find a place to store the file.
        const storageRef = ref(storage, `users/${$user!.uid}/profile.png`);
        // upload to firebase at the specified location
        const result = await uploadBytes(storageRef, file);
        // once the file is uploaded, retrieve the url
        const url = await getDownloadURL(result.ref);
        // store the url on the user's document
        await updateDoc(doc(db, "users", $user!.uid), { photoURL: url});
        // end the upload process
        uploading = false;
    }
</script>

<AuthCheck>
    <h2 class="card-title">Upload a Profile Photo</h2>

    <form class="max-w-screen-md w-full">
        <div class="form-control w-full max-w-xs my-10 mx-auto text-center">
            <!-- when the user has selected a new image, previewURL -->
             <!-- if not selected, sub to the user data store and display the current photo -->
              <!-- if that's not there, fall back on a static img -->
            <img 
                src={previewURL ?? $userData?.photoURL ?? "/user.png"}
                alt="photoURL"
                width="256"
                height="256"
                class="mx-auto"
            />

            <label for="photoURL" class="label">
                <span class="label-text">Pick a file</span>
            </label>
            <!-- type="file" is what lets a user select a file -->
            <input 
                on:change={upload}
                name="photoURL"
                type="file"
                class="file-input file-input-bordered w-full max-w-xs"
                accept="image/png, image/jpeg, image/gif, image/webp"
            />
            <!-- progress indicator -->
             {#if uploading}
               <p>Uploading...</p>
               <progress class="progress-info w-56 mt-6" />
             {/if}
        </div>
    </form>

    <a {href} class="btn btn-primary"> Finish </a>
</AuthCheck>
