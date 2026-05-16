import 'server-only'

interface TwitterTweet { content: string }

export async function publishTwitterThread(
  accessToken: string,
  tweets: TwitterTweet[]
): Promise<{ post_id: string; post_url: string }> {
  if (!tweets.length) throw new Error('No tweets to publish')

  // Validate all tweet lengths before making any API calls
  const invalid = tweets.findIndex(t => t.content.length > 280)
  if (invalid !== -1) {
    throw new Error(`Tweet ${invalid + 1} exceeds 280 characters (${tweets[invalid].content.length} chars)`)
  }

  let firstTweetId: string | null = null
  let lastTweetId: string | null = null

  for (let i = 0; i < tweets.length; i++) {
    const body: Record<string, unknown> = { text: tweets[i].content }
    if (lastTweetId) {
      body.reply = { in_reply_to_tweet_id: lastTweetId }
    }

    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (res.status === 429) {
      const resetAt = res.headers.get('x-rate-limit-reset')
      throw new Error(`Twitter rate limit. Retry after ${resetAt ? new Date(parseInt(resetAt) * 1000).toISOString() : 'unknown'}`)
    }

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Twitter publish failed at tweet ${i + 1} (${res.status}): ${err}`)
    }

    const data = (await res.json()) as { data: { id: string } }
    const tweetId = data.data.id
    if (i === 0) firstTweetId = tweetId
    lastTweetId = tweetId
  }

  return {
    post_id: firstTweetId!,
    post_url: `https://twitter.com/i/web/status/${firstTweetId}`,
  }
}

export async function publishSingleTweet(
  accessToken: string,
  content: string
): Promise<{ post_id: string; post_url: string }> {
  return publishTwitterThread(accessToken, [{ content }])
}
