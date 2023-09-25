export type Option = {
    name: string;
    score?: number;
    pvalue?: number;
}

export type Parameter = {
    name: string;
    value: number | string;
    pvalue?: number;
}

// export type MetricResult = {
//     name: string;
//     score?: number;
//     pvalue?: number;
// }

export type AssumptionResult = {
    name: string;
    prompt: string;
}

export type Step = {
    stepName: string;
    stepId: number;
    stepType: string;
    done: boolean;
    isShown: boolean;
    config: StepConfig;
}

export type StepConfig = {
    dataset?: string;
    metric?: string;
    transformation?: string;
    variableName?: string;
    referenceVariables?: string[];
    variableCandidates?: Option[];
    variableResults?: Option[];
    assumptionName?: string;
    assumptionCandidates?: Option[];
    assumptionResults?: AssumptionResult[];
    transformationName?: string;
    trainSize?: number;
    modelName?: string;
    modelParameters?: Parameter[];
    modelCandidates?: Option[];
    modelResults?: Option[];
    viz?: Visualization;
}

export type Visualization = {
    //TBC
    vizType: string;
    xLabel?: string;
    yLabel?: string;
    vizStats: BoxPlotStats[] | ScatterPlotStats[];
}

export type BoxPlotStats = {
    name: string;
    lower: number;
    q1: number;
    median: number;
    q3: number;
    upper: number;
    outliers: number[];
}

export type ScatterPlotStats = {
    "x": number;
    "y": number;
}

export type Flow = {
    sourceStepId: number;
    targetStepId: number;
}

export type Workflow = {
    workflowName: string;
    currentStepId: number;
    steps: Step[];
    flows: Flow[];
}

export type LoadDatasetStep = Step & {
    dataset: string;
}

export type GuidedStep = Step & {
    metric: string;
}

export type VariableSelectionStep = GuidedStep & {
    varaibleName: string;
    selectionResults:Option[];
}

export type ModelStep = GuidedStep & {
    modelName: string;
}

export type selectedStepInfo = {
    stepType: string;
    stepPos: number;
}
