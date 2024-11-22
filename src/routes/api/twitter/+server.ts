import { PUBLIC_TWITTER_ACCESS_TOKEN, PUBLIC_TWITTER_ACCESS_TOKEN_SECRET, PUBLIC_TWITTER_API_KEY, PUBLIC_TWITTER_API_KEY_SECRET, PUBLIC_TWITTER_CLIENT_ID, PUBLIC_TWITTER_CLIENT_SECRET } from "$env/static/public";
import { TwitterApi } from "twitter-api-v2";


export async function POST({ request }) {
    const { message } = await request.json();

    let twitterClient = new TwitterApi({
        appKey: PUBLIC_TWITTER_API_KEY,
        appSecret: PUBLIC_TWITTER_API_KEY_SECRET,
        accessToken: PUBLIC_TWITTER_ACCESS_TOKEN,
        accessSecret: PUBLIC_TWITTER_ACCESS_TOKEN_SECRET
    });

    const tweet = await twitterClient.v2.tweet(message);

    return new Response(JSON.stringify(tweet), { status: 200 });
}
