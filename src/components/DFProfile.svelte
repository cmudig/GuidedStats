<script lang="ts">
    import _ from 'lodash';
    import type { IDFProfileWState } from '../common/exchangeInterfaces';
    import ColumnProfile from './ColumnProfile.svelte';
    import { formatInteger } from './utils/formatters';

    export let dfName: string;
    export let dataframeProfile: IDFProfileWState;
    export let isInFocus = false; // not used in inline profiler but needed for consistency
    export let isPinned = false;

    // locals
    let previewView = 'summaries';
    $: warningMessage = _.isEmpty(dataframeProfile.warnings)
        ? ''
        : dataframeProfile.warnings.map(w => w.warnMsg).join(', ');

    // view variables
    let profileWidth = 750;

    /**
     * Svelte container binding not working on initial load (sets to 0), but works on window resize or any re-re-render
     *  so we default to the max width until a resize
     * @param inputWidth the width of the container
     */
    function binWidth(inputWidth: number) {
        if (inputWidth <= 0) {
            return 750;
        }

        return inputWidth;
    }
</script>

<div class="inlineprofiler-base-wrapper">
    <div class="dfprofile-header flex gap-1 items-center">
        <div class="font-bold">
            {dfName}
        </div>

        <p class="grow">
            {formatInteger(dataframeProfile?.shape?.[0])} x {formatInteger(
                dataframeProfile?.shape?.[1]
            )}
        </p>
    </div>

    <div class="dfprofile-body" bind:clientWidth={profileWidth}>
        <div class="col-profiles">
            {#if !_.isEmpty(warningMessage)}
                <div class="pl-2 pr-2 pb-2">
                    <span class="bg-amber-500 rounded-md p-[3px]"
                        >Warning
                    </span>
                    {warningMessage}
                </div>
            {/if}

            {#if dataframeProfile?.shape?.[1] > 0}
                {#each dataframeProfile?.profile as column (column.name)}
                    <ColumnProfile
                        example={column.example}
                        {dfName}
                        colName={column.name}
                        type={column.type}
                        summary={column.summary}
                        nullCount={column.nullCount}
                        containerWidth={binWidth(profileWidth)}
                        view={previewView}
                        totalRows={dataframeProfile?.shape?.[0]}
                        isIndex={column.isIndex}
                    />
                {/each}
            {:else}
                <p class="pl-8">No columns!</p>
            {/if}
        </div>
    </div>
</div>

<style>
    /* this component styles */
    .col-profiles {
        width: 100%;
    }

    .dfprofile-header {
        margin: 0;
        padding: 0.5em;
    }

    .focusIndicator {
        height: 10px;
        width: 10px;
        background-color: #1976d2;
        border-radius: 2px;
    }

    .inlineprofiler-base-wrapper {
        max-width: 750px;
    }
</style>
