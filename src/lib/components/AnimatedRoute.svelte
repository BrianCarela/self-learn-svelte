<script>
    // transition module makes animations easy
    import { fly} from "svelte/transition";
    import { page } from "$app/stores";
</script>

<!-- #key rebuilds all children when the value on the right side is updated. In this case, $page.url is the url extension -->
{#key $page.url}
<!-- in:fly makes an animation when the div first appears. x is starting position -->
  <div in:fly={{  x:'-100%', duration: 500 }}>
    <slot  />
  </div>
{/key}