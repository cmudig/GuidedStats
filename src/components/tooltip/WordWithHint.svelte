<script lang="ts">
    import HintIcon from '../icons/HintIcon.svelte';

    export let word: string = '';
    export let explanation: string = '';
    let isClicked = false;
    let x: number;
    let y: number;

    function toggleHint(event) {
        isClicked = !isClicked;
        x = event.layerX + 5;
        y = event.layerY;
    }
</script>
{#if explanation.length > 0}
<span class="inline-flex">
    {#if word.length > 0}
        <p class="float-left">{word}</p>
    {/if}
    <button on:click={toggleHint}><HintIcon /></button>
    {#if isClicked}
        <div style="top: {y}px; left: {x}px;" class="hint">{explanation}</div>
    {/if}
</span>
{/if}
<style>
    .hint {
        width: 200px;
        height: 100px;
        overflow-y: scroll;
        text-wrap: balance;
        border: 1px solid #e5e7eb;
        box-shadow: 1px 1px 1px #ddd;
        background: white;
        border-radius: 4px;
        padding: 4px;
        position: absolute;
        color: black;
        opacity: 1;
        z-index: 1000;
    }
</style>
