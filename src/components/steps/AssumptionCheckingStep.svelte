<script lang="ts">
    import _ from 'lodash';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import { deepCopy } from '../../utils';
    import type { Step, Workflow } from '../../interface/interfaces';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import Done from '../icons/Done.svelte';
    import Alert from '../icons/Alert.svelte';
    import Tabs from '../display/Tabs.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    let assumptionName: string = undefined;
    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    const builtinAssumptions: Writable<Array<string>> =
        getContext('builtinAssumptions');

    function execute() {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].toExecute = true;
        workflowInfo.set(info);
    }

    function updateAssumption() {
        let info: Workflow = deepCopy($workflowInfo);
        info.steps[stepIndex].config.assumptionName = assumptionName;
        workflowInfo.set(info);
    }

    let active = true;
</script>

<div>
    {#if !_.isUndefined(step?.config?.assumptionResults)}
        <div class="overflow-y-scroll" style="scrollbar-width: none">
            <div class="flex">
                <div class="grow" />
                <!-- Visualization and Prompt -->
                <Tabs
                    num={step?.config?.viz?.length}
                    {stepIndex}
                    assumptionResults={step.config.assumptionResults}
                    viz={step.config.viz}
                />
                <div class="grow" />
            </div>
        </div>
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
            <Tooltip title="Apply Transformation/Skip">
                <button on:click={execute}><Done /></button>
            </Tooltip>
        </div>
    {:else}
        <!-- This part is for self defining-->
        <div class="flex flex-col h-full">
            <div
                class="overflow-y-scroll place-content-center flex"
                style="scrollbar-width: none"
            >
                <div
                    class="w-3/4 flex flex-col p-2 overflow-hidden bg-white border-2"
                >
                    <div class="flex">
                        <span class="p-3"
                            >Select the assumption you would like to check:
                        </span>
                        <div class="grow" />
                        <select
                            class="rounded py-2 px-4 bg-white border-solid border border-gray-300 focus:border-blue-500"
                            bind:value={assumptionName}
                        >
                            <option disabled selected value>
                                -- option --
                            </option>
                            {#each $builtinAssumptions as assumption}
                                <option value={assumption}>{assumption}</option>
                            {/each}
                        </select>
                    </div>
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
                        >{#if active}
                            <span class="px-2">{step.message}</span>
                        {/if}
                    {/if}
                </div>
                <Tooltip title="Done">
                    <button on:click={updateAssumption}><Done /></button>
                </Tooltip>
            </div>
        </div>
    {/if}
</div>
