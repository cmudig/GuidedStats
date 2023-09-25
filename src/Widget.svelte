<script lang="ts">
    import { setContext } from 'svelte';
    import { WidgetWritable, newStepPos, newStepType } from './stores';
    import type { Workflow, selectedStepInfo } from './interface/interfaces';
    import WorkflowSelectionPanel from './components/panels/WorkflowSelectionPanel.svelte';
    import StepSelectionPanel from './components/panels/StepSelectionPanel.svelte';
    import DisplayPanel from './components/panels/DisplayPanel.svelte';

    export let model;


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

    const selectedWorkflow = WidgetWritable<string>(
        'selectedWorkflow',
        '',
        model
    );

    const selectedStepInfo = WidgetWritable<selectedStepInfo>(
        'selectedStepInfo',
        {
            stepType: undefined,
            stepPos: undefined,
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
    

    setContext('workflowInfo', workflowInfo);

    function addNewStep(stepType: string, stepPos: number){
        if($builtinSteps.includes(stepType) && stepPos >= 0){
            let pos: number;
            if(stepPos == $workflowInfo.steps.length - 1){
                pos = -1;
            } else {
                pos = stepPos + 1;
            }
            selectedStepInfo.set({
            stepType: stepType,
            stepPos: pos,
        });
        newStepType.set("");
        newStepPos.set(-1);
        };
    };

    $: addNewStep($newStepType, $newStepPos);


    function getWorkflow(event) {
        selectedWorkflow.set(event.detail.selectedWorkflow);
    }

</script>

<div class="bg-slate-50 rounded-xl w-full h-1/2 outlayer p-4 flex flex-row">
    <div class="w-1/4 h-full mr-2 float-left flex flex-col">
        <WorkflowSelectionPanel
            workflows={$builtinWorkflows}
            on:message={getWorkflow}
        />
        <div class="grow" />
        <StepSelectionPanel steps={$builtinSteps} />
    </div>
    <div class="w-3/5 h-full ml-2 float-left grow">
        <DisplayPanel steps={$workflowInfo.steps} />
    </div>
</div>

<style global lang="postcss">
    /* TAILWIND stuff */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    .outlayer {
        height: 400px;
    }

    #graph-container {
        max-width: 60%;
    }
</style>
