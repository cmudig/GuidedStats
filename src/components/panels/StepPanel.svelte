<script lang="ts">
    export let steps: Array<string> = undefined;
    import {selectedStep} from "../../stores";

</script>

<div class="px-1.5 py-2 border-4">
    {#each steps as step}
        <button class="border-4" on:click={() => {$selectedStep = step}}>{step}</button>
    {/each}
</div>
