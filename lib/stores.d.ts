import type { Writable } from 'svelte/store';
import type { DOMWidgetModel } from '@jupyter-widgets/base';
export declare function WidgetWritable<T>(name_: string, value_: T, model: DOMWidgetModel): Writable<T>;
export declare const selectedStep: Writable<string>;
