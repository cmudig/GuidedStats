<script lang="ts">
    import { WidgetWritable } from './stores';
    import WorkflowPanel from './components/panels/WorkflowPanel.svelte';
    import StepPanel from './components/panels/StepPanel.svelte';
    import Dag from './Dag.svelte';

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
</script>

<div class="bg-slate-50 border-4 rounded-xl w-full outlayer">
    <div class="w-2/5 h-full float-left">
        <WorkflowPanel workflows={$builtinWorkflows} />
        <StepPanel steps={$builtinSteps} />
    </div>
    <div class="w-3/5 float-right">
        <Dag></Dag>
    </div>

</div>

<style global lang="postcss">
    /* TAILWIND stuff */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    .outlayer {
        height: 600px;
    }
</style>
