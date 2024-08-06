<script lang="ts">
    import _ from 'lodash';
    import type { Writable } from 'svelte/store';
    import { getContext } from 'svelte';
    import type {
        Action,
        Suggestion,
        Workflow
    } from '../../interface/interfaces';
    import { deepCopy } from '../../utils';
    import CollapseIcon from '../icons/CollapseIcon.svelte';
    import ExpandIcon from '../icons/ExpandIcon.svelte';
    import ExportIcon from '../icons/ExportIcon.svelte';
    import Tooltip from '../tooltip/Tooltip.svelte';
    import { activeTab } from '../../stores';

    export let title = '';
    export let content_html = '';
    export let content = '';
    export let items = [];
    export let suggestions: Suggestion[] = [];
    export let active = false;

    const workflowInfo: Writable<Workflow> = getContext('workflowInfo');

    function updateAction(suggestion: Suggestion) {
        let info: Workflow = deepCopy($workflowInfo);
        let action: Action = {
            name: suggestion.action,
            stepId: suggestion.stepId,
            activeTab: $activeTab
        };
        info['action'] = action;
        workflowInfo.set(info);
    }
</script>

{#if content_html.length > 0 || content.length > 0 || items.length > 0 || suggestions.length > 0}
    <button
        class="w-full my-2 hover:border-gray-300 text-white font-bold rounded"
        on:click={() => {
            active = !active;
        }}
    >
        <div class="flex">
            <span class="text-blue-700">
                {#if title.length > 0}
                    <h7 class="text-blue-700">{title}</h7>
                {:else}
                    <h7 class="text-blue-700">More Information</h7>
                {/if}
            </span>
            <div class="grow" />
            {#if active}
                <CollapseIcon width="1.2em" height="1.2em" />
            {:else}
                <ExpandIcon width="1.2em" height="1.3em" />
            {/if}
        </div>
    </button>
    {#if active}
        {#if content_html.length > 0}
            {@html content_html}
        {/if}

        {#if content.length > 0}
            <p>{content}</p>
        {/if}

        {#if suggestions.length > 0}
            <ul class="list-none">
                {#each suggestions as suggestion}
                    <li class="relative pl-5">
                        {suggestion.message}
                        {#if !_.isUndefined(suggestion?.action)}
                            <div class="inline-block">
                                <Tooltip title="Action">
                                    <button
                                        class="p-1"
                                        on:click={() => {
                                            updateAction(suggestion);
                                        }}
                                    >
                                        <ExportIcon
                                            width="1.2em"
                                            height="0.9em"
                                        />
                                    </button>
                                </Tooltip>
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}

        {#if items.length > 0}
            <ul class="list-none">
                {#each items as item}
                    <li class="relative pl-5">{item}</li>
                {/each}
            </ul>
        {/if}
    {/if}
{/if}

<style>
    ul li::before {
        content: '•';
        position: absolute;
        left: 0;
        top: -0.3em;
        font-size: 1.5em;
        font-weight: bold;
        color: black;
    }
</style>
