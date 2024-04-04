<script lang="ts">
    import _ from 'lodash';
    import type { Writable } from 'svelte/store';
    import type { Parameter, Step, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import { deepCopy } from '../../utils';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import Done from '../icons/Done.svelte';
    import Alert from '../icons/Alert.svelte';
    import SelectionBoard from '../display/SelectionBoard.svelte';

    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let modelName: string = undefined;
    let parameterValues: Parameter[] = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    step.config.modelCandidates.filter(x => x?.isDefault)?.length > 0
        ? (modelName = step.config.modelCandidates.filter(x => x?.isDefault)[0]
              .name)
        : (modelName = undefined);

    function handleInputChange(parameterName: string, value: any) {
        if (!_.isUndefined(parameterName) && !_.isUndefined(value)) {
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
    }

    function updateModelName(modelName: string) {
        if (!_.isUndefined(modelName)) {
            const foundParameters = step.config.modelCandidates.find(
                x => x.name == modelName
            )?.parameters;
            parameterValues = foundParameters;

            let info: Workflow = deepCopy($workflowInfo);
            info.steps[stepIndex].config.modelName = modelName;
            workflowInfo.set(info);
        }
    }

    function execute(event) {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].toExecute = true;
        workflowInfo.set(info);
    }

    let active = true;

    $: updateModelName(modelName);
</script>

<div class="flex flex-col h-full">
    <div
        class="overflow-y-scroll place-content-center flex"
        style="scrollbar-width: none"
    >
        <div class="w-3/4 flex flex-col p-4 bg-white border-2">
            <div class="flex mb-2">
                <span class="p-1">Model: </span>
                <div class="grow" />
                <select
                    class="rounded appearance-auto py-1 px-2 bg-white border-solid border border-gray-300 focus:border-blue-500"
                    bind:value={modelName}
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
        <div class="grow flex">
            {#if !_.isUndefined(step?.message) && step.message.length > 0}
                <button
                    on:click={() => {
                        active = !active;
                    }}><Alert /></button
                >
                {#if active}
                    <span class="px-2">{step.message}</span>
                {/if}
            {/if}
        </div>
        <Tooltip title="Execute">
            <button on:click={execute}><Done /></button>
        </Tooltip>
    </div>
</div>
