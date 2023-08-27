export type Option = {
    name: string;
    score?: number;
}

export type Metric = {
    metricName: string;
    score?: number;
    pvalue?: number;
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
    variableCandidates?: Option[];
    variableResults?: Option[];
    assumptionName?: string;
    modelName?: string;
    modelCandidates?: Option[];
    modelResults?: Option[];
    visualization?: Visualization;
}

export type Visualization = {
    //TBC
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
