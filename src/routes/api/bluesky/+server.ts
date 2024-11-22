import { RichText } from "@atproto/api";
import { json } from "@sveltejs/kit";

export async function POST({ request, locals: { bskyAgent } }) { 
    const { message, files } = await request.json();

    let uploads = [];

    if (files?.length > 0) {
        for (const file of files) {
            // Convert the numeric array back to a Blob
            const uint8Array = new Uint8Array(file.data);
            const blob = new Blob([uint8Array], { type: file.type });
            
            uploads.push({
                image: (await bskyAgent.uploadBlob(blob, { encoding: file.type })).data.blob,
                alt: "",
            });
        }
    }

    // creating richtext
    const rt = new RichText({
        text: message,
    });

    await rt.detectFacets(bskyAgent); // automatically detects mentions and links

    const postRecord = {
        $type: "app.bsky.feed.post",
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
        embed: {
            images: uploads,
            $type: "app.bsky.embed.images",
        },
    };

    await bskyAgent.post(postRecord);


    return json({ success: true})

}