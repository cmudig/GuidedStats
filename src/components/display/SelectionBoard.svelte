<script lang="ts">
    import type { Parameter } from '../../interface/interfaces';
    import _ from 'lodash';
    import Selection from './Selection.svelte';
    export let parameters: Parameter[] = undefined;
    export let handleInputChange: Function = undefined;
    export let maxSelectedNum: number = 1;
</script>

{#if !_.isUndefined(parameters)}
    <div class="bg-white border-2 border-gray-300">
        {#each parameters as parameter}
            <div class="flex items-center mb-2 bg-white border-2 border-gray-300">
                <span class="p-2"
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
                            class="m-2 rounded py-2 px-4 bg-white border-2 border-gray-300 focus:border-blue-500"
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
