import type { NotebookAPI } from "../dataAPI/jupyter/notebook";
declare class Logger {
    private _notebook;
    private _logs;
    constructor(notebook?: NotebookAPI);
    log(eventname: string, details?: any): void;
    setNoteook(notebook: NotebookAPI): void;
    printAllLogs(): void;
    save(): void;
}
export declare const logger: Logger;
export {};
