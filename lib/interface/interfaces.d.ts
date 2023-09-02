export declare type Option = {
    name: string;
    score?: number;
};
export declare type Metric = {
    metricName: string;
    score?: number;
    pvalue?: number;
};
export declare type Step = {
    stepName: string;
    stepId: number;
    stepType: string;
    done: boolean;
    isShown: boolean;
    config: StepConfig;
};
export declare type StepConfig = {
    dataset?: string;
    metric?: string;
    transformation?: string;
    variableName?: string;
    variableCandidates?: Option[];
    variableResults?: Option[];
    assumptionName?: string;
    modelName?: string;
    modelCandidates?: Option[];
    modelResults?: Option[];
    visualization?: Visualization;
};
export declare type Visualization = {};
export declare type Flow = {
    sourceStepId: number;
    targetStepId: number;
};
export declare type Workflow = {
    workflowName: string;
    currentStepId: number;
    steps: Step[];
    flows: Flow[];
};
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
