<script lang="ts">
    // import { selectedWorkflow } from '../../stores';
    import { createEventDispatcher } from 'svelte';
    export let workflows: Array<string> = undefined;

    const dispatch = createEventDispatcher();

    
</script>

<div class="h-1/2 px-1.5 py-2 border-4">
    {#each workflows as workflow}
        <!-- svelte-ignore missing-declaration -->
        <button
            class="border-4"
            on:click={() => {dispatch("message", {selectedWorkflow: workflow})}}
            >{workflow}</button
        >
    {/each}
</div>
