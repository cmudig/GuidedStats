import { Commit } from "./commit";
import { GitgraphCore } from "./gitgraph";
import { Coordinate } from "./branches-paths";
export { Omit, NonMatchingPropNames, NonMatchingProp, booleanOptionOr, numberOptionOr, pick, debug, isUndefined, withoutUndefinedKeys, arrowSvgPath, };
/**
 * Omit some keys from an original type.
 */
declare type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
/**
 * Get all property names not matching a type.
 *
 * @ref http://tycho01.github.io/typical/modules/_object_nonmatchingpropsnames_.html
 */
declare type NonMatchingPropNames<T, X> = {
    [K in keyof T]: T[K] extends X ? never : K;
}[keyof T];
/**
 * Get all properties with names not matching a type.
 *
 * @ref http://tycho01.github.io/typical/modules/_object_nonmatchingprops_.html
 */
declare type NonMatchingProp<T, X> = Pick<T, NonMatchingPropNames<T, X>>;
/**
 * Provide a default value to a boolean.
 * @param value
 * @param defaultValue
 */
declare function booleanOptionOr(value: any, defaultValue: boolean): boolean;
/**
 * Provide a default value to a number.
 * @param value
 * @param defaultValue
 */
declare function numberOptionOr(value: any, defaultValue: number): number;
/**
 * Creates an object composed of the picked object properties.
 * @param obj The source object
 * @param paths The property paths to pick
 */
declare function pick<T, K extends keyof T>(obj: T, paths: K[]): Pick<T, K>;
/**
 * Print a light version of commits into the console.
 * @param commits List of commits
 * @param paths The property paths to pick
 */
declare function debug<TNode = SVGElement>(commits: Array<Commit<TNode>>, paths: Array<keyof Commit<TNode>>): void;
/**
 * Return true if is undefined.
 *
 * @param obj
 */
declare function isUndefined(obj: any): obj is undefined;
/**
 * Return a version of the object without any undefined keys.
 *
 * @param obj
 */
declare function withoutUndefinedKeys<T>(obj?: T): NonMatchingProp<T, undefined>;
/**
 * Return a string ready to use in `svg.path.d` to draw an arrow from params.
 *
 * @param graph Graph context
 * @param parent Parent commit of the target commit
 * @param commit Target commit
 */
declare function arrowSvgPath<TNode = SVGElement>(graph: GitgraphCore<TNode>, parent: Coordinate, commit: Commit<TNode>): string;
