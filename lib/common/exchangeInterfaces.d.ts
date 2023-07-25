export declare type IColTypeTuple = {
    col_name: string;
    col_type: string;
    col_is_index: boolean;
};
export declare type Warning = {
    warnMsg: string;
};
export declare type IDFColMap = {
    [key: string]: {
        columns: IColTypeTuple[];
        python_id: string;
        warnings: Warning[];
    };
};
export declare type IDFProfileWStateMap = {
    [dfname: string]: IDFProfileWState;
} | undefined;
export declare type IDFProfileWState = IDFProfileData & IDFProfileState;
export declare type IDFProfileState = {
    lastUpdatedTime: number;
    isPinned: boolean;
    warnings: Warning[];
};
export declare type IDFProfileData = {
    profile: ColumnProfileData[];
    shape: number[];
    dfName: string;
};
export declare type IQuantChartData = {
    binned_data: any[];
    bin_size: number;
};
export declare type IQuantMeta = {
    min: number;
    q25: number;
    q50: number;
    q75: number;
    max: number;
    mean: number;
    sd_outlier: number;
    iqr_outlier: number;
    sortedness: string;
    n_zero: number;
    n_positive: number;
    n_negative: number;
};
export declare type IColMeta = {
    numUnique: number;
    nullCount: number;
};
export declare type IStringMeta = {
    minLength: number;
    maxLength: number;
    meanLength: number;
};
export declare type ITemporalMeta = {
    sortedness: string;
};
export declare type ColumnProfileData = {
    name: string;
    type: string;
    isIndex: boolean;
    summary: ColumnSummary;
    nullCount: number;
    example: any;
};
export interface ColumnSummary {
    cardinality: number;
    topK: ValueCount[];
    histogram?: IHistogram;
    timeInterval?: Interval;
    statistics?: IQuantMeta;
    quantMeta?: IQuantMeta;
    stringMeta?: IStringMeta;
    temporalMeta?: ITemporalMeta;
}
export declare type TimeBin = {
    count: number;
    ts_start: Date;
    ts_end: Date;
};
export declare type ValueCount = {
    value: any;
    count: number;
};
export declare type IHistogramBin = {
    bucket: number;
    low: number;
    high: number;
    count: number;
};
export declare type IHistogram = IHistogramBin[];
export declare type Interval = {
    months: number;
    days: number;
    micros: number;
};
export declare enum PreviewRollupInterval {
    ms = "1 millisecond",
    second = "1 second",
    minute = "1 minute",
    hour = "1 hour",
    day = "1 day",
    month = "1 month",
    year = "1 year"
}
