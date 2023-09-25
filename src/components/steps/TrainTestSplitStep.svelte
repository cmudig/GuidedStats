<script lang="ts">
    import _ from 'lodash';
    import {deepCopy} from '../../utils';
    import Range from '../bars/Range.svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function updateSizeResult() {
        let info = deepCopy($workflowInfo);
        info.steps[stepIndex].config.trainSize = percentage / 100;
        workflowInfo.set(info);
    }

    let percentage: number = 0;
</script>

<div>
    <div>
        Select size of <span class="font-bold" style="color:#008AFE"
            >training set</span
        >
        and <span class="font-bold" style="color:#008AFE">test set</span>:
    </div>
    <div class="place-content-center flex">
        <div class="w-1/2 p-2 overflow-hidden bg-white border-2">
            <div class="flex">
                <span class="font-bold" style="color:#377eb8">Train</span>
                <div class="grow" />
                <span class="font-bold" style="color:#e41a1c">Test</span>
            </div>
            <Range
                min = {0}
                max = {100}
                on:change={e => (percentage = e.detail.value)}
            />
            <div class="flex">
                <span class="font-bold" style="color:#377eb8"
                    >{(percentage / 100).toFixed(2)}</span
                >
                <div class="grow" />
                <span class="font-bold" style="color:#e41a1c"
                    >{(1 - (percentage / 100)).toFixed(2)}</span
                >
            </div>
        </div>
        <div class="w-1/6 flex flex-col p-2 overflow-hidden bg-white border-2">
            <button class="border-2">
                <span class="font-bold">Skip</span>
            </button>
            <div class="grow" />
            <button class="border-2" on:click={updateSizeResult}>
                <span class="font-bold">Done</span>
            </button>
        </div>
    </div>
</div>

<style>
    div {
        --progress-bg: #377eb8;
        --track-bg: #e41a1c;
    }
</style>
