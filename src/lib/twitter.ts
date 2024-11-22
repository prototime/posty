import { invoke } from "@tauri-apps/api/core";

export async function postTweet(message: string, files: File[]) {
    const filePayloads = await Promise.all(files.map(async (file) => ({
        buffer: Array.from(new Uint8Array(await file.arrayBuffer())),
        type: file.type
    })));

    return await invoke('post_tweet', {
        message,
        files: filePayloads
    });
} 