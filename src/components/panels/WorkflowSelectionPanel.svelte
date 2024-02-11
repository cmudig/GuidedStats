<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import WorkflowIcon from '../icons/WorkflowIcon.svelte';
    import type { Writable } from 'svelte/store';
    export let workflows: Array<string> = undefined;

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');

    const dispatch = createEventDispatcher();
</script>

<div
    class={'grow bg-white w-full mb-2 border-2 rounded-lg overflow-y-scroll' +
        ($onSelectingStep ? ' opacity-40 pointer-events-none' : '')}
    style="scrollbar-width: none"
>
    <div class="flex p-2">
        <span class="font-bold">Workflow</span>
        <div class="grow" />
    </div>
    <div class="p-2">
        {#each workflows as workflow}
            <button
                class="w-full flex px-2 py-1 hover:bg-slate-100 overflow-hidden"
                on:click={() => {
                    dispatch('message', { selectedWorkflow: workflow });
                }}
            >
                <WorkflowIcon />
                <span class="px-1" style="color:#807E7E">{workflow}</span>
            </button>
        {/each}
    </div>
</div>
