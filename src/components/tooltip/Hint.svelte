<script lang="ts">
    import data from '../../dictionary.json';
    import type { Explanation } from '../../interface/interfaces';
    import WordWithHint from './WordWithHint.svelte';
    const explanations: Explanation[] = data;

    export let text: string = '';
    let words = text.split(/\s+/);
</script>

<div class="block relative">
{#each words as word}
    {#if explanations.find(explanation => explanation.word === word)}
        <WordWithHint
            {word}
            explanation={explanations.find(
                explanation => explanation.word === word
            )?.explanation}
        />
    {:else}
        {word}
    {/if}
    <!-- Add a space after each word -->
    {' '}
{/each}
</div>