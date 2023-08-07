<script lang="ts">
    import { WidgetWritable } from './stores';
    import WorkflowPanel from './components/panels/WorkflowPanel.svelte';
    import StepPanel from './components/panels/StepPanel.svelte';
    export let model;

    const builtinWorkflows = WidgetWritable<Array<string>>(
        'builtinWorkflows',
        [],
        model
    );
    const builtinSteps = model.get('builtinSteps');
</script>

<div class="bg-slate-50 border-4 rounded-xl w-full outlayer">
    <div class="w-1/4">
        <WorkflowPanel workflows={$builtinWorkflows} />
        <StepPanel steps={builtinSteps} />
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
