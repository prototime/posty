import { json } from "@sveltejs/kit";
import { Buffer } from 'buffer';


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

    const tweet = await twitterClient?.v2?.tweet({
        text: message,
        media:  {
            media_ids: mediaIds.length > 0 ? mediaIds : undefined,
            tagged_user_ids: []
        }
        
    }); 

    return json(tweet);
}
