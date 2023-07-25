import type { IDFProfileWState } from "../../common/exchangeInterfaces";
export declare function sortByCardinality(a: any, b: any): 0 | 1 | -1;
export declare function sortByNullity(a: any, b: any): 1 | -1;
export declare function sortByType(a: any, b: any): 0 | 1 | -1;
export declare function sortByName(a: any, b: any): 1 | -1;
export declare function defaultSort(a: any, b: any): 0 | 1 | -1;
export declare function sortDFArr(arr: IDFProfileWState[], by?: string): IDFProfileWState[];
