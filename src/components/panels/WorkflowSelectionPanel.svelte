<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { onSelectingStep } from '../../stores';

    import DefineIcon from '../icons/DefineIcon.svelte';
    import WorkflowIcon from '../icons/WorkflowIcon.svelte';
    export let workflows: Array<string> = undefined;

    const dispatch = createEventDispatcher();

</script>

<div class={"pnl grow bg-white w-full mb-2 border-2 rounded-lg" + (($onSelectingStep)? " disabled-div": "")}>
    <div class="flex p-2">
        <span class="font-bold">Workflow</span>
        <div class="grow" />
        <!-- <DefineIcon /> -->
    </div>
    <div class="p-2">
        {#each workflows as workflow}
            <button
                class="w-full flex px-2 py-1 hover:bg-slate-100 overflow-hidden"
                on:click={() => {
                    dispatch('message', { selectedWorkflow: workflow });
                }}>
                <WorkflowIcon width="1.5em" height="1.5em" />
                <span class="px-1" style="color:#807E7E">{workflow}</span>
                </button
            >
        {/each}
    </div>
</div>

<style>
    .pnl {
        min-height: 45%;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .pnl::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    .disabled-div {
        pointer-events: none;
        opacity: 0.4;
    }
</style>
