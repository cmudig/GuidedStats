<script lang="ts">
    import _ from 'lodash';
    import type { Parameter } from '../../interface/interfaces';
    export let headers: string[] = undefined;
    export let keys: string[] = undefined;
    export let data: Parameter[] = undefined;
</script>

<table>
    <thead>
        <tr>
            {#if !_.isUndefined(headers)}
                {#each headers as header}
                    <th>{header}</th>
                {/each}
            {/if}
        </tr>
    </thead>
    <tbody>
        {#if !_.isUndefined(data)}
            {#each data as param}
                <tr>
                    {#each keys as key}
                        {#if key in param}
                            <td>{param[key]}</td>
                        {/if}
                    {/each}
                </tr>
            {/each}
        {/if}
    </tbody>
</table>

<style>
    /* Base table styles */
    table {
        border-collapse: collapse; /* Collapse borders */
    }

    thead tr {
        background-color: #009879; /* A nice greenish blue for the header */
        color: #ffffff; /* White text color */
        text-align: left; /* Align text to the left */
        font-weight: bold; /* Bold font for headers */
    }

    th,
    td {
        padding: 4px;
    }

    tbody tr {
        border-bottom: 1px solid #dddddd; /* Light grey border for rows */
    }

    tbody tr:last-of-type {
        border-bottom: 2px solid #009879; /* Add a strong line at the bottom of the table */
    }

    tbody tr.active-row {
        font-weight: bold; /* Bold font for an active row */
        color: #009879; /* Match the header color */
    }

    /* Hover effect for rows */
    tbody tr:hover {
        background-color: #f1f1f1; /* Light grey for hover */
        cursor: pointer; /* Indicate the row is clickable */
    }
</style>
