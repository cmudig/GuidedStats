<script lang="ts">
    export let workflows: Array<string> = undefined;
</script>

<div class="px-1.5 py-2 border-4">
    {#each workflows as workflow}
        <div class="border-4">{workflow}</div>
    {/each}
</div>
