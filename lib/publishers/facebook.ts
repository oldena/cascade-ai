import 'server-only'

export interface FacebookPublishResult {
  post_id: string
  post_url: string
}

/**
 * Publish a text post to a Facebook Page.
 * accessToken must have pages_manage_posts scope.
 * pageId is the Facebook Page ID (stored in social_accounts.platform_user_id or page_id).
 */
export async function publishToFacebook(
  accessToken: string,
  pageId: string,
  content: string
): Promise<FacebookPublishResult> {
  // First get the Page access token from the user token
  const pageTokenRes = await fetch(
    `https://graph.facebook.com/v20.0/${pageId}?fields=access_token&access_token=${accessToken}`
  )

  let pageToken = accessToken
  if (pageTokenRes.ok) {
    const pageTokenData = await pageTokenRes.json() as { access_token?: string }
    if (pageTokenData.access_token) pageToken = pageTokenData.access_token
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: content,
      access_token: pageToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Facebook publish failed (${res.status}): ${err}`)
  }

  const data = await res.json() as { id: string }
  const postId = data.id
  return {
    post_id: postId,
    post_url: `https://www.facebook.com/${postId.replace('_', '/posts/')}`,
  }
}
