import type { NotebookAPI } from "../dataAPI/jupyter/notebook";
import { allowLogs } from "../stores";
import { get } from "svelte/store";

interface LogEvent {
    eventname: string;
    timestamp: Date;
    details?: any;
}

class Logger {
    private _notebook: NotebookAPI;
    private _logs: LogEvent[] = []
    constructor(notebook?: NotebookAPI) {
        console.log("Logger created")
        this._logs = []
        this._notebook = notebook

        // save logs every 5 seconds
        setInterval(() => {
            this.save()
        }, 5000)
    }

    log(eventname: string, details?: any) {
        this._logs.push({ eventname, timestamp: new Date(), details })
    }

    setNoteook(notebook: NotebookAPI) {
        console.log("setting notebook in logger")
        this._notebook = notebook
    }

    printAllLogs() {
        console.log("All Logs:", this._logs)
    }

    save() {
        const allowSave = get(allowLogs)
        // this.printAllLogs()
        if (this._notebook && allowSave) {
            this._notebook.saveToNotebookMetadata("AutoProfilerLogs", this._logs)
        }
    }
}

export const logger = new Logger()
