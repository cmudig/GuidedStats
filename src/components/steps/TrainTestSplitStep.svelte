<script lang="ts">
    import _ from 'lodash';
    import { deepCopy } from '../../utils';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    import Done from '../icons/Done.svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;
    export let height: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function updateSizeResult() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.trainSize = percentage / 100;
        workflowInfo.set(info);
    }

    let percentage: number = 80;
</script>

<div class="flex flex-col">
    <div class="card place-content-center flex" style="height:{height-30}px">
        <div class="w-3/4 p-4 overflow-hidden bg-white border-2">
            <div class="flex slider-container">
                <span>Train Percentage: {percentage} %</span>
                <div class="grow" />
                <div class="w-1/2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    on:input={e => (percentage = +e.target.value)}
                />       
                </div>
                
            </div>
        </div>
    </div>
    <div class="grow" />
    <div class="flex">
        <div class="grow" />
        <Tooltip title="Done">
            <button on:click={updateSizeResult}><Done /></button>
        </Tooltip>
    </div>
</div>

<style>
    div {
        --progress-bg: #377eb8;
        --track-bg: #e41a1c;
    }

    .card {
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .card::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>
