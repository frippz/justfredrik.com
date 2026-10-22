<script lang="ts">
  import Page from '#lib/components/Page.svelte'
  import { labPath, labs } from '#lib/labs'
</script>

<Page id="labs" title="Labs">
  <p>
    This is where I collect all my experimental stuff, either from earlier posts
    or from whatever my brain once wrought upon the world.
  </p>

  <p>
    If you find something interesting and you want to use it, feel free!
    Everything is contained within the same file, so all you have to do is check
    the source.
  </p>

  <ul>
    {#each labs as lab (lab.name)}
      <li><a href={labPath(lab)}>{lab.title}</a></li>
    {/each}
  </ul>
</Page>
