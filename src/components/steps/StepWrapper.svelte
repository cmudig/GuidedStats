<script lang="ts">
    import _ from 'lodash';
    import { deepCopy } from '../../utils';
    import { selectingStep } from '../../stores';
    import { type Writable } from 'svelte/store';

    import type { Step, Workflow } from '../../interface/interfaces';

    import LoadDatasetStep from './LoadDatasetStep.svelte';
    import VariableSelectionStep from './VariableSelectionStep.svelte';
    import AssumptionCheckingStep from './AssumptionCheckingStep.svelte';
    import TrainTestSplitStep from './TrainTestSplitStep.svelte';
    import ModelStep from './ModelStep.svelte';
    import EvaluationStep from './EvaluationStep.svelte';
    import DataTransformationStep from './DataTransformationStep.svelte';

    import { getContext } from 'svelte';

    export let step: Step;
    export let stepIndex: number;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function unfold(newIsShown: boolean, stepIndex: number) {
        let updatedInfo = deepCopy($workflowInfo);
        updatedInfo.steps[stepIndex].isShown = newIsShown;
        if (newIsShown) {
            selectingStep.set(stepIndex);
        }
        workflowInfo.set(updatedInfo); // Update with the new object
    }
</script>

{#if !_.isUndefined(step)}
    <div class="flex px-2 w-full">
        <div
            class="grow px-2 pb-2 border-l-4"
            style="border-left-color:{step.done
                ? '#1d346e'
                : step.isProceeding
                ? '#05a3da'
                : '#c3cece'}"
        >
            <!-- Card -->
            <!-- if step.isProceeding is False then the div is disabled-->
            <div
                class="px-2 flex hover:bg-slate-100 {step.isProceeding ||
                step.done
                    ? ''
                    : ' opacity-20 pointer-events-none'}"
            >
                <button on:click={() => unfold(!step.isShown, step.stepId)}>
                    <span class="inline-block align-top font-bold"
                        >Step {stepIndex + 1}: {step.stepName}</span
                    ></button
                >
                <div class="grow" />
            </div>
            <!-- The panel -->
            <div class="grow{step.isShown ? '' : ' hidden h-0'}">
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
