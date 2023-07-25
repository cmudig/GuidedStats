/**
 * scrub-action-factory
 * --------------------
 * This action factory produces an object that contains
 * - a coordinates store, which has the x and y start and stop values
 *   of the in-progress scrub.
 * - an isScrubbing store, which the user can exploit to see if scrubbing is
 *   currently happening
 * - a movement store, which captures the momentum of the scrub.
 * - a customized action
 *
 * Why is this an action factory and not an action? Because we actually want to initialize a bunch
 * of stores that are used throughout the app, which respond to the action's logic automatically,
 * and can thus be consumed within the application without any other explicit call point.
 * This action factory pattern is quite useful in a variety of settings.
 * </script>
 */
interface ScrubActionFactoryArguments {
    /** the bounds where the scrub is active. */
    plotLeft: number;
    plotRight: number;
    plotTop: number;
    plotBottom: number;
    /** the name of the events we declare for start, move, end.
     * Typically mousedown, mousemove, and mouseup.
     */
    startEvent?: string;
    endEvent?: string;
    moveEvent?: string;
    /** the dispatched move event name for the scrub move effect, to be
     * passed up to the parent element when the scrub move has happened.
     * e.g.
     */
    moveEventName?: string;
    /** the dispatched move event name for the scrub completion effect, to be
     * passed up to the parent element when the scrub is completed.
     * e.g. when moveEventName = "scrubbing", we have <div use:scrubAction on:scrubbing={...} />
     */
    endEventName?: string;
    /** These predicates will gate whether we continue with
     * the startEvent, moveEvent, and endEvents.
     * If they're not passed in as arguments, the action
     * will always assume they're true.
     * This is used e.g. when a user wants to hold the shift or alt key, or
     * check for some other condition to to be true.
     * e.g when completedEventName = "scrub", we have <div use:scrubAction on:scrub={...} />
     */
    startPredicate?: (event: Event) => boolean;
    movePredicate?: (event: Event) => boolean;
    endPredicate?: (event: Event) => boolean;
}
export interface PlotBounds {
    plotLeft?: number;
    plotRight?: number;
    plotTop?: number;
    plotBottom?: number;
}
interface ScrubAction {
    destroy: () => void;
}
export declare function createScrubAction({ plotLeft, plotRight, plotTop, plotBottom, startEvent, startPredicate, endEvent, endPredicate, moveEvent, movePredicate, endEventName, moveEventName }: ScrubActionFactoryArguments): {
    coordinates: import("svelte/store").Writable<{
        start: import("../utils/constants").DomainCoordinates;
        stop: import("../utils/constants").DomainCoordinates;
    }>;
    isScrubbing: import("svelte/store").Writable<boolean>;
    movement: import("svelte/store").Writable<{
        xMovement: number;
        yMovement: number;
    }>;
    updatePlotBounds(bounds: PlotBounds): void;
    scrubAction(node: Node): ScrubAction;
};
export {};
