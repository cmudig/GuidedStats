import { Widget } from '@lumino/widgets';
const RESIZE_HANDLE_CLASS = 'jp-CellResizeHandle';
const CELL_RESIZED_CLASS = 'jp-mod-resizedCell';
/**
 * A handle that allows to change input/output proportions in side-by-side mode.
 */
export class ResizeHandle extends Widget {
    constructor(targetNode) {
        super();
        this.targetNode = targetNode;
        this._isActive = false;
        this._isDragging = false;
        this._protectedWidth = 10;
        this.addClass(RESIZE_HANDLE_CLASS);
    }
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        this.node.addEventListener('dblclick', this);
        this.node.addEventListener('mousedown', this);
    }
    onAfterDetach(msg) {
        super.onAfterAttach(msg);
        this.node.removeEventListener('dblclick', this);
        this.node.removeEventListener('mousedown', this);
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     */
    handleEvent(event) {
        var _a, _b;
        switch (event.type) {
            case 'dblclick':
                (_a = this.targetNode.parentNode) === null || _a === void 0 ? void 0 : _a.childNodes.forEach(node => {
                    node.classList.remove(CELL_RESIZED_CLASS);
                });
                document.documentElement.style.setProperty('--jp-side-by-side-output-size', '1fr');
                this._isActive = false;
                break;
            case 'mousedown':
                this._isDragging = true;
                if (!this._isActive) {
                    (_b = this.targetNode.parentNode) === null || _b === void 0 ? void 0 : _b.childNodes.forEach(node => {
                        node.classList.add(CELL_RESIZED_CLASS);
                    });
                    this._isActive = true;
                }
                window.addEventListener('mousemove', this);
                window.addEventListener('mouseup', this);
                break;
            case 'mousemove': {
                if (!this._isActive || !this._isDragging) {
                    return;
                }
                const targetRect = this.targetNode.getBoundingClientRect();
                const width = targetRect.width - this._protectedWidth * 2;
                const position = event.clientX - targetRect.x - this._protectedWidth;
                const outputRatio = width / position - 1;
                document.documentElement.style.setProperty('--jp-side-by-side-output-size', `${outputRatio}fr`);
                break;
            }
            case 'mouseup':
                this._isDragging = false;
                window.removeEventListener('mousemove', this);
                window.removeEventListener('mouseup', this);
                break;
            default:
                break;
        }
    }
}
//# sourceMappingURL=resizeHandle.js.map