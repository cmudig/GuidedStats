/**
 * Provides mappings from pandas data types to conceptual types we use in the application:
 * CATEGORICALS, NUMERICS, and TIMESTAMPS.
 */
export declare const INTEGERS: Set<string>;
export declare const FLOATS: Set<string>;
export declare const NUMERICS: Set<string>;
export declare const BOOLEANS: Set<string>;
export declare const TIMESTAMPS: Set<string>;
export declare const INTERVALS: Set<any>;
export declare const CATEGORICALS: Set<string>;
interface IColorTokens {
    textClass: string;
    bgClass: string;
    vizFillClass: string;
    vizStrokeClass: string;
    vizHoverClass?: string;
}
export declare const CATEGORICAL_TOKENS: IColorTokens;
export declare const NUMERIC_TOKENS: IColorTokens;
export declare const TIMESTAMP_TOKENS: IColorTokens;
export declare const INTERVAL_TOKENS: IColorTokens;
export declare const DATA_TYPE_COLORS: {};
export {};
