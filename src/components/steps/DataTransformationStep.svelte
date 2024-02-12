<script lang="ts">
    import _ from 'lodash';
    import type { Step, Workflow, Parameter } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    import { deepCopy } from '../../utils';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import Done from '../icons/Done.svelte';
    import SelectionBoard from '../display/SelectionBoard.svelte';
    import HintIcon from '../icons/HintIcon.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');
    const builtinTransformations: Writable<Array<string>> = getContext(
        'builtinTransformations'
    );

    let variableName: string = undefined;
    let transformationName: string = undefined;
    let transformationParameters: Parameter[] = undefined;

    function synctransformationParameters(parmams: Parameter[]) {
        transformationParameters = parmams;
    }

    $: synctransformationParameters(step?.config?.transformationParameters);

    function updateVariableResult() {
        let info = deepCopy($workflowInfo);
        let variableResult = step?.config?.variableCandidates?.find(
            variable => variable.name == variableName
        );
        info.steps[stepIndex].config.variableResults = new Array(
            variableResult
        );
        workflowInfo.set(info);
    }

    function updateTransformation() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.transformationName = transformationName;
        workflowInfo.set(info);
    }

    function handleInputChange(parameterName, value) {
        let info = deepCopy($workflowInfo);
        let parameter = transformationParameters?.find(
            parameter => parameter.name == parameterName
        );
        if (!_.isUndefined(parameter)) {
            parameter.value = value;
        }
        info.steps[stepIndex].config.transformationParameters =
            transformationParameters;
        workflowInfo.set(info);
    }

    function execute() {
        let info = deepCopy($workflowInfo);
        if (info.steps[stepIndex].done) {
            info.steps[stepIndex].done = false;
            workflowInfo.set(info);
        }
        info.steps[stepIndex].done = true;
        workflowInfo.set(info);
    }
</script>

<div class="flex flex-col h-full">
    <div
        class="overflow-y-scroll place-content-center flex"
        style="scrollbar-width: none"
    >
        <div
            class="overflow-y-scroll w-5/6 flex flex-col p-2 overflow-hidden bg-white border-2"
            style="scrollbar-width: none"
        >
            <div class="flex">
                <span class="p-2">Select the transformation: </span>
                <div class="grow" />
                <select
                    class="m-2 rounded py-2 px-4 bg-white border-solid border border-gray-300 focus:border-blue-500"
                    bind:value={transformationName}
                    on:change={updateTransformation}
                >
                    <option disabled selected value> -- option -- </option>
                    {#each $builtinTransformations as transformation}
                        <option value={transformation}>{transformation}</option>
                    {/each}
                </select>
            </div>
            <div class="flex">
                <span class="p-2">Select the column(s): </span>
                <div class="grow" />
                {#if !_.isUndefined(step?.config?.variableCandidates)}
                    <select
                        class="m-2 rounded py-2 px-4 bg-white border-solid border border-gray-300 focus:border-blue-500"
                        bind:value={variableName}
                        on:change={updateVariableResult}
                    >
                        <option disabled selected value> -- option -- </option>
                        {#each step?.config?.variableCandidates as variable}
                            <option value={variable.name}
                                >{variable.name}</option
                            >
                        {/each}
                    </select>
                {/if}
            </div>
            <SelectionBoard
                parameters={step.config.transformationParameters}
                {handleInputChange}
            />
        </div>
    </div>
    <div class="grow" />
    <div class="flex">
        <Tooltip title="Hint">
            <button><HintIcon /></button>
        </Tooltip>
        <div class="grow" />
        <Tooltip title="Execute">
            <button on:click={execute}><Done /></button>
        </Tooltip>
    </div>
</div>
