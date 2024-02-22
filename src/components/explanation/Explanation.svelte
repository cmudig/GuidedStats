<script lang="ts">
    let height: number = 200;
</script>

<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css"
    integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ"
    crossorigin="anonymous"
/>

<div
    class="text-wrap bg-gray-100 p-2 m-1 w-rounded-lg font-sans text-gray-800 overflow-y-scroll"
    style="height:{height}px"
>
    <h6 class="text-blue-700">What is this step for:</h6>
    <slot name="step" />
    <br />
    <h6 class="text-blue-700">Important concept:</h6>
    <slot name="concept" />
</div>
