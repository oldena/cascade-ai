import type { ClientProfile, OutputFormat } from '@/types'

export function buildSystemPrompt(profile: ClientProfile): string {
  return `You are a world-class content strategist writing on behalf of a client.

CLIENT: ${profile.name}
TONE: ${profile.tone_words.join(', ') || 'Professional, clear, engaging'}
CTA STYLE: ${profile.cta_style || 'End with an engaging question or soft call-to-action'}
AVOID: ${profile.avoid_topics.join(', ') || 'Nothing specific'}
${profile.example_posts.length > 0 ? `\n<example_posts>\n${profile.example_posts.map((p, i) => `<post index="${i + 1}">${p}</post>`).join('\n')}\n</example_posts>` : ''}

Write ONLY the requested content. No preamble, no "here is your post:", no meta-commentary. Output the content directly.`
}

export function linkedinPrompt(input: string): string {
  return `Transform this content into a high-performing LinkedIn post.

<source_content>
${input}
</source_content>

REQUIREMENTS:
- Max 3000 characters total
- First 2 lines MUST be a compelling hook (visible before "see more" — make people want to click)
- Use short paragraphs (1-3 lines max)
- Add whitespace between sections for readability
- End with a thought-provoking question OR soft CTA
- Last line only: 3-5 relevant hashtags separated by spaces (no hashtags in body)
- Do NOT use em dashes or bullet points — use line breaks and whitespace instead
- Write in first person unless the client's voice is third-person

Output the post directly. Start with the hook, end with hashtags.`
}

export function carouselPrompt(input: string): string {
  return `Transform this content into a 10-slide LinkedIn/Instagram carousel.

<source_content>
${input}
</source_content>

REQUIREMENTS:
- Exactly 10 slides
- Each slide: TITLE (max 8 words, punchy) + BODY (max 40 words, clear and scannable)
- Slide 1: Hook slide — bold statement or surprising insight that makes people swipe
- Slides 2-9: One clear idea per slide, builds a narrative or teaches something
- Slide 10: CTA slide — summary insight + what to do next

Output as valid JSON array. No markdown, no code blocks, just the JSON:
[
  { "slide": 1, "title": "...", "body": "..." },
  { "slide": 2, "title": "...", "body": "..." },
  ...
]`
}

export function emailsPrompt(input: string): string {
  return `Transform this content into 3 email variations for the same message.

<source_content>
${input}
</source_content>

REQUIREMENTS:
- 3 distinct variations with different angles/tones
- Each email: subject line + email body
- Variation 1: Educational/informational tone
- Variation 2: Story-driven/conversational tone
- Variation 3: Direct/results-focused tone
- Each body: 150-300 words
- Include a clear CTA at the end of each

Output as valid JSON. No markdown, no code blocks:
[
  { "variation": 1, "subject": "...", "body": "..." },
  { "variation": 2, "subject": "...", "body": "..." },
  { "variation": 3, "subject": "...", "body": "..." }
]`
}

export function reelsPrompt(input: string): string {
  return `Transform this content into 3 short-form video script options (Reels/Shorts/TikTok).

<source_content>
${input}
</source_content>

REQUIREMENTS:
- 3 distinct hook + caption combinations
- Each hook: First spoken line (pattern interrupt, max 10 words, stops the scroll)
  Examples: "POV:", "No one talks about this:", "Hot take:", "Stop doing this:", "This changed everything:"
- Each caption: 150-300 words, conversational, informal tone, 1 emoji max per paragraph
- Caption must end with: "Follow for more [relevant topic]"
- Append 3-5 relevant hashtags after the caption

Output as valid JSON. No markdown, no code blocks:
[
  { "option": 1, "hook": "...", "caption": "..." },
  { "option": 2, "hook": "...", "caption": "..." },
  { "option": 3, "hook": "...", "caption": "..." }
]`
}

export function twitterThreadPrompt(input: string): string {
  return `Transform this content into a Twitter/X thread of 6 tweets.

<source_content>
${input}
</source_content>

REQUIREMENTS:
- Exactly 6 tweets
- Tweet 1: Standalone hook that works WITHOUT reading the thread (algorithmic reach) — max 260 chars
- Tweets 2-5: One clear idea per tweet, max 260 characters each (leave room for thread numbering like "2/6")
- Tweet 6: CTA + include the placeholder text [LINK] where the link should go
- No hashtags unless the client's voice explicitly uses them
- Each tweet must be self-contained enough that it makes sense if quoted

Output as valid JSON. No markdown, no code blocks:
[
  { "tweet": 1, "content": "..." },
  { "tweet": 2, "content": "..." },
  { "tweet": 3, "content": "..." },
  { "tweet": 4, "content": "..." },
  { "tweet": 5, "content": "..." },
  { "tweet": 6, "content": "..." }
]`
}

export function newsletterPrompt(input: string): string {
  return `Transform this content into a newsletter section.

<source_content>
${input}
</source_content>

REQUIREMENTS:
- 300-500 words
- Structure: brief intro → main insight(s) → practical takeaway → closing line
- Write in second person ("you") to feel personal
- Use subheadings to break up sections (##)
- Conversational but authoritative tone
- End with a reflection question or teaser for next issue

Output the newsletter section directly. Use ## for subheadings.`
}

export const FORMAT_PROMPTS: Record<OutputFormat, (input: string) => string> = {
  linkedin: linkedinPrompt,
  carousel: carouselPrompt,
  emails: emailsPrompt,
  reels: reelsPrompt,
  twitter_thread: twitterThreadPrompt,
  newsletter: newsletterPrompt,
}
