<script lang="ts">
    import CollapseIcon from '../icons/CollapseIcon.svelte';
    import ExpandIcon from '../icons/ExpandIcon.svelte';
    export let active = false;
</script>

<button
    class="w-full my-2 hover:border-gray-300 text-white font-bold rounded"
    on:click={() => {
        active = !active;
    }}
>
    <div class="flex">
        <h7 class="text-blue-700">Export Options</h7>
        <div class="grow" />
        {#if active}
            <CollapseIcon width="1.2em" height="1.2em" />
        {:else}
            <ExpandIcon width="1.2em" height="1.3em" />
        {/if}
    </div>
</button>
{#if active}
    <p>
        Here are the available commands for exporting various elements of your
        analysis:
    </p>
    <ul class="list-disc list-inside">
        <li>
            <strong>Regression Table</strong> (LaTeX format):
            <code class="bg-gray-200 text-sm p-1 rounded"
                >obj.export("table", format="latex")</code
            >
        </li>
        <li>
            <strong>Analysis Report</strong> on the coefficients:
            <code class="bg-gray-200 text-sm p-1 rounded"
                >exported_report = obj.export("report")</code
            >
        </li>
        <li>
            <strong>Model Export</strong>:
            <code class="bg-gray-200 text-sm p-1 rounded"
                >exported_model = obj.export("model")</code
            >
        </li>
        <li>
            <strong>Dataset Export</strong>, if transformations were applied:
            <code class="bg-gray-200 text-sm p-1 rounded"
                >exported_dataset = obj.export("dataset")</code
            >
        </li>
    </ul>
    <p class="italic">
        Note: Replace <code class="bg-gray-200 text-sm p-1 rounded">obj</code> with
        the name of the instance you've created for your analysis.
    </p>
{/if}
