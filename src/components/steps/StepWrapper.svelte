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
    import { afterUpdate, getContext } from 'svelte';
    import WordWithHint from '../tooltip/WordWithHint.svelte';
    import DotLine from '../viz/DotLine.svelte';

    export let step: Step;
    export let stepIndex: number;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');

    const newStepPos: Writable<number> = getContext('newStepPos');

    let buttonHeight: number;
    let cardHeight: number;
    let height: number;

    let isLast: boolean = $workflowInfo.steps.length - 1 === stepIndex;

    function unfold(newIsShown: boolean) {
        let updatedInfo = deepCopy($workflowInfo);
        updatedInfo.steps[stepIndex].isShown = newIsShown;
        workflowInfo.set(updatedInfo); // Update with the new object
    }

    function addStep() {
        onSelectingStep.set(true);
        newStepPos.set(stepIndex);
    }

    function updateHeight(node: HTMLElement) {
        afterUpdate(() => {
            cardHeight = node.clientHeight;
            height = buttonHeight + cardHeight + 16; // 16 is the padding
        });
    }
</script>

{#if !_.isUndefined(step)}
    <div class="flex px-2 w-full">
        <DotLine {step} {height} {isLast} />
        <div class="grow px-2 pb-2">
            <!-- Card -->
            <!-- if step.isProceeding is False then the div is disabled-->
            <div
                class="px-2 flex hover:bg-slate-100 {step.isProceeding ||
                step.done
                    ? ''
                    : ' opacity-20 pointer-events-none'}"
                bind:clientHeight={buttonHeight}
            >
                <button on:click={() => unfold(!step.isShown)}>
                    <span class="inline-block align-top font-bold"
                        >Step {stepIndex + 1}: {step.stepName}</span
                    ></button
                >
                <div class="grow" />
                <button on:click={addStep}>
                    <Tooltip title="Add Step Below"><AddIcon /></Tooltip>
                </button>
            </div>
            <!-- The panel -->
            <div
                class="grow{step.isShown ? '' : ' hidden h-0'}"
                bind:clientHeight={cardHeight}
                use:updateHeight
            >
                {#if step.done || step.isProceeding}
                    <div class="p-2">
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
        </div>
    </div>
{/if}
