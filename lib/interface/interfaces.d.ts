export declare type Option = {
    name: string;
    score?: number;
    pvalue?: number;
};
export declare type Parameter = {
    name: string;
    value: number | string;
};
export declare type AssumptionResult = {
    name: string;
    prompt: string;
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
    referenceVariables?: string[];
    variableCandidates?: Option[];
    variableResults?: Option[];
    assumptionName?: string;
    assumptionResults?: AssumptionResult[];
    trainSize?: number;
    modelName?: string;
    modelParameters?: Parameter[];
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
