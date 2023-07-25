import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { DOMWidgetModel } from '@jupyter-widgets/base';

export function WidgetWritable<T>(name_: string, value_: T, model: DOMWidgetModel): Writable<T> {
  const name: string = name_;
  const internalWritable: Writable<any> = writable(model.get(name_) || value_);
  model.on(
    'change:' + name,
    () => internalWritable.set(model.get(name)),
    null
  );

  return {
    set: (v: any) => {
      internalWritable.set(v);
      if (model) {
        model.set(name, v);
        model.save_changes();
      }
    },
    subscribe: internalWritable.subscribe,
    update: (func: any) => {
      internalWritable.update((v: any) => {
        const output = func(v);
        if (model) {
          model.set(name, output);
          model.save_changes();
        }
        return output;
      });
    },
  };
}

// UI stores
// NOTE by default all the stores in this file are synced across all widget instances
export const currentHoveredCol: Writable<string> = writable(undefined);
export const allowLogs: Writable<boolean> = writable(false);
export const showIndex: Writable<boolean> = writable(false);