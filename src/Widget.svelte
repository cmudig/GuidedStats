<script lang="ts">
    import { setContext } from 'svelte';
    import { WidgetWritable, isBlocked } from './stores';
    import type { Workflow } from './interface/interfaces';
    import WorkflowSelectionPanel from './components/panels/WorkflowSelectionPanel.svelte';
    import ExplanationPanel from './components/panels/ExplanationPanel.svelte';
    import DisplayPanel from './components/panels/DisplayPanel.svelte';
    import Notification from './components/tooltip/Notification.svelte';
    import { writable } from 'svelte/store';

    export let model;

    let height: number;

    const onSelectingStep = writable(false);

    const builtinWorkflows = WidgetWritable<Array<string>>(
        'builtinWorkflows',
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

    const workflowInfo = WidgetWritable<Workflow>(
        'workflowInfo',
        {
            workflowName: '',
            currentStepId: undefined,
            message: '',
            report: '',
            action: undefined,
            presets: [],
            steps: [],
        },
        model
    );

    setContext('onSelectingStep', onSelectingStep);

    setContext('workflowInfo', workflowInfo);


    setContext('builtinAssumptions', builtinAssumptions);

    setContext('builtinTransformations', builtinTransformations);

    setContext('serial', serial);

    function getWorkflow(event) {
        selectedWorkflow.set(event.detail.selectedWorkflow);
    }
</script>

<Notification />
<div
    class={'bg-slate-50 border-4 rounded-xl w-full h-1/2 p-4 flex flex-row' +
        ($isBlocked ? ' blur-sm pointer-events-none' : '')}
    style="height:600px"
>
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
