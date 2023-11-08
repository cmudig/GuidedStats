<script lang="ts">
    export let steps: Array<string> = undefined;
    import DefineIcon from "../icons/DefineIcon.svelte";
    import StepIcon from '../icons/StepIcon.svelte';
    import { newStepType, onSelectingStep } from '../../stores';

</script>

<div class={"pnl grow bg-white w-full mt-2 border-2 rounded-lg" + (($onSelectingStep)? " ring-4": "")}>
    <div class="flex p-2">
        <span class="font-bold">Step</span>
        <div class="grow" />
        <DefineIcon />
    </div>
    <div>
        {#each steps as step}
            <button
                class="w-full flex px-2 py-1 hover:bg-slate-100 overflow-hidden"
                on:click={() => {
                    newStepType.set(step);
                    onSelectingStep.set(false);
                }}>
                <StepIcon />
                <span class="px-1" style="color:#807E7E">{step}</span>
                </button
            >
        {/each}
    </div>
</div>

<style>
    .pnl{
        min-height: 45%;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
        }

    .pnl::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
</style>