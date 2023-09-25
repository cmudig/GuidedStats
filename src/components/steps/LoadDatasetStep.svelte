<script lang="ts">
    import _ from 'lodash';
    // import { Alert } from 'flowbite-svelte';
    import type { Step } from '../../interface/interfaces';
    export let step: Step = undefined;
    export let stepIndex: number = undefined;
</script>

<div>
    Loaded Dataset: <span class="font-bold" style="color:#008AFE">{_.isUndefined(step) ? '' : step.config.dataset}</span>
</div>
<!-- 
<div class="p-8">
    <Alert>
      <span class="font-medium">Info alert!</span>
      Change a few things up and try submitting again.
    </Alert>
  </div> -->
