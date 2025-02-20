<script lang="ts">
    import _ from 'lodash';
    import type { Step, Workflow, Option } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    import { deepCopy } from '../../utils';
    import Done from '../icons/Done.svelte';
    import Alert from '../icons/Alert.svelte';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import Selection from '../display/Selection.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    let variableResults = new Array<string>();
    let groupResults = new Array<string>();

    function handleInputChange(parameterName: string, value: Option[]) {
        if (parameterName === 'variableResults') {
            variableResults = [...value.map(d => d.name)];
            updateVariableResults();
        } else if (parameterName === 'groupResults') {
            groupResults = [...value.map(d => d.name)];
            updateGroupResults();
        }
    }

    function updateVariableResults() {
        let results = step.config.variableCandidates.filter(d =>
            variableResults.includes(d.name)
        );
        let info = deepCopy($workflowInfo);
        //deal with cases where the step has been done
        if (info.steps[stepIndex].done) {
            info.steps[stepIndex].previousConfig = info.steps[stepIndex].config;
        }
        info.steps[stepIndex].config.variableResults = results;
        workflowInfo.set(info);
    }

    function updateGroupResults() {
        let results = step.config.groupCandidates.filter(d =>
            groupResults.includes(d.name)
        );

        let info = deepCopy($workflowInfo);
        //deal with cases where the step has been done
        if (info.steps[stepIndex].done) {
            info.steps[stepIndex].previousConfig = info.steps[stepIndex].config;
        }
        info.steps[stepIndex].config.groupResults = results;
        workflowInfo.set(info);
    }

    function execute() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].toExecute = true;
        workflowInfo.set(info);
    }

    let active = true;
</script>

<div class="flex flex-col">
    <div>
        <div class="flex overflow-y-scroll" style="scrollbar-width: none">
            <!-- variable selection -->
            <div
                class={'transition duration-500 flex flex-col' +
                    (_.isUndefined(step?.config?.groupCandidates)
                        ? ' w-full'
                        : ' w-1/2')}
            >
                <div>
                    {#if !_.isUndefined(step.config.metric)}
                        The below variables are ranked by their {step.config
                            .metric} correlation with the target variable
                        <span class="font-bold" style="color:#008AFE"
                            >{step.config.referenceVariables?.reduce(
                                (previousValue, currentValue) =>
                                    previousValue + ', ' + currentValue
                            )}</span
                        >. Please select one or more as independent
                        variables(shift click to select multiple variables)
                    {:else}
                        Please select {step.config.variableNum}
                        <span class="font-bold" style="color:#008AFE"
                            >{step.config.variableName}</span
                        > from below:
                    {/if}
                </div>
                <div class="flex">
                    {#if !_.isUndefined(step?.config?.variableCandidates)}
                        <div class="grow" />
                        <Selection
                            parameterName="variableResults"
                            options={step.config.variableCandidates}
                            {handleInputChange}
                            maxSelectedNum={step?.config?.variableNum}
                        />
                        <div class="grow" />
                    {/if}
                </div>
            </div>
            <!-- select groups -->
            {#if !_.isUndefined(step?.config?.groupCandidates) && step.config.groupCandidates.length > 0}
                <div class="transition duration-500 flex flex-col w-1/2">
                    <div>
                        Please select 2 <span
                            class="font-bold"
                            style="color:#008AFE">groups</span
                        > from below(shift click to select multiple variables):
                    </div>

                    <Selection
                        parameterName="groupResults"
                        options={step.config.groupCandidates}
                        {handleInputChange}
                        maxSelectedNum={2}
                    />
                </div>
            {/if}
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
                >{#if active}
                    <span class="px-2">{step.message}</span>
                {/if}
            {/if}
        </div>
        <Tooltip title="Execute">
            <button on:click={execute}><Done /></button>
        </Tooltip>
    </div>
</div>
