<script lang="ts">
    import { getContext } from 'svelte';
    import type { Step, Workflow } from '../../interface/interfaces';
    import type { Writable } from 'svelte/store';

    export let steps: Array<Step>;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    let height: number = 380;
    let width: number = 60;

    let stepHeight: number = 40;

    function convertToDag(steps: Array<Step>) {
        let heights: number[] = [];

        if (steps !== undefined) {
            let currentHeight = 0.5 * stepHeight;
            heights.push(currentHeight); // the height of the first step
            for (let i = 0; i < steps.length - 1; i++) {
                let step = steps[i];
                currentHeight =
                    (step.isShown ? 5 * stepHeight : stepHeight) +
                    currentHeight;
                heights.push(currentHeight);
            }
        };

        return heights;
    }

    $: heights = convertToDag(steps);
</script>

<div class="dag">
    <svg {height} {width}>
        {#if steps !== undefined}
            {#each heights as height, idx}
                <circle cx={0.5 * width} cy={height} r="8" fill="#D9D9D9" />
                {#if idx < steps.length - 1}
                    <line
                        x1={0.5 * width}
                        y1={height}
                        x2={0.5 * width}
                        y2={heights[idx + 1]}
                        stroke="#D9D9D9"
                        stroke-width="3"
                    />
                {/if}
            {/each}
        {/if}
    </svg>
</div>

<!-- <div class="dag">
<svg height={height} width={width}>
{#if steps !== undefined}
{#each steps as _,idx}
{}
<circle
cx={0.5*width}
cy={0.5*stepHeight+idx*stepHeight}
r=8
fill="#D9D9D9"
/>
{#if idx < steps.length - 1}
<line
x1={0.5*width}
y1={0.5*stepHeight+idx*stepHeight}
x2={0.5*width}
y2={0.5*stepHeight+(idx+1)*stepHeight}
stroke="#D9D9D9"
stroke-width=3
/>
{/if}
{/each}
{/if}
</svg>
</div> -->
<style>
    .dag {
        width: 60px;
        height: 100%;
    }
</style>
