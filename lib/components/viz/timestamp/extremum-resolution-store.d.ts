import type { EasingFunction } from 'svelte/transition';
interface extremumArgs {
    duration?: number;
    easing?: EasingFunction;
    direction?: string;
    alwaysOverrideInitialValue?: boolean;
}
export declare function createExtremumResolutionStore(initialValue?: number | Date, passedArgs?: extremumArgs): {
    subscribe: (this: void, run: import("svelte/store").Subscriber<number | Date>, invalidate?: (value?: number | Date) => void) => import("svelte/store").Unsubscriber;
    setWithKey(key: any, value?: any, override?: any): void;
    removeKey(key: string): void;
    setTweenProps(tweenPropsArgs: any): void;
};
export {};
