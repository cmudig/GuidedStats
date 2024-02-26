<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import StepPanel from './StepPanel.svelte';
    import type { Writable } from 'svelte/store';
    export let steps: Array<Step>;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');
</script>

<div
    class={'bg-white h-full w-full border-2 border-l-8 border-l-rose-500 overflow-y-scroll rounded-xl flex p-2' +
        ($onSelectingStep ? ' opacity-40 pointer-events-none' : '')}
    style="scrollbar-width: none"
>
    {#if $workflowInfo.steps?.length > 0}
        <StepPanel {steps} />
    {:else}
        <div class="flex flex-col items-center justify-center w-full h-full">
            <div class="text-rose-500 text-xl font-bold">
                Click on a workflow on upper left side to start the analysis
            </div>
        </div>
    {/if}
</div>
