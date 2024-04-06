<script lang="ts">
    import _ from 'lodash';
</script>

<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css"
    integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ"
    crossorigin="anonymous"
/>

<div
    class="grow text-wrap p-2 w-rounded-lg font-sans text-gray-800 overflow-y-scroll"
    style="scrollbar-width: none"
>
    <slot name="step" />
    {#if $$slots.report}
        <slot name="report" />
    {/if}
    {#if $$slots.concept}
        <slot name="concept" />
    {/if}
    {#if $$slots.suggestions}
        <slot name="suggestions" />
    {/if}
    <slot name="export" />
</div>
