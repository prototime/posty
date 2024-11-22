<script lang="ts">
    import { Button, buttonVariants } from "@/components/ui/button";
    import { Textarea } from "@/components/ui/textarea";
    import { ImagePlus, Loader2 } from "lucide-svelte";
    import { Label } from "@/components/ui/label";

    let message = $state("");
    let sending = $state(false);

    let files = $state<File[]>([]);


    const upload = async (endpoint: string, filesData: any): Promise<Response> => {
        return await fetch(`/api/${endpoint}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: filesData }),
        });
    }

    const sendToBsky = async (filesData: any): Promise<Response> => {
        return await upload("bluesky", filesData);
    };

    const sentToTwitterX = async (filesData: any): Promise<Response> => {
        return await upload("twitter", filesData);
    };

    const send = async (event: Event) => {
        event.preventDefault();

        if (sending) {
            return;
        }

        sending = true;

        const filesData = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                return {
                    buffer: Array.from(new Uint8Array(arrayBuffer)),
                    type: file.type
                };
            })
        );
        
        // Run both API calls concurrently and collect results
        const results = await Promise.allSettled([
            sendToBsky(filesData),
            sentToTwitterX(filesData)
        ]);

        // Log any errors that occurred
        results.forEach((result, index) => {
            const service = index === 0 ? 'Bluesky' : 'Twitter';
            if (result.status === 'rejected') {
                console.error(`${service} upload failed:`, result.reason);
            }
        });

        message = "";
        files = [];

        sending = false;
    };

    const addFiles = (event: Event) => {
        const formFiles = event.target.files;

        // Loop over the selected files and append them to the array
        for (let i = 0; i < formFiles.length; i++) {
            files.push(formFiles[i]);
        }
    };
</script>

<div class="container flex flex-col items-center justify-center h-screen">
    <form class="w-full max-w-[600px] flex flex-col gap-4 py-4" onsubmit={send}>
        <Textarea bind:value={message} placeholder="Post something..." class="min-h-[100px]" />

        <div class="flex justify-end gap-2">
            <Label for="file" class={buttonVariants({ variant: "outline" })}>
                <ImagePlus />
            </Label>
            <input multiple accept="image/png, image/jpeg" class="hidden" id="file" name="file" type="file" onchange={addFiles} />
            <Button class="grow" type="submit" disabled={sending}>
                {#if sending}
                    <Loader2 class="animate-spin" />
                {:else}
                    Send
                {/if}
            </Button>
        </div>
        <div class="grid grid-cols-4 gap-2">
            {#if files && files.length > 0}
                {#each files as image, index}
                    <button class="w-full h-[200px] bg-gray-200 rounded-md overflow-hidden group relative" onclick={() => files.splice(index, 1)}>
                        <div
                            class="absolute top-0 right-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white flex items-center justify-center"
                        >
                            Remove File
                        </div>
                        <img src={URL.createObjectURL(image)} alt="uploaded image" class="object-cover w-full h-full" />
                    </button>
                {/each}
            {/if}
        </div>
    </form>
</div>
