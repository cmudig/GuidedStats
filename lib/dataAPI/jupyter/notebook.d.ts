import { NotebookPanel, Notebook } from '@jupyterlab/notebook';
import type { ISignal } from '@lumino/signaling';
import CellAPI from './cell';
export declare class NotebookAPI {
    private readonly _ready;
    private _changed;
    panel: NotebookPanel;
    cells: CellAPI[];
    mostRecentExecutionCount: number;
    constructor(notebookPanel: NotebookPanel);
    saveToNotebookMetadata(key: string, value: any): void;
    get ready(): Promise<void>;
    get changed(): ISignal<NotebookAPI, string>;
    get notebook(): Notebook;
    get language(): string;
    get path(): string;
    get name(): string;
    get activeCell(): CellAPI;
    addCell(kind: 'code' | 'markdown', text: string, index?: number): void;
    private listenToCells;
    private listenToSession;
    private loadCells;
}
