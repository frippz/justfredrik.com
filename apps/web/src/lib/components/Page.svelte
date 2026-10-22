<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    /** The heading's id, Jekyll's slug of the title */
    id: string
    title: string
    children: Snippet
  }

  let { id, title, children }: Props = $props()
</script>

<!-- A hand-written page in the markup of frippz.se's `page` layout -->
<article aria-labelledby={id}>
  <h2 {id}>{title}</h2>
  {@render children()}
</article>
