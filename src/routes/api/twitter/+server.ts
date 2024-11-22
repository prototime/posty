import { json } from "@sveltejs/kit";
import { Buffer } from 'buffer';
import type { SendTweetV2Params } from "twitter-api-v2";


export async function POST({ request, locals: { twitterClient } }) {
    const { message, files } = await request.json();

    let mediaIds = [];
    
    // Convert array buffer to Buffer and upload
    if (files && files.length > 0) {
        for (const file of files) {
            // Convert the array back to Buffer
            const buffer = Buffer.from(file.buffer);
            const mediaId = await twitterClient?.v1?.uploadMedia(buffer, { mimeType: file.type });
            mediaIds.push(mediaId);
        }
    }

    let tweetBody: SendTweetV2Params = {
        text: message
    }

    if (mediaIds.length > 0) {
        tweetBody.media = {
            media_ids: mediaIds,
            tagged_user_ids: []
        }
    }

    const tweet = await twitterClient?.v2?.tweet(tweetBody); 

    return json(tweet);
}
