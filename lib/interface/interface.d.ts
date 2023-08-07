export declare type Option = {
    colName: string;
    score?: number;
};
export declare type Metric = {
    metricName: string;
    score?: number;
    pvalue?: number;
};
export declare type Step = {
    stepName: string;
    done: boolean;
    isShown: boolean;
};
export declare type Workflow = {
    workflowName: string;
    dataset: string;
    steps: Step[];
    currentStep: number;
};
export declare type ModelConfiguration = {};
export declare type LoadDatasetStep = Step & {
    dataset: string;
};
export declare type GuidedStep = Step & {
    metric: string;
};
export declare type VariableSelectionStep = GuidedStep & {
    varaibleName: string;
    selectionResults: Option[];
};
export declare type ModelStep = GuidedStep & {
    modelName: string;
};
