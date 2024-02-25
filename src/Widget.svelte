<script lang="ts">
    import { setContext } from 'svelte';
    import { WidgetWritable } from './stores';
    import type { Workflow, selectedStepInfo } from './interface/interfaces';
    import WorkflowSelectionPanel from './components/panels/WorkflowSelectionPanel.svelte';
    import ExplanationPanel from './components/panels/ExplanationPanel.svelte';
    import DisplayPanel from './components/panels/DisplayPanel.svelte';
    import { writable } from 'svelte/store';

    export let model;

    let height: number;

    const onSelectingStep = writable(false);
    const newStepPos = writable(-1);
    const newStepType = writable('');
    const exportingItem = writable('');

    const exportTableStepIdx = WidgetWritable<number>(
        'exportTableStepIdx',
        -1,
        model
    );

    const exportVizStepIdx = WidgetWritable<number>(
        'exportVizStepIdx',
        -1,
        model
    );

    const exportVizIdx = WidgetWritable<number>('exportVizIdx', -1, model);

    const builtinWorkflows = WidgetWritable<Array<string>>(
        'builtinWorkflows',
        [],
        model
    );

    const builtinSteps = WidgetWritable<Array<string>>(
        'builtinSteps',
        [],
        model
    );

    const builtinAssumptions = WidgetWritable<Array<string>>(
        'builtinAssumptions',
        [],
        model
    );

    const builtinTransformations = WidgetWritable<Array<string>>(
        'builtinTransformations',
        [],
        model
    );

    const serial = WidgetWritable<string>('serial', '', model);

    const selectedWorkflow = WidgetWritable<string>(
        'selectedWorkflow',
        '',
        model
    );

    const selectedStepInfo = WidgetWritable<selectedStepInfo>(
        'selectedStepInfo',
        {
            stepType: undefined,
            stepPos: undefined
        },
        model
    );

    const workflowInfo = WidgetWritable<Workflow>(
        'workflowInfo',
        {
            workflowName: '',
            currentStepId: undefined,
            steps: [],
            flows: []
        },
        model
    );

    setContext('onSelectingStep', onSelectingStep);
    setContext('newStepPos', newStepPos);
    setContext('newStepType', newStepType);
    setContext('exportingItem', exportingItem);

    setContext('workflowInfo', workflowInfo);

    setContext('exportTableStepIdx', exportTableStepIdx);

    setContext('exportVizStepIdx', exportVizStepIdx);

    setContext('exportVizIdx', exportVizIdx);

    setContext('builtinAssumptions', builtinAssumptions);

    setContext('builtinTransformations', builtinTransformations);

    setContext('serial', serial);

    function addNewStep(stepType: string, stepPos: number) {
        if ($builtinSteps.includes(stepType) && stepPos >= 0) {
            let pos: number;
            if (stepPos == $workflowInfo.steps.length - 1) {
                pos = -1;
            } else {
                pos = stepPos + 1;
            }
            selectedStepInfo.set({
                stepType: stepType,
                stepPos: pos
            });
            newStepType.set('');
            newStepPos.set(-1);
        }
    }

    $: addNewStep($newStepType, $newStepPos);

    function getWorkflow(event) {
        selectedWorkflow.set(event.detail.selectedWorkflow);
    }
</script>

<div class="bg-slate-50 rounded-xl w-full h-1/2 p-4 flex flex-row"
    style="height:600px">
    <div
        bind:clientHeight={height}
        class="w-1/3 h-full mr-2 float-left flex flex-col"
    >
        <WorkflowSelectionPanel
            workflows={$builtinWorkflows}
            on:message={getWorkflow}
        />
        <ExplanationPanel steps={$workflowInfo.steps} />
    </div>
    <div class="w-1/2 h-full ml-2 float-left grow" style="height:{height}px">
        <DisplayPanel steps={$workflowInfo.steps} />
    </div>
</div>

<style global lang="postcss">
    /* TAILWIND stuff */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>
