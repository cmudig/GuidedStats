<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step } from '../../interface/interfaces';
    import StepWrapper from '../steps/StepWrapper.svelte';

    const workflowInfo = getContext('workflowInfo');

    export let steps: Array<Step>;
</script>

<div class="grow">
{#if steps !== undefined}
{#each steps as step, idx}
<StepWrapper step={step} stepIndex={idx}/>
{/each}
{/if}
</div>
