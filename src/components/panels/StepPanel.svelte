<script lang="ts">
    export let steps: Array<string> = undefined;
</script>

<div class="px-1.5 py-2 border-4">
    {#each steps as step}
        <div class="border-4">{step}</div>
    {/each}
</div>
