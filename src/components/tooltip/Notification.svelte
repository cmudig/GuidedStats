<script lang="ts">
    import type { Writable } from 'svelte/store';
    import type { Workflow } from '../../interface/interfaces';
    import { isBlocked } from '../../stores';
    import { getContext } from 'svelte';
    import _ from 'lodash';
    import { deepCopy } from '../../utils';

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    let message: string = undefined;

    function updateMessage(msg: string) {
        if (!_.isUndefined(msg) && !_.isEmpty(msg)) {
            isBlocked.set(true);
            message = msg;
        }
    }

    $: updateMessage($workflowInfo.message);
</script>

{#if $isBlocked}
    <button
        on:click={() => {
            message = undefined;
            let info = deepCopy($workflowInfo);
            info.message = '';
            workflowInfo.set(info);
            isBlocked.set(false);
        }}
    >
        <div
            class="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div class="bg-white p-6 rounded-lg shadow-lg">
                {#if !_.isUndefined(message) && !_.isEmpty(message)}
                    <p>{message}</p>
                {/if}
            </div>
        </div>
    </button>
{/if}
