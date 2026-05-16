import 'server-only'

export async function publishTikTokDraft(
  accessToken: string,
  caption: string
): Promise<{ post_id: string; post_url: string }> {
  // TikTok requires video — save as draft with caption pre-filled
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: caption.slice(0, 150),
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: { source: 'FILE_UPLOAD' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`TikTok draft creation failed (${res.status}): ${err}`)
  }

  const data = (await res.json()) as { data?: { publish_id?: string } }
  const publishId = data.data?.publish_id ?? 'draft'

  return {
    post_id: publishId,
    post_url: 'https://www.tiktok.com/creator-center/upload', // redirect user to finish upload
  }
}
