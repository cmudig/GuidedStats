<script lang="ts">
    import type { Step } from '../../interface/interfaces';

    export let steps: Array<Step>;

    let height: number = 380;
    let width: number = 60;

    let stepHeight: number = 40;

    function getColor(step: Step) {
        if (step.done) {
            return "#1d346e";
        } else if (step.isProceeding) {
            return "#05a3da";
        } else {
            return '#c3cece';
        }
    }

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
            };
            
            height = heights[heights.length - 1] + ((steps[steps.length - 1].isShown) ? 4.5 * stepHeight : 0.5 * stepHeight);
        }

        return heights;
    }

    $: heights = convertToDag(steps);
</script>

<div class="dag">
    <svg {height} {width}>
        {#if steps !== undefined && steps.length > 0}
            {#each heights as height, idx}
                <circle
                    cx={0.5 * width}
                    cy={height}
                    r="8"
                    fill={getColor(steps[idx])}
                />
                {#if idx < steps.length - 1}
                    <line
                        x1={0.5 * width}
                        y1={height}
                        x2={0.5 * width}
                        y2={heights[idx + 1]}
                        stroke={getColor(steps[idx])}
                        stroke-width="3"
                    />
                {/if}
            {/each}
        {/if}
    </svg>
</div>
<style>
    .dag {
        width: 60px;
        height: 100%;
    }
</style>
