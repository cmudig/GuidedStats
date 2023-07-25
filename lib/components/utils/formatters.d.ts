import { PreviewRollupInterval } from '../../common/exchangeInterfaces';
import type { Interval } from '../../common/exchangeInterfaces';
export declare const formatInteger: any;
export declare function formatNumeric(type: string, value: any): any;
export declare function formatInt(v: any): any;
export declare function formatFloat(v: any): any;
export declare const formatPercentage: any;
/**
 * changes precision depending on the
 */
export declare function formatBigNumberPercentage(v: any): any;
export declare function removeTimezoneOffset(dt: any): Date;
export declare const standardTimestampFormat: (v: any, type?: string) => any;
export declare const datePortion: any;
export declare const timePortion: any;
export declare function microsToTimestring(microseconds: number): string;
export declare function intervalToTimestring(interval: Interval): string;
export declare function formatCompactInteger(n: number): any;
export declare function formatDataType(value: any, type: string): any;
/** These will be used in the string */
export declare const PreviewRollupIntervalFormatter: {
    "1 millisecond": string; /** showing rows binned by ms */
    "1 second": string; /** showing rows binned by second */
    "1 minute": string; /** showing rows binned by minute */
    "1 hour": string; /** showing hourly counts */
    "1 day": string; /** showing daily counts */
    "1 month": string; /** showing monthly counts */
    "1 year": string; /** showing yearly counts */
};
export declare function formatSort(sortedness: string): string;
