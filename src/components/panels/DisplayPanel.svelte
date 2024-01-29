<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import StepPanel from './StepPanel.svelte';
    import Dag from '../viz/Dag.svelte';
    import type { Writable } from 'svelte/store';
    export let steps: Array<Step>;
    let height: number;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');
</script>

<div
    class={'pnl bg-white h-full w-full border-2 border-l-8 rounded-xl flex p-2' +
        ($onSelectingStep ? ' disabled-div' : '')}
    bind:clientHeight={height}
>
    <Dag {steps} />
    <StepPanel {workflowInfo} {steps} />
</div>

<style>
    .pnl {
        border-left-color: #d86465;
        height: 100%;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .pnl::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    .disabled-div {
        pointer-events: none;
        opacity: 0.4;
    }
</style>
