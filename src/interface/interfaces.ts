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
    value?: number | string | number[] | string[] | boolean | boolean[];
    pvalue?: number | number[];
    default?: number | string | number[] | string[] | boolean | boolean[];
};

export type Model = {
    name: string;
    parameters: Parameter[];
    isDefault?: boolean;
};

export type ModelResult = {
    name: string;
    score: number;
    group?: string;
};

export type Transformation = {
    name: string;
    parameters: Parameter[];
};

export type AssumptionResult = {
    name: string;
    prompt: string;
    stats: number;
    pvalue: number;
    rejectIndicator: string;
};

export type Step = {
    stepName: string;
    stepId: number;
    stepType: string;
    done: boolean;
    isProceeding: boolean;
    toExecute: boolean;
    isShown: boolean;
    stepExplanation?: string;
    suggestions?: Suggestion[];
    config: StepConfig;
    previousConfig?: StepConfig;
    groupConfig?: GroupConfig;
    message?: string;
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
    modelResults?: ModelResult[];
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
    group: string;
};

export type DensityPlotStats = {
    group?: number | string;
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
    message: string;
    report: string;
    action: Action;
    presets: Preset[];
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

export type VisualizationStep = Step & {
    viz: Visualization[];
};

export type Suggestion = {
    stepId: number;
    message: string;
    action?: string;
};

export type Action = {
    name: string;
    stepId: number;
    activeTab?: number;
}

export type Preset = {
    name: string;
    stepId: number;
    value: any;
}