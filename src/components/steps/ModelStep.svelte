<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { Step, Workflow } from "../../interface/interfaces";
    import { getContext } from "svelte";
    import { deepCopy } from "../../utils";

    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let modelName: string = undefined;
    let penaltyTerm: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function updateModelResult(event){
    let info:Workflow = deepCopy($workflowInfo);
    info.steps[stepIndex].config.modelName = modelName;
    info.steps[stepIndex].config.modelParameters = [{"name":"penaltyTerm","value":penaltyTerm}];
    workflowInfo.set(info);
}


</script>

<div>
    <div class="place-content-center flex">
        <div class="w-1/2 flex flex-col p-2 overflow-hidden bg-white border-2">
            <select bind:value={modelName}>
                <option value="simple">Simple Linear Regression</option>
                <option value="ridge">Ridge Regression</option>
                <option value="lasso">Lasso Regression</option>
            </select>
            {#if modelName === "ridge" || modelName === "lasso"}
                Penalty Term: <input type="number" bind:value={penaltyTerm} />
            {/if}
            <div class="grow" />
        </div>
        <!-- toolbar -->
        <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
            <button class="border-2" on:click={updateModelResult}>
                <span class="font-bold">Yes</span>
            </button>
            <div class="grow" />
            <button class="border-2">
                <span class="font-bold">No</span>
            </button>
        </div>
    </div>
</div>