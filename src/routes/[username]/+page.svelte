<script lang="ts">
    // [username] is a dynamic route because of the []. This allows the URL segment to be any value.
    import UserLink from '$lib/components/UserLink.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<!-- add data to the head of the document. Smooth! -->
<svelte:head>
    <title>@{data.username} Links</title>
    <meta name="description" content={data.bio}/>
</svelte:head>

<main class="prose text-center mx-auto mt-8">
    <h1 class="text-7x1 text-purple-500">
        @{data.username}
    </h1>

    <img 
        src={data.photoURL ?? "/user.png"}
        alt="photoURL"
        width="256"
        class="mx-auto"
    />

    <p class="text-xl my-8">
        {data.bio ?? "no bio yet..."}
    </p>
    <ul class="list-none">
        <!-- loops over links, the debug console logs it -->
        {#each data.links as item}
            <li>
                <UserLink {...item}/>
            </li>
        {/each}
    </ul>
</main>