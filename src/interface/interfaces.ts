export type Option = {
    name: string;
    score?: number;
    pvalue?: number;
};

export type Parameter = {
    name: string;
    displayName?: string;
    multiple?: boolean;
    options?: Option[];
    value?: number | string | number[] | string[];
    pvalue?: number | number[];
};

export type Model = {
    name: string;
    parameters: Parameter[];
};

export type Transformation = {
    name: string;
    parameters: Parameter[];
};

export type AssumptionResult = {
    name: string;
    prompt: string;
};

export type Step = {
    stepName: string;
    stepId: number;
    stepType: string;
    done: boolean;
    isProceeding: boolean;
    isShown: boolean;
    config: StepConfig;
    previousConfig?: StepConfig;
    groupConfig?: GroupConfig;
};

export type GroupConfig = {
    groupCandidates?: Option[];
    groupResults?: Option[];
};

export type StepConfig = {
    dataset?: string;
    metric?: string;
    transformation?: string;
    variableName?: string;
    variableNum: number;
    referenceVariables?: string[];
    variableCandidates?: Option[];
    variableResults?: Option[];
    requireVarCategory?: boolean;
    groupCandidates?: Option[];
    groupResults?: Option[];
    assumptionName?: string;
    assumptionCandidates?: Option[];
    assumptionResults?: AssumptionResult[];
    transformationName?: string;
    transformationParameters?: Parameter[];
    transformationCandidates?: Transformation[];
    trainSize?: number;
    modelName?: string;
    modelParameters?: Parameter[];
    modelCandidates?: Model[];
    modelResults?: Option[];
    viz?: Visualization[];
    evaluationMetricNames?: string[];
};

export type Visualization = {
    //TBC
    vizType: string;
    xLabel?: string;
    yLabel?: string;
    title?: string;
    vizStats:
        | BoxPlotStats[]
        | ScatterPlotStats[]
        | DensityPlotStats[]
        | HeatMapStats[];
};

export type BoxPlotStats = {
    name: string;
    lower: number;
    q1: number;
    median: number;
    q3: number;
    upper: number;
    outliers: number[];
};

export type ScatterPlotStats = {
    x: number;
    y: number;
};

export type DensityPlotStats = {
    group: number | string;
    value: number;
};

export type HeatMapStats = {
    variable1: string;
    variable2: string;
    value: number;
};

export type Flow = {
    sourceStepId: number;
    targetStepId: number;
};

export type Workflow = {
    workflowName: string;
    currentStepId: number;
    steps: Step[];
    flows: Flow[];
};

export type LoadDatasetStep = Step & {
    dataset: string;
};

export type GuidedStep = Step & {
    metric: string;
};

export type VariableSelectionStep = GuidedStep & {
    varaibleName: string;
    selectionResults: Option[];
};

export type ModelStep = GuidedStep & {
    modelName: string;
};

export type selectedStepInfo = {
    stepType: string;
    stepPos: number;
};

export type Explanation = {
    word: string;
    explanation: string;
};