<script lang="ts">
    import {selectedWorkflow} from "../../stores";
    export let workflows: Array<string> = undefined;
</script>

<div class="px-1.5 py-2 border-4">
    {#each workflows as workflow}
        <button class="border-4" on:click={() => {$selectedWorkflow = workflow}}>{workflow}</button>
    {/each}
</div>
