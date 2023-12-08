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
      console.log(v);
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

// UI stores, used to communicate between components
export const onSelectingStep = writable(false);
export const newStepPos = writable(-1);
export const newStepType = writable("");
export const exportingItem = writable("");