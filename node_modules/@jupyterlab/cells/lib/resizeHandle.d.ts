import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
/**
 * A handle that allows to change input/output proportions in side-by-side mode.
 */
export declare class ResizeHandle extends Widget {
    protected targetNode: HTMLElement;
    private _isActive;
    private _isDragging;
    private _protectedWidth;
    constructor(targetNode: HTMLElement);
    protected onAfterAttach(msg: Message): void;
    protected onAfterDetach(msg: Message): void;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     */
    handleEvent(event: Event): void;
}
