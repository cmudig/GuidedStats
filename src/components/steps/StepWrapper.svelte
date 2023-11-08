<script lang="ts">
    import _ from 'lodash';
    import { deepCopy } from '../../utils';
    import type { Writable } from 'svelte/store';
    import { newStepPos, onSelectingStep } from '../../stores';

    import type { Step, Workflow } from '../../interface/interfaces';

    import LoadDatasetStep from './LoadDatasetStep.svelte';
    import VariableSelectionStep from './VariableSelectionStep.svelte';
    import AssumptionCheckingStep from './AssumptionCheckingStep.svelte';
    import TrainTestSplitStep from './TrainTestSplitStep.svelte';
    import ModelStep from './ModelStep.svelte';
    import EvaluationStep from './EvaluationStep.svelte';
    import DataTransformationStep from './DataTransformationStep.svelte';

    import AddIcon from '../icons/AddIcon.svelte';
    import Tooltip from '../tooltip/Tooltip.svelte';

    export let step: Step;
    export let stepIndex: number;

    // const workflowInfo: Writable<Workflow> = getContext('workflowInfo');
    export let workflowInfo: Writable<Workflow>;

    let stepHeight: number = 40;

    let cardHeight: number = 40;

    let isShown: boolean = false;

    function unfold() {
        isShown = !isShown;
        cardHeight = isShown ? 5 * stepHeight : stepHeight;
        let updatedInfo = deepCopy($workflowInfo);

        updatedInfo.steps[stepIndex].isShown = isShown;
        workflowInfo.set(updatedInfo); // Update with the new object
    }

    function addStep(){
        onSelectingStep.set(true);
        newStepPos.set(stepIndex);
    }
</script>


{#if !_.isUndefined(step)}
    <div
        class='card p-2.5 flex-row'
        style="height:{cardHeight}px"
    >
    <!-- Card -->
    <div class="flex hover:bg-slate-100">
        <button on:click={() => unfold()}>
        <span class="inline-block align-middle font-bold"
            >Step {stepIndex + 1} {step.stepName}</span
        ></button>
        <div class="grow"></div>
        <button on:click={addStep}>
            <Tooltip title="Add Step Below"><AddIcon /></Tooltip>
        </button>
    </div>
    <!-- The panel -->      
        {#if isShown}
            <div style="grow">
                {#if step.stepType === 'LoadDatasetStep'}
                    <LoadDatasetStep {step} {stepIndex} />
                {/if}
                {#if step.stepType === 'VariableSelectionStep'}
                    <VariableSelectionStep {step} {stepIndex} />
                {/if}
                {#if step.stepType === 'AssumptionCheckingStep'}
                    <AssumptionCheckingStep {step} {stepIndex} />
                {/if}
                {#if step.stepType === 'TrainTestSplitStep'}
                    <TrainTestSplitStep {step} {stepIndex} />
                {/if}
                {#if step.stepType === 'ModelStep'}
                    <ModelStep {step} {stepIndex} />
                {/if}
                {#if step.stepType === 'EvaluationStep'}
                    <EvaluationStep {step} {stepIndex} />
                {/if}
                {#if step.stepType === 'DataTransformationStep'}
                    <DataTransformationStep {step} {stepIndex} />
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
    .card {
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
        }

    .card::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>
