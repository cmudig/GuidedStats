<script lang="ts">
    import _ from 'lodash';
    // import { Alert } from 'flowbite-svelte';
    import type { Step } from '../../interface/interfaces';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;
</script>

<div>
    Loaded hjkjfhdhdhjxh Dataset: <span class="font-bold" style="color:#008AFE"
        >{_.isUndefined(step) ? '' : step.config.dataset}</span
    >
</div>
