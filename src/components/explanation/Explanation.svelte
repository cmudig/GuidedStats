<script lang="ts">
    import CollapseIcon from '../icons/CollapseIcon.svelte';
    import ExpandIcon from '../icons/ExpandIcon.svelte';

    export let title = '';
    export let content_html = '';
    export let content = '';
    export let items = [];
    export let active = false;

</script>

{#if content_html.length > 0 || content.length > 0 || items.length > 0}
    <button
        class="w-full my-2 hover:border-gray-300 text-white font-bold rounded"
        on:click={() => {
            active = !active;
        }}
    >
        <div class="flex">
            <span class="text-blue-700">
                {#if title.length > 0}
                    <h7 class="text-blue-700">{title}</h7>
                {:else}
                    <h7 class="text-blue-700">More Information</h7>
                {/if}
            </span>
            <div class="grow" />
            {#if active}
                <CollapseIcon width="1.2em" height="1.2em" />
            {:else}
                <ExpandIcon width="1.2em" height="1.3em" />
            {/if}
        </div>
    </button>
    {#if active}
        {#if content_html.length > 0}
            {@html content_html}
        {/if}

        {#if content.length > 0}
            <p>{content}</p>
        {/if}

        {#if items.length > 0}
            <ul class="list-disc list-inside">
                {#each items as item}
                    <li>{item}</li>
                {/each}
            </ul>
        {/if}
    {/if}
{/if}
