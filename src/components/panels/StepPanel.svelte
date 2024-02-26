<script lang="ts">
    import type { Step } from '../../interface/interfaces';
    import StepWrapper from '../steps/StepWrapper.svelte';
    export let steps: Array<Step>;
</script>

<div class="w-full grow step-container my-2">
    {#if steps !== undefined}
        {#each steps as step, idx}
            <StepWrapper {step} stepIndex={idx} />
        {/each}
    {/if}
</div>
