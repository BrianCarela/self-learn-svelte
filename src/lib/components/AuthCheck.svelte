<!-- now that we have a user store, it's trivial to check the user authentication state throughout the application. However, it can still be repetitive to implement conditional logic everywhere, prompting the user to sign in if they navigate somewhere they're not supposed to. -->
<script lang="ts">
    import { user } from '$lib/firebase'
</script>

<!-- now whenever we have authenticated content, all we have to do is wrap it in this component. -->
{#if $user}
  <slot />
{:else}
    <p class="text-error">
        You must be signed in to view this page.
        <a class="btn btn-primary" href="/login">Sign in</a>
    </p>
{/if}