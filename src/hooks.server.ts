import { TwitterApi } from "twitter-api-v2";
import { PUBLIC_BSKY_PASSWORD, PUBLIC_BSKY_USERNAME, PUBLIC_TWITTER_ACCESS_TOKEN, PUBLIC_TWITTER_ACCESS_TOKEN_SECRET, PUBLIC_TWITTER_API_KEY, PUBLIC_TWITTER_API_KEY_SECRET } from "$env/static/public";
import { BskyAgent, RichText } from "@atproto/api";

let bskyAgent: BskyAgent | null = null;
let twitterClient: TwitterApi | null = null;

export async function handle({ event, resolve }) {



    if (!bskyAgent) {

        try {
            bskyAgent = new BskyAgent({
                service: "https://bsky.social",
            });
    
            await bskyAgent.login({
                identifier: PUBLIC_BSKY_USERNAME,
                password: PUBLIC_BSKY_PASSWORD,
            });
        } catch (error) {
            console.log("bskyAgent error");
            console.error(error);
        }
    }


    event.locals.bskyAgent = bskyAgent;


    if (!twitterClient) {
        try {
            twitterClient = new TwitterApi({
                appKey: PUBLIC_TWITTER_API_KEY,
                appSecret: PUBLIC_TWITTER_API_KEY_SECRET,
                accessToken: PUBLIC_TWITTER_ACCESS_TOKEN,
                accessSecret: PUBLIC_TWITTER_ACCESS_TOKEN_SECRET
            });
        } catch (error) {
            console.log("twitterClient error");
            console.error(error);
        }
    }

    event.locals.twitterClient = twitterClient;


    return resolve(event);
}

