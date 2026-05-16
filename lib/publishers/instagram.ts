import 'server-only'

export async function publishToInstagram(
  accessToken: string,
  igUserId: string,
  caption: string
): Promise<{ post_id: string; post_url: string }> {
  // Instagram requires media for posts — save as draft (caption-only)
  // Return a draft indicator since no image is attached
  // In production, user would attach an image before publishing

  // Attempt to create a text-only container (will fail on real API without media)
  // For now, return a draft status with a helpful message
  throw new Error('Instagram requires an image or video. Please attach media in the Instagram app.')
}

export async function publishCarouselToInstagram(
  accessToken: string,
  igUserId: string,
  items: Array<{ imageUrl: string; caption?: string }>,
  caption: string
): Promise<{ post_id: string; post_url: string }> {
  // Step 1: Create carousel item media objects
  const itemIds: string[] = []
  for (const item of items) {
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: item.imageUrl,
        is_carousel_item: true,
      }),
    })
    if (!containerRes.ok) throw new Error(`Carousel item creation failed: ${await containerRes.text()}`)
    const { id } = (await containerRes.json()) as { id: string }
    itemIds.push(id)
  }

  // Step 2: Create carousel container
  const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'CAROUSEL', children: itemIds.join(','), caption }),
  })
  if (!carouselRes.ok) throw new Error(`Carousel container failed: ${await carouselRes.text()}`)
  const { id: containerId } = (await carouselRes.json()) as { id: string }

  // Step 3: Publish
  const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId }),
  })
  if (!publishRes.ok) throw new Error(`Carousel publish failed: ${await publishRes.text()}`)
  const { id: postId } = (await publishRes.json()) as { id: string }

  return { post_id: postId, post_url: `https://www.instagram.com/p/${postId}/` }
}
