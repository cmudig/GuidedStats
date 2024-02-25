<script lang="ts">
    import CollapseIcon from '../icons/CollapseIcon.svelte';
    import ExpandIcon from '../icons/ExpandIcon.svelte';

    let active = false;
</script>

<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css"
    integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ"
    crossorigin="anonymous"
/>

<div
    class="grow text-wrap bg-gray-100 p-2 m-1 w-rounded-lg font-sans text-gray-800 overflow-y-scroll"
>
    <span class="text-blue-700 font-bold">What is this step for:</span>
    <slot name="step" />
    {#if $$slots.concept}
        <button
            class="w-full my-2 hover:border-gray-300 text-white font-bold rounded"
            on:click={() => {
                active = !active;
            }}
        >
            <div class="flex">
                <span class="text-blue-700">More Information:</span>
                <div class="grow" />
                {#if active}
                    <CollapseIcon width="1.2em" height="1.2em" />
                {:else}
                    <ExpandIcon width="1.2em" height="1.2em" />
                {/if}
            </div>
        </button>
        {#if active}
            <slot name="concept" />
        {/if}
    {/if}
</div>
