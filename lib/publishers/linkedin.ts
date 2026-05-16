import 'server-only'

export interface LinkedInPublishResult {
  post_id: string
  post_url: string
}

export async function publishToLinkedIn(
  accessToken: string,
  content: string,
  authorId: string, // LinkedIn person URN or org URN
  isPage = false
): Promise<LinkedInPublishResult> {
  const author = isPage ? `urn:li:organization:${authorId}` : `urn:li:person:${authorId}`

  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn publish failed (${res.status}): ${err}`)
  }

  const data = (await res.json()) as { id: string }
  const postId = data.id
  return {
    post_id: postId,
    post_url: `https://www.linkedin.com/feed/update/${postId}/`,
  }
}
