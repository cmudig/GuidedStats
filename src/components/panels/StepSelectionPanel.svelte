<script lang="ts">
    export let steps: Array<string> = undefined;
    import {selectedStep} from "../../stores";

</script>

<div class="pnl grow bg-white w-full mt-2 border-2 rounded-lg">
    {#each steps as step}
        <button class="border-4" on:click={() => {$selectedStep = step}}>{step}</button>
    {/each}
</div>

<style>
    .pnl{
        min-height: 45%;
        box-shadow: 6px 6px 12px -3px rgba(0, 0, 0, 0.6);
    }
</style>