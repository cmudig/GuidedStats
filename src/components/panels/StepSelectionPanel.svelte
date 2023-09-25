<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let steps: Array<string> = undefined;
    import {selectedStep} from "../../stores";
    import DefineIcon from "../icons/DefineIcon.svelte";
    import StepIcon from '../icons/StepIcon.svelte';

    let dispatch = createEventDispatcher();

</script>

<div class="pnl grow bg-white w-full mt-2 border-2 rounded-lg">
    <div class="flex">
        <span class="font-bold text-2xl">Step</span>
        <div class="grow" />
        <DefineIcon />
    </div>
    <div>
        {#each steps as step}
            <button
                class="w-full flex px-2 hover:bg-slate-100"
                on:click={() => {
                    dispatch('message', { selectedStep: step });
                }}>
                <StepIcon width="1.5em" height="1.5em" />
                <span style="color:#807E7E">{step}</span>
                </button
            >
        {/each}
    </div>
</div>

<style>
    .pnl{
        min-height: 45%;
        box-shadow: 6px 6px 12px -3px rgba(0, 0, 0, 0.6);
    }
</style>