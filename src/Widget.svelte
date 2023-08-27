<script lang="ts">
    import { WidgetWritable } from './stores';
    import type { Workflow } from './interface/interfaces';
    import WorkflowPanel from './components/panels/WorkflowPanel.svelte';
    import StepPanel from './components/panels/StepPanel.svelte';
    import Dag from './Dag.svelte';
    import { TemplateName, createGitgraph, templateExtend } from '@gitgraph/js';
    import { onMount } from 'svelte';

    let el: HTMLDivElement;
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

    const workflowInfo = WidgetWritable<Workflow>(
        'workflowInfo',
        {
            workflowName: "",
            currentStepId: undefined,
            steps: [],
            flows: []
        },
        model
    );

    // function createWorkflow(workflowInfo: Workflow) {
    //     // Get the graph container HTML element.
    //     const graphContainer = el;
    //     // Instantiate the graph.
    //     const gitgraph = createGitgraph(graphContainer, {
    //         responsive: true,
    //         template: templateExtend(TemplateName.Metro, {
    //             commit: {
    //                 message: {
    //                     displayAuthor: false
    //                 }
    //             }
    //         })
    //     });

    //     $: console.log($workflowInfo);

    //     // Simulate git commands with Gitgraph API.
    //     const master = gitgraph.branch('master');
    //     master.commit('Initial commit');

    //     const develop = gitgraph.branch('develop');
    //     develop.commit('Add TypeScript');

    //     const aFeature = gitgraph.branch('a-feature');
    //     aFeature
    //         .commit('Make it work')
    //         .commit('Make it right')
    //         .commit('Make it fast');

    //     develop.merge(aFeature);
    //     develop.commit('Prepare v1');

    //     master.merge(develop).tag('v1.0.0');
    // }

    // onMount(() => {
    //     // Get the graph container HTML element.
    //     const graphContainer = el;
    //     // Instantiate the graph.
    //     const gitgraph = createGitgraph(graphContainer, {
    //         responsive: true,
    //         template: templateExtend(TemplateName.Metro, {
    //             commit: {
    //                 message: {
    //                     displayAuthor: false
    //                 }
    //             }
    //         })
    //     });

    //     $: console.log($workflowInfo);

    //     // Simulate git commands with Gitgraph API.
    //     const master = gitgraph.branch('master');
    //     master.commit('Initial commit');

    //     const develop = gitgraph.branch('develop');
    //     develop.commit('Add TypeScript');

    //     const aFeature = gitgraph.branch('a-feature');
    //     aFeature
    //         .commit('Make it work')
    //         .commit('Make it right')
    //         .commit('Make it fast');

    //     develop.merge(aFeature);
    //     develop.commit('Prepare v1');

    //     master.merge(develop).tag('v1.0.0');
    // });

    function getWorkflow(event) {
        selectedWorkflow.set(event.detail.selectedWorkflow);
    }
</script>

<div class="bg-slate-50 border-4 rounded-xl w-full outlayer">
    <div class="w-2/5 h-full float-left">
        <WorkflowPanel workflows={$builtinWorkflows} on:message={getWorkflow} />
        <StepPanel steps={$builtinSteps} />
    </div>
    <div class="w-3/5 float-right" id="graph-container" bind:this={el}>
        Step num: {$workflowInfo?.steps?.length}
        <!-- <Dag /> -->
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

    #graph-container {
        max-width: 60%;
    }
</style>
