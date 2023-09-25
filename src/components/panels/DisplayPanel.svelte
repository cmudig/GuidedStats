<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import StepPanel from './StepPanel.svelte';
    import Dag from '../viz/Dag.svelte';
    import type { Writable } from 'svelte/store';
    import { onSelectingStep } from '../../stores';
    export let steps: Array<Step>;
    let height: number;

    const workflowInfo:Writable<Workflow> = getContext('workflowInfo');
</script>

<div 
class={"pnl bg-white h-full w-full border-l-8 rounded-xl flex p-2" + (($onSelectingStep)? " opacity-40": "") }
bind:clientHeight={height}>
<Dag steps={steps} />
<StepPanel workflowInfo={workflowInfo} steps={steps}/>
</div>

<style>
    .pnl{
        box-shadow: 6px 6px 12px -3px rgba(0, 0, 0, 0.6);
        border-left-width: 8px;
        border-color: #D86465;
        height: 100%;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
        }

    .pnl::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>