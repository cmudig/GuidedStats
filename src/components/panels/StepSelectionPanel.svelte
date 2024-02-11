<script lang="ts">
    export let steps: Array<string> = undefined;
    import StepIcon from '../icons/StepIcon.svelte';
    import CancelIcon from '../icons/CancelIcon.svelte';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';

    const onSelectingStep: Writable<boolean> = getContext('onSelectingStep');
    const newStepType: Writable<string> = getContext('newStepType');

    function cancelAddStep() {
        onSelectingStep.set(false);
    }
</script>

<div
    class={'grow bg-white w-full mt-2 border-2 rounded-lg overflow-y-scroll' +
        ($onSelectingStep ? ' ring-4' : '')}
    style="scrollbar-width: none"
>
    <div class="flex p-2">
        <span class="font-bold">Step</span>
        <div class="grow" />
        {#if $onSelectingStep}
            <button on:click={cancelAddStep}
                ><Tooltip title="Cancel"><CancelIcon /></Tooltip></button
            >
        {/if}
    </div>
    <div class="p-2">
        {#each steps as step}
            <button
                class="w-full flex px-2 py-1 hover:bg-slate-100 overflow-hidden"
                on:click={() => {
                    newStepType.set(step);
                    onSelectingStep.set(false);
                }}
            >
                <StepIcon />
                <span class="px-1" style="color:#807E7E">{step}</span>
            </button>
        {/each}
    </div>
</div>
