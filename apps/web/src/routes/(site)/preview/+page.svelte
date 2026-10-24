<script lang="ts">
  import { PAYLOAD_URL } from '$app/env/public'
  import { page } from '$app/state'
  import {
    isLivePreviewEvent,
    mergeData,
    ready,
  } from '@payloadcms/live-preview'
  import type { Post, Tag } from 'cms-types'
  import { onMount } from 'svelte'
  import Article from '#lib/components/Article.svelte'
  import { renderPost, type RenderedPost } from '#lib/body'
  import { Relationships } from '#lib/preview'

  // Only messages from the CMS are rendered
  const cmsOrigin = new URL(PAYLOAD_URL).origin

  let post = $state<RenderedPost>()
  let error = $state<string>()

  const relationships = new Relationships()

  const tags = (post: Post) =>
    (post.tags ?? []).filter((tag): tag is Tag => typeof tag === 'object')

  const render = (data: Post) =>
    renderPost({
      title: data.title || 'Untitled',
      slug: data.slug || 'untitled',
      description: data.description ?? '',
      // A Draft that was never published has no date yet
      publishedAt: data.publishedAt || new Date().toISOString(),
      revisedAt: data.revisedAt ?? undefined,
      body: data.body,
      tags: tags(data).map(({ name, slug }) => ({ name, slug: slug! })),
    })

  type RequestHandler = NonNullable<
    Parameters<typeof mergeData>[0]['requestHandler']
  >

  /** Asks the CMS to populate the Post, as the editor, unless every doc it refers to is known */
  const populate: RequestHandler = async ({
    apiPath,
    data,
    endpoint,
    serverURL,
  }) => {
    const known = relationships.populate(data.data)
    if (known) return Response.json(known)

    const response = await fetch(`${serverURL}${apiPath}/${endpoint}`, {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Payload-HTTP-Method-Override': 'GET',
      },
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error(`The CMS answered ${response.status}`)
    }
    relationships.remember(await response.clone().json())
    return response
  }

  onMount(() => {
    const id = page.url.searchParams.get('id')
    // Only the latest change is shown, however long the ones before it take
    let latest = 0

    async function onMessage(event: MessageEvent) {
      if (!isLivePreviewEvent(event, cmsOrigin)) return
      if (event.data.collectionSlug !== 'posts') return
      if (event.data.externallyUpdatedRelationship) relationships.forget()

      const message = ++latest
      try {
        const data = await mergeData<Post>({
          serverURL: cmsOrigin,
          collectionSlug: 'posts',
          // Populates Tags, and the Media in Figure blocks
          depth: 2,
          incomingData: event.data.data,
          initialData: { id } as unknown as Post,
          requestHandler: populate,
        })
        const rendered = await render(data)
        if (message !== latest) return
        post = rendered
        error = undefined
      } catch (e) {
        if (message !== latest) return
        error = e instanceof Error ? e.message : String(e)
      }
    }

    window.addEventListener('message', onMessage)
    ready({ serverURL: cmsOrigin })
    return () => window.removeEventListener('message', onMessage)
  })
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

{#if error}
  <p role="alert">Can't preview this Post: {error}</p>
{:else if post}
  <Article {post} />
{:else}
  <p>Waiting for the CMS…</p>
{/if}
