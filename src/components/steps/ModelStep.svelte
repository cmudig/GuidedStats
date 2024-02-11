<script lang="ts">
    import _ from 'lodash';
    import type { Writable } from 'svelte/store';
    import type { Parameter, Step, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import { deepCopy } from '../../utils';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import Done from '../icons/Done.svelte';
    import SelectionBoard from '../display/SelectionBoard.svelte';

    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let modelName: string = undefined;
    let parameterValues: Parameter[] = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    $: if (!_.isUndefined(modelName)) {
        const foundParameters = step.config.modelCandidates.find(
            x => x.name == modelName
        )?.parameters;
        parameterValues = foundParameters;
    }

    function handleInputChange(parameterName: string, value: any) {
        let parameter = parameterValues?.find(
            parameter => parameter.name == parameterName
        );
        if (!_.isUndefined(parameter)) {
            parameter.value = value;
        }
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].config.modelParameters = parameterValues;
        workflowInfo.set(info);
    }

    function updateModelName(event) {
        modelName = event.target.value;
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].config.modelName = modelName;
        workflowInfo.set(info);
    }

    function execute(event) {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].toExecute = true;
        workflowInfo.set(info);
    }
</script>

<div class="flex flex-col h-full">
    <div class="card place-content-center flex">
        <div class="w-3/4 flex flex-col p-4 overflow-scroll bg-white border-2">
            <div class="flex">
                <span class="p-2">Model: </span>
                <div class="grow" />
                <select
                    class="m-2"
                    bind:value={modelName}
                    on:change={updateModelName}
                >
                    <option disabled selected value> -- option -- </option>
                    {#each step.config.modelCandidates as modelCandidate}
                        <option value={modelCandidate?.name}
                            >{modelCandidate?.name}</option
                        >
                    {/each}
                </select>
            </div>
            <SelectionBoard parameters={parameterValues} {handleInputChange} />
            <div class="grow" />
        </div>
    </div>
    <div class="grow" />
    <div class="flex">
        <div class="grow" />
        <Tooltip title="Execute">
            <button on:click={execute}><Done /></button>
        </Tooltip>
    </div>
</div>

<style>
    .card {
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .card span {
        color: #333; /* Consistent text color */
        padding: 10px;
    }
    .card select {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px 10px;
        background-color: white;
    }
    .card select:focus {
        border-color: #007bff;
        outline: none;
    }
    .card::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>
