<script lang="ts">
    import { setContext } from 'svelte';

    import { WidgetWritable } from './stores';
    import type { Workflow } from './interface/interfaces';
    import WorkflowSelectionPanel from './components/panels/WorkflowSelectionPanel.svelte';
    import StepSelectionPanel from './components/panels/StepSelectionPanel.svelte';

    import { Graph } from './gitgraph';
    import DisplayPanel from './components/panels/DisplayPanel.svelte';

    let el: HTMLDivElement;
    export let model;

    let canvas: HTMLCanvasElement;

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
            workflowName: '',
            currentStepId: undefined,
            steps: [],
            flows: []
        },
        model
    );
    

    setContext('workflowInfo', workflowInfo);

    $: console.log($workflowInfo);
    // writable for array of any type
    const dagdata = WidgetWritable<Array<any>>('dagdata', [], model);

    function check(data) {
        if (data.length > 0) {
            canvas.width = 300;
            canvas.height = 300;

            // let ctx = canvas.getContext('2d');
            // ctx.beginPath();
            // ctx.arc(150, 150, 50, 0, 2 * Math.PI);
            // ctx.fill();
            let graph = new Graph(canvas, data, {
                dotRadius: 10,
                y_step: 40,
                x_step: 40,
                lineWidth: 5
            });
            let test_canvas = graph.graphCanvas.toHTML();
            console.log(test_canvas);
        }
    }

    $: console.log($dagdata);
    $: check($dagdata);

    // $: console.log($workflowInfo);
    // $: console.log($dagdata);
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
    <!-- <div class="w-2/3 h-full float-right" id="graph-container" bind:this={el}>
        Step num: {$workflowInfo?.steps?.length}
        <canvas bind:this={canvas} />
        <Dag />
    </div> -->
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
