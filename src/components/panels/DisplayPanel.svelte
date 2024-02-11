<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import StepPanel from './StepPanel.svelte';
    import type { Writable } from 'svelte/store';
    export let steps: Array<Step>;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');
</script>

<div
    class={'bg-white h-full w-full border-2 border-l-8 border-l-rose-500 overflow-y-scroll rounded-xl flex p-2' +
        ($onSelectingStep ? ' opacity-40 pointer-events-none' : '')}
    style="scrollbar-width: none"
>
    <StepPanel {workflowInfo} {steps} />
</div>
