<script>
    export let title = '';
    let isHovered = false;
    let x;
    let y;

    function mouseOver(event) {
        isHovered = true;
        x = event.layerX - 20;
        y = event.layerY + 5;
    }
    function mouseMove(event) {
        x = event.layerX - 20;
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
    <div style="top: {y}px; left: {x}px;" class="tooltip">{title}</div>
{/if}

<style>
    .tooltip {
        border: 1px solid #e5e7eb;
        box-shadow: 1px 1px 1px #ddd;
        background: white;
        border-radius: 4px;
        padding: 4px;
        position: absolute;
        color: black;
        opacity: 1;
    }
</style>
