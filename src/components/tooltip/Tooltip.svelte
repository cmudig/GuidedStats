<script>
    export let title = '';
    let isHovered = false;
    let x;
    let y;

    function mouseOver(event) {
        isHovered = true;
        x = event.layerX - 80;
        y = event.layerY + 5;
    }
    function mouseMove(event) {
        x = event.layerX - 80;
        y = event.layerY + 5;
    }
    function mouseLeave() {
        isHovered = false;
    }
</script>

<div
    on:mouseover={mouseOver}
    on:mouseleave={mouseLeave}
    on:mousemove={mouseMove}
>
    <slot />
</div>

{#if isHovered}
    <div
        style="top: {y}px; left: {x}px;"
        class="absolute border border-gray-300 bg-white shadow px-2 py-1 rounded text-black opacity-100"
    >
        {title}
    </div>
{/if}
