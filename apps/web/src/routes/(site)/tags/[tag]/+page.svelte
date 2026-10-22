<script lang="ts">
  import { formatOrdinalDate } from '#lib/format'

  let { data } = $props()
</script>

<h2>Articles tagged with <em>“{data.tag}”</em></h2>
<ol>
  {#each data.posts as post (post.path)}
    <li class="tag-item">
      <a href={post.path}>{post.title}</a>
      <small><em>Posted on {formatOrdinalDate(post.publishedAt)}</em></small>
    </li>
  {/each}
</ol>
