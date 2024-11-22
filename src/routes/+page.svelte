<script lang="ts">
    import { Button } from "@/components/ui/button";
    import { Textarea } from "@/components/ui/textarea";
    import { invoke } from "@tauri-apps/api/core";
    import { ImagePlus, Loader2 } from "lucide-svelte";
    import { BskyAgent, RichText } from "@atproto/api";
    import {
        PUBLIC_BSKY_USERNAME,
        PUBLIC_BSKY_PASSWORD,
        PUBLIC_TWITTER_API_KEY,
        PUBLIC_TWITTER_API_KEY_SECRET,
        PUBLIC_TWITTER_ACCESS_TOKEN,
        PUBLIC_TWITTER_ACCESS_TOKEN_SECRET,
    } from "$env/static/public";

    let message = $state("");
    let sending = $state(false);

    const bskyAgent = new BskyAgent({
        service: "https://bsky.social",
    });

    try {
        bskyAgent.login({
            identifier: PUBLIC_BSKY_USERNAME,
            password: PUBLIC_BSKY_PASSWORD,
        });
    } catch (err) {
        console.error("failed to login to bsky");
        console.log(err);
    }

    const sendToBsky = async () => {
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
        };

        await bskyAgent.post(postRecord);
    };

    const sentToTwitterX = async () => {
        await fetch("/api/twitter", {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    };

    async function greet(event: Event) {
        event.preventDefault();

        if (sending) {
            return;
        }

        sending = true;

        // TODO: await multiple promises and handle errors
        // await sendToBsky();
        await sentToTwitterX();

        message = "";

        sending = false;
    }
</script>

<div class="container flex flex-col items-center justify-center h-screen">
    <form class="w-[500px] flex flex-col gap-4 py-4" onsubmit={greet}>
        <Textarea bind:value={message} placeholder="Post something..." class="min-h-[100px]" />

        <div class="flex justify-end gap-2">
            <Button variant="outline">
                <ImagePlus />
            </Button>
            <Button class="grow" type="submit" disabled={sending}>
                {#if sending}
                    <Loader2 class="animate-spin" />
                {:else}
                    Send
                {/if}
            </Button>
        </div>
    </form>
</div>
