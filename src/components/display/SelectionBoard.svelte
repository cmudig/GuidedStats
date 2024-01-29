<script lang="ts">
    import type { Parameter } from '../../interface/interfaces';
    import _ from 'lodash';
    import Selection from './Selection.svelte';
    export let parameters: Parameter[] = undefined;
    export let handleInputChange: Function = undefined;
    export let maxSelectedNum: number = 1;
</script>

{#if !_.isUndefined(parameters)}
    <div class="parameter-container">
        {#each parameters as parameter}
            <div class="flex items-center mb-2 parameter-container">
                <span class="parameter-label"
                    >{_.isUndefined(parameter.displayName)
                        ? parameter.name
                        : parameter.displayName}:
                </span>
                <div class="grow" />
                {#if !_.isUndefined(parameter?.options)}
                    {#if parameter?.multiple}
                        <Selection
                            parameterName={parameter.name}
                            options={parameter.options}
                            {handleInputChange}
                            {maxSelectedNum}
                        />
                    {:else}
                        <select
                            class="parameter-select m-2"
                            on:change={event =>
                                handleInputChange(
                                    parameter.name,
                                    event.target.value
                                )}
                        >
                        <option disabled selected value>
                            -- option --
                        </option>
                            {#each parameter?.options as option}
                                <option value={option.name}
                                    >{option.name}</option
                                >
                            {/each}
                        </select>
                    {/if}
                {:else}
                    <input
                        class="parameter-input m-2"
                        type="number"
                        on:input={event =>
                            handleInputChange(
                                parameter.name,
                                event.target.value
                            )}
                    />
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .parameter-container {
        background-color: #f2f2f2;
        border-bottom: 1px solid #ddd;
    }
    .parameter-label {
        color: #333;
        padding: 10px;
    }
    .parameter-input,
    .parameter-select {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px 10px;
        background-color: white;
    }
    .parameter-input:focus,
    .parameter-select:focus {
        border-color: #007bff;
        outline: none;
    }
</style>
