<script lang="ts">
  import PostIndex from '#lib/components/PostIndex.svelte'

  let { data } = $props()
</script>

<PostIndex pagination={data.pagination} />
