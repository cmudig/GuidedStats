<script lang="ts">
    // import { selectedWorkflow } from '../../stores';
    import { createEventDispatcher } from 'svelte';
    import DefineIcon from '../icons/DefineIcon.svelte';
    import WorkflowIcon from '../icons/WorkflowIcon.svelte';
    export let workflows: Array<string> = undefined;

    const dispatch = createEventDispatcher();
</script>

<div class="pnl grow bg-white w-full mb-2 border-2 rounded-lg">
    <div class="flex ">
        <span class="font-bold text-2xl">Workflow</span>
        <div class="grow" />
        <DefineIcon />
    </div>
    <div>
        {#each workflows as workflow}
            <button
                class="w-full flex px-2 hover:bg-slate-100"
                on:click={() => {
                    dispatch('message', { selectedWorkflow: workflow });
                }}>
                <WorkflowIcon width="1.5em" height="1.5em" />
                <span style="color:#807E7E">{workflow}</span>
                </button
            >
        {/each}
    </div>
</div>

<style>
    .pnl {
        min-height: 45%;
        box-shadow: 6px 6px 12px -3px rgba(0, 0, 0, 0.6);
    }
</style>
