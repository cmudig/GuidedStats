<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step } from '../../interface/interfaces';
    import StepPanel from './StepPanel.svelte';
    import Dag from '../viz/Dag.svelte';
    export let steps: Array<Step>;
    let height: number;

    const workflowInfo = getContext('workflowInfo');
</script>

<div 
class="pnl bg-white h-full w-full border-l-8 rounded-xl flex"
bind:clientHeight={height}>
<Dag steps={steps} />
<StepPanel steps={steps}/>
</div>

<style>
    .pnl{
        box-shadow: 6px 6px 12px -3px rgba(0, 0, 0, 0.6);
        border-left-width: 8px;
        border-color: #D86465;
        height: 100%;
        }
</style>