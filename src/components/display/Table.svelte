<script lang="ts">
    import _ from 'lodash';
    import type { Parameter } from '../../interface/interfaces';
    export let headers: string[] = undefined;
    export let keys: string[] = undefined;
    export let data: Parameter[] = undefined;
</script>

<table class="border-collapse divide-y divide-gray-200 text-center">
    <thead class="text-white bg-green-600 font-bold">
        <tr>
            {#if !_.isUndefined(headers)}
                {#each headers as header}
                    <th class="p-1">{header}</th>
                {/each}
            {/if}
        </tr>
    </thead>
    <tbody>
        {#if !_.isUndefined(data)}
            {#each data as param}
                <tr class="hover:bg-gray-100 cursor-pointer hover:font-bold border-b-gray-200 border-2">
                    {#each keys as key}
                        {#if key in param}
                            <td class="p-1 whitespace-nowrap">{param[key]}</td>
                        {/if}
                    {/each}
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
