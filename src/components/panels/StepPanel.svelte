<script lang="ts">
    import type { Step, Workflow } from '../../interface/interfaces';
    import StepWrapper from '../steps/StepWrapper.svelte';
    import type { Writable } from 'svelte/store';
    export let steps: Array<Step>;

    export let workflowInfo: Writable<Workflow>;
</script>

<div class="w-full grow step-container mt-2">
    {#if steps !== undefined}
        {#each steps as step, idx}
            <StepWrapper {step} stepIndex={idx} />
        {/each}
    {/if}
</div>
