<script lang="ts">
    import _ from 'lodash';
    import type { Option } from '../../interface/interfaces';
    export let parameterName: string = undefined;
    export let options: Option[] = undefined;
    export let handleInputChange: Function = undefined;
    export let maxSelectedNum: number = 1;
    export let width: number = 120;
    export let height: number = 100;

    let selectedOptionNames: string[] = [];

    function handleOption(name: string) {
        if (selectedOptionNames.includes(name)) {
            selectedOptionNames.splice(selectedOptionNames.indexOf(name), 1);
        } else {
            if (selectedOptionNames.length < maxSelectedNum) {
                selectedOptionNames.push(name);
            } else {
                // check if the number of selected variables is more than variableNum
                alert(`You can only select ${maxSelectedNum} variables`);
            }
        }
        selectedOptionNames = [...selectedOptionNames];
        // find corresponding options by names
        let selectedOptions = options.filter(d =>
            selectedOptionNames.includes(d.name)
        );
        handleInputChange(parameterName, selectedOptions);
    }
</script>

<div
    class="parameter-container p-2 m-2 overflow-hidden bg-white border-2 flex flex-col"
    style="width:{width}px;height:{height}px"
>
    {#if !_.isUndefined(options)}
        {#each options as option}
            <button
                class="px-2 py-1 hover:bg-slate-100 {selectedOptionNames.includes(
                    option.name
                )
                    ? ' bg-gray-300'
                    : ''}"
                on:click={() => handleOption(option.name)}
                ><span
                    >{option.name}{_.isUndefined(option.score)
                        ? ''
                        : `: ${option.score.toFixed(4)}`}</span
                ></button
            >
        {/each}
    {/if}
</div>

<style>
    .parameter-container {
        overflow-y: scroll;
        /* scrollbar-width: none;
        -ms-overflow-style: none; */
    }

    /* .parameter-container::-webkit-scrollbar {
        width: 0;
        height: 0;
    } */
</style>
