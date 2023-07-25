import type { Writable } from 'svelte/store';
import type { DOMWidgetModel } from '@jupyter-widgets/base';
export declare function WidgetWritable<T>(name_: string, value_: T, model: DOMWidgetModel): Writable<T>;
export declare const currentHoveredCol: Writable<string>;
export declare const allowLogs: Writable<boolean>;
export declare const showIndex: Writable<boolean>;
