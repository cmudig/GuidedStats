export type Option = {
    colName: string;
    score?: number;
}

export type Metric = {
    metricName: string;
    score?: number;
    pvalue?: number;
}

export type Step = {
    stepName: string;
    done: boolean;
    isShown: boolean;
}

export type Workflow = {
    workflowName: string;
    dataset: string;
    steps:Step[];
    currentStep: number;
}

export type ModelConfiguration = {

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
