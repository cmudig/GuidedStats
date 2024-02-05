<script lang="ts">
    import _ from 'lodash';
    import { deepCopy } from '../../utils';
    import type { Writable } from 'svelte/store';

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
    import { getContext } from 'svelte';
    import WordWithHint from '../tooltip/WordWithHint.svelte';

    export let step: Step;
    export let stepIndex: number;

    // const workflowInfo: Writable<Workflow> = getContext('workflowInfo');
    export let workflowInfo: Writable<Workflow>;

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');

    const newStepPos: Writable<number> = getContext('newStepPos');

    let stepHeight: number = 40;

    let cardHeight: number = 40;

    let buttonHeight: number = 20;

    let isShown: boolean = false;

    function unfold() {
        isShown = !isShown;
        cardHeight = isShown ? 5 * stepHeight : stepHeight;
        let updatedInfo = deepCopy($workflowInfo);

        updatedInfo.steps[stepIndex].isShown = isShown;
        workflowInfo.set(updatedInfo); // Update with the new object
    }

    function addStep() {
        onSelectingStep.set(true);
        newStepPos.set(stepIndex);
    }
</script>

{#if !_.isUndefined(step)}
    <div class="flex-row" style="height:{cardHeight}px">
        <!-- Card -->
        <!-- if step.isProceeding is False then the div is disabled-->
        <div
            class="px-2 flex hover:bg-slate-100 {step.isProceeding || step.done
                ? ''
                : 'not-proceeding'}"
            style="height:{buttonHeight}px"
        >
            <button on:click={() => unfold()}>
                <span class="inline-block align-top font-bold"
                    >Step {stepIndex + 1}: {step.stepName}</span
                ></button
            >
            <WordWithHint explanation={step?.stepExplanation} />
            <div class="grow" />
            <button on:click={addStep}>
                <Tooltip title="Add Step Below"><AddIcon /></Tooltip>
            </button>
        </div>
        <!-- The panel -->
        {#if step.done || step.isProceeding}
            <div
                class="grow {isShown ? '' : ' hidden'}"
                style="height:{cardHeight - buttonHeight}px"
            >
                <div class="px-6 py-2">
                    {#if step.stepType === 'LoadDatasetStep'}
                        <LoadDatasetStep {step} {stepIndex} />
                    {/if}
                    {#if step.stepType === 'VariableSelectionStep'}
                        <VariableSelectionStep
                            {step}
                            {stepIndex}
                            height={cardHeight - buttonHeight}
                        />
                    {/if}
                    {#if step.stepType === 'AssumptionCheckingStep'}
                        <AssumptionCheckingStep
                            {step}
                            {stepIndex}
                            height={cardHeight - buttonHeight}
                        />
                    {/if}
                    {#if step.stepType === 'TrainTestSplitStep'}
                        <TrainTestSplitStep
                            {step}
                            {stepIndex}
                            height={cardHeight - buttonHeight}
                        />
                    {/if}
                    {#if step.stepType === 'ModelStep'}
                        <ModelStep
                            {step}
                            {stepIndex}
                            height={cardHeight - buttonHeight}
                        />
                    {/if}
                    {#if step.stepType === 'EvaluationStep'}
                        <EvaluationStep
                            {step}
                            {stepIndex}
                            height={cardHeight - buttonHeight}
                        />
                    {/if}
                    {#if step.stepType === 'DataTransformationStep'}
                        <DataTransformationStep
                            {step}
                            {stepIndex}
                            height={cardHeight - buttonHeight}
                        />
                    {/if}
                </div>
            </div>
        {/if}
    </div>
{/if}

<style>
    .not-proceeding {
        opacity: 0.2;
        pointer-events: none;
    }
</style>
