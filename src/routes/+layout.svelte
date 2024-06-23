<script lang="ts">
    import { user, userData } from "$lib/firebase"
    import "../app.css"

    // subscribed to these stores in the global layout so it's available everywhere
    $user;
    $userData;
</script>

<!-- this is the root layout. Everything gets flex -->
<div class="min-h-screen flex flex-col">
    <slot />
</div>