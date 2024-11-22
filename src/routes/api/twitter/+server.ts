import { PUBLIC_TWITTER_ACCESS_TOKEN, PUBLIC_TWITTER_ACCESS_TOKEN_SECRET, PUBLIC_TWITTER_API_KEY, PUBLIC_TWITTER_API_KEY_SECRET, PUBLIC_TWITTER_CLIENT_ID, PUBLIC_TWITTER_CLIENT_SECRET } from "$env/static/public";
import { json } from "@sveltejs/kit";
import { TwitterApi } from "twitter-api-v2";
import { Buffer } from 'buffer';

let twitterClient = new TwitterApi({
    appKey: PUBLIC_TWITTER_API_KEY,
    appSecret: PUBLIC_TWITTER_API_KEY_SECRET,
    accessToken: PUBLIC_TWITTER_ACCESS_TOKEN,
    accessSecret: PUBLIC_TWITTER_ACCESS_TOKEN_SECRET
});



export async function POST({ request }) {
    const { message, files } = await request.json();

    let mediaIds = [];
    
    // Convert array buffer to Buffer and upload
    if (files && files.length > 0) {
        for (const file of files) {
            // Convert the array back to Buffer
            const buffer = Buffer.from(file.buffer);
            const mediaId = await twitterClient.v1.uploadMedia(buffer, { mimeType: file.type });
            mediaIds.push(mediaId);
        }
    }

    const tweet = await twitterClient.v2.tweet({
        text: message,
        media:  {
            media_ids: mediaIds.length > 0 ? mediaIds : undefined,
            tagged_user_ids: []
        }
        
    }); 

    return json(tweet);
}
