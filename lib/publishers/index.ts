import 'server-only'
import { publishToLinkedIn } from '@/lib/publishers/linkedin'
import { publishToInstagram } from '@/lib/publishers/instagram'
import { publishTwitterThread, publishSingleTweet } from '@/lib/publishers/twitter'
import { publishTikTokDraft } from '@/lib/publishers/tiktok'
import { publishToFacebook } from '@/lib/publishers/facebook'
import type { Platform } from '@/types'

export interface PublishResult {
  post_id: string
  post_url: string
}

/**
 * Dispatches a publish call to the appropriate platform publisher.
 * Shared by both the immediate-publish route and the scheduled-cron route.
 */
export async function executePublish(
  platform: Platform,
  accessToken: string,
  account: any,
  output: any
): Promise<PublishResult> {
  const content: string = output.content
  const format: string = output.format

  switch (platform) {
    case 'linkedin': {
      return publishToLinkedIn(accessToken, content, account.platform_user_id, !!account.page_id)
    }
    case 'instagram': {
      return publishToInstagram(accessToken, account.platform_user_id, content)
    }
    case 'twitter': {
      // For twitter_thread format, parse JSON array of tweets
      if (format === 'twitter_thread') {
        try {
          const tweets = JSON.parse(content) as Array<{ content: string }>
          return publishTwitterThread(accessToken, tweets)
        } catch {
          return publishSingleTweet(accessToken, content)
        }
      }
      return publishSingleTweet(accessToken, content)
    }
    case 'tiktok': {
      return publishTikTokDraft(accessToken, content)
    }
    case 'facebook': {
      const pageId = account.page_id ?? account.platform_user_id
      return publishToFacebook(accessToken, pageId, content)
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
