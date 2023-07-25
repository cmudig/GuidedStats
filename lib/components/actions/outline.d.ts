/** this action appends another text DOM element
 * that gives an outlined / punched-out look to whatever
 * svg text node it is applied to. It will then listen to
 * any of the relevant attributes / the content itself
 * and update accordingly via a basic MutationObserver.
 */
interface OutlineAction {
    destroy: () => void;
}
export declare function outline(node: SVGElement, args?: {
    color: string;
}): OutlineAction;
export {};
