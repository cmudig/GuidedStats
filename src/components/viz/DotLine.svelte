<script lang="ts">
    import type { Step } from '../../interface/interfaces';

    export let step: Step;
    export let height: number;
    export let isLast: boolean = false;

    let radius: number = 8;

    function getColor(step: Step) {
        if (step.done) {
            return '#1d346e';
        } else if (step.isProceeding) {
            return '#05a3da';
        } else {
            return '#c3cece';
        }
    }

</script>

<div>
    <svg
    width={radius * 2 + 2}
    height={height}
    >
        <circle
        cx={radius}
        cy={radius}
        r={radius}
        fill={getColor(step)}
        />
        {#if !isLast}
            <line
                x1={radius}
                y1={radius * 2}
                x2={radius}
                y2={height}
                stroke={getColor(step)}
                stroke-width="3"
            />
        {/if}    
    </svg>
</div>

