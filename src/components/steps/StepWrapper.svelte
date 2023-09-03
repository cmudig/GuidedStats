<script lang="ts">
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';

    import LoadDatasetStep from './LoadDatasetStep.svelte';
    import type { Step, Workflow } from '../../interface/interfaces';

    export let step: Step;
    export let stepIndex: number;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    let stepHeight: number = 40;

    let cardHeight: number = 40;

    let isShown: boolean = false;



    function unfold() {
        isShown = !isShown;
        cardHeight = isShown ? 5 * stepHeight : stepHeight;
        let info = $workflowInfo;
        info.steps[stepIndex].isShown = isShown;
        workflowInfo.set(info);
    }
</script>

<div
    class={'card hover:bg-slate-100' + (isShown ? ' bg-slate-200' : '')}
    style="height:{cardHeight}px"
>
    <button on:click={() => unfold()}
        ><span class="inline-block align-middle font-bold"
            >Step {stepIndex + 1} {step.stepName}</span
        ></button
    >
    {#if isShown}
        <div style="grow bg-slate-200">
            {#if step.stepType === 'LoadDatasetStep'}
                <LoadDatasetStep {step} />
            {/if}
        </div>
    {/if}
</div>

<style>
    .card {
        padding: 10px 0px 10px 0px;
    }
</style>
