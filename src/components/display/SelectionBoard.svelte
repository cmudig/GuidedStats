<script lang="ts">
    import type { Parameter } from '../../interface/interfaces';
    import _ from 'lodash';
    import Selection from './Selection.svelte';
    export let parameters: Parameter[] = undefined;
    export let handleInputChange: Function = undefined;
    export let maxSelectedNum: number = 1;
</script>

{#if !_.isUndefined(parameters)}
    <div class="bg-white">
        {#each parameters as parameter}
            <div class="flex items-center mb-2 bg-white">
                <span class="p-1"
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
                            class="rounded py-1 px-2 bg-white appearance-auto border-solid border border-gray-300 focus:border-blue-500"
                            value={(parameter?.default)? parameter.default : parameter?.options[0]?.name}
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
                        class="rounded py-1 px-2 bg-white appearance-auto border-solid border border-gray-300 focus:border-blue-500"
                        type="number"
                        value={(parameter?.default)? parameter.default : 0}
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
