<script lang="ts">
    import _ from 'lodash';
    import type { Option } from '../../interface/interfaces';
    export let parameterName: string = undefined;
    export let options: Option[] = undefined;
    export let handleInputChange: Function = undefined;
    export let maxSelectedNum: number = 1;

    let selectedOptionNames: string[] = [];

    function handleOption(event, name: string) {
        if (event.shiftKey) {
            let selected = [...selectedOptionNames, name];
            if (selected.length > maxSelectedNum) {
                return;
            }
            selectedOptionNames = [...selectedOptionNames, name];
        } else {
            selectedOptionNames = [name];
        }

        let selectedOptions = options.filter(d =>
            selectedOptionNames.includes(d.name)
        );

        handleInputChange(parameterName, selectedOptions);
    }
</script>

<div
    class="p-2 m-2 flex overflow-hidden overflow-y-scroll bg-white border-2 flex flex-col max-h-96"
>
    <div class="grow" />
    <div class="flex flex-col">
        {#if !_.isUndefined(options)}
            {#each options as option}
                <button
                    class="px-2 py-1 hover:bg-slate-100 {selectedOptionNames.includes(
                        option.name
                    )
                        ? ' bg-gray-300'
                        : ''}"
                    on:click={e => handleOption(e, option.name)}
                    ><span
                        >{option.name}{_.isUndefined(option.score)
                            ? ''
                            : `: ${option.score.toFixed(4)}`}</span
                    ></button
                >
            {/each}
        {/if}
    </div>
    <div class="grow" />
</div>
