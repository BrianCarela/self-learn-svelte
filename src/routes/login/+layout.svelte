<script lang="ts">
    // page info so we can use the url for conditional rendering
    import { page } from "$app/stores";

    import AnimatedRoute from "$lib/components/AnimatedRoute.svelte";
  </script>
  
  <nav class="flex justify-center my-6">
    <ul class="steps">
        <!-- step-primary class decides on which thing is highlighted -->
      <a href="/login" class="step step-primary">Sign In</a>
      <!-- regex format .match() -->
      <a
        href="/login/username"
        class="step"
        class:step-primary={$page.route.id?.match(/username|photo/g)}>
        Choose Username
      </a>
      <!-- js format .includes() -->
      <a
        href="/login/photo"
        class="step"
        class:step-primary={$page.route.id?.includes("photo")}>
        Upload Photo
      </a>
    </ul>
  </nav>
  
  <AnimatedRoute>
    <main class="card w-4/6 bg-neutral text-neutral-content mx-auto">
        <div class="card-body items-center text-center">
        <slot />
        </div>
    </main>
  </AnimatedRoute>