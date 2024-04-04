import type { Visualization } from '../../../interface/interfaces';
import _ from 'lodash';

export function getBoxplotStats(
    viz: Visualization,
    width: number = 200,
    height: number = 120
) {
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container',
        height: height,
        data: {
            values: viz.vizStats
        },
        encoding: { y: { field: 'name', type: 'nominal', title: null } },
        axes: [
            {
                orient: 'bottom',
                scale: 'xscale',
                labelOverlap: true,
                zindex: 1
            },
            { orient: 'left', scale: 'yscale', labelOverlap: true, zindex: 1 }
        ],
        layer: [
            {
                mark: { type: 'rule' },
                encoding: {
                    x: {
                        field: 'lower',
                        type: 'quantitative',
                        scale: { zero: false },
                        title: null
                    },
                    x2: { field: 'upper' }
                }
            },
            {
                mark: { type: 'bar', size: 14 },
                encoding: {
                    x: { field: 'q1', type: 'quantitative' },
                    x2: { field: 'q3' },
                    color: { field: 'name', type: 'nominal', legend: null }
                }
            },
            {
                mark: { type: 'tick', color: 'white', size: 14 },
                encoding: {
                    x: { field: 'median', type: 'quantitative' }
                }
            },
            {
                transform: [{ flatten: ['outliers'] }],
                mark: {
                    type: 'point',
                    style: 'boxplot-outliers',
                    tooltip: true
                },
                encoding: {
                    x: { field: 'outliers', type: 'quantitative' }
                }
            }
        ]
    };

    return spec;
}

export function getScatterPlotStats(
    viz: Visualization,
    group: string = '',
    width: number = 200,
    height: number = 120
) {
    let spec;
    if (group.length === 0) {
        let xMax = Math.max(...viz.vizStats.map((d: any) => d.x));
        let xMin = Math.min(...viz.vizStats.map((d: any) => d.x));
        spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            width: 'container',
            height: height,
            data: { values: viz.vizStats },
            mark: { type: 'point', tooltip: true },
            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: true,
                    zindex: 1
                },
                {
                    orient: 'left',
                    scale: 'yscale',
                    labelOverlap: true,
                    zindex: 1
                }
            ],
            encoding: {
                x: {
                    field: 'x',
                    title: viz.xLabel,
                    type: 'quantitative',
                    scale: { domain: [xMin, xMax] }
                },
                y: { field: 'y', title: viz.yLabel, type: 'quantitative' }
            }
        };
    } else {
        let xMax = Math.max(
            ...viz.vizStats
                .filter((d: any) => d.group === group)
                .map((d: any) => d.x)
        );
        let xMin = Math.min(
            ...viz.vizStats
                .filter((d: any) => d.group === group)
                .map((d: any) => d.x)
        );
        spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            width: 'container',
            height: height,
            data: {
                values: viz.vizStats.filter((d: any) => d.group === group)
            },
            mark: { type: 'point', tooltip: true },
            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: true,
                    zindex: 1
                },
                {
                    orient: 'left',
                    scale: 'yscale',
                    labelOverlap: true,
                    zindex: 1
                }
            ],
            encoding: {
                x: {
                    field: 'x',
                    title: viz.xLabel,
                    type: 'quantitative',
                    scale: { domain: [xMin, xMax] }
                },
                y: { field: 'y', title: viz.yLabel, type: 'quantitative' }
            }
        };
    }
    return spec;
}

export function getDensityPlotStats(
    viz: Visualization,
    subvizType: string = 'density',
    width: number = 300,
    height: number = 120
) {
    if (subvizType === 'density') {
        const spec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            description:
                'Area chart using density estimation to show a probability density or cumulative distribution.',
            width: width,
            height: height,
            padding: 5,
            data: [
                {
                    name: 'points',
                    values: viz.vizStats
                },
                {
                    name: 'summary',
                    source: 'points',
                    transform: [
                        {
                            type: 'aggregate',
                            fields: ['value', 'value'],
                            ops: ['mean', 'stdev'],
                            as: ['mean', 'stdev']
                        }
                    ]
                },
                {
                    name: 'density',
                    source: 'points',
                    transform: [
                        {
                            type: 'density',
                            extent: { signal: "domain('xscale')" },
                            distribution: { function: 'kde', field: 'value' }
                        }
                    ]
                },
                {
                    name: 'normal',
                    transform: [
                        {
                            type: 'density',
                            extent: { signal: "domain('xscale')" },
                            distribution: {
                                function: 'normal',
                                mean: { signal: "data('summary')[0].mean" },
                                stdev: { signal: "data('summary')[0].stdev" }
                            }
                        }
                    ]
                }
            ],
            scales: [
                {
                    name: 'xscale',
                    type: 'linear',
                    range: 'width',
                    domain: { data: 'points', field: 'value' },
                    nice: true
                },
                {
                    name: 'yscale',
                    type: 'linear',
                    range: 'height',
                    round: true,
                    domain: {
                        fields: [
                            { data: 'density', field: 'density' },
                            { data: 'normal', field: 'density' }
                        ]
                    }
                },
                {
                    name: 'color',
                    type: 'ordinal',
                    domain: ['Normal Estimate', 'Sample Density'],
                    range: ['#444', 'steelblue']
                }
            ],
            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: true,
                    title: 'Value', 
                    zindex: 1
                },
                {
                    orient: 'left',
                    scale: 'yscale',
                    labelOverlap: true,
                    title: "Probability Density",
                    zindex: 1
                }
            ],
            legends: [
                { orient: 'top-left', fill: 'color', offset: 0, zindex: 1 }
            ],
            marks: [
                {
                    type: 'area',
                    from: { data: 'density' },
                    encode: {
                        update: {
                            x: { scale: 'xscale', field: 'value' },
                            y: { scale: 'yscale', field: 'density' },
                            y2: { scale: 'yscale', value: 0 },
                            fill: { signal: "scale('color', 'Sample Density')" }
                        }
                    }
                },
                {
                    type: 'line',
                    from: { data: 'normal' },
                    encode: {
                        update: {
                            x: { scale: 'xscale', field: 'value' },
                            y: { scale: 'yscale', field: 'density' },
                            stroke: {
                                signal: "scale('color', 'Normal Estimate')"
                            },
                            strokeWidth: { value: 2 }
                        }
                    }
                }
            ]
        };
        return spec;
    } else if (subvizType === 'qq') {
        const specs = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            data: { values: viz.vizStats },
            width : width,
            height: height,
            transform: [
                { quantile: 'value', step: 0.01, as: ['p', 'v'] },
                { calculate: 'quantileNormal(datum.p)', as: 'norm' }
            ],
            mark: 'point',
            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: true,
                    title: 'Theoretical Uniform Quantiles',
                    zindex: 1
                },
                {
                    orient: 'left',
                    scale: 'yscale',
                    labelOverlap: true,
                    title: 'Empirical Data Quantiles',
                    zindex: 1
                }
            ],
            encoding: {
                x: { field: 'norm', type: 'quantitative' },
                y: { field: 'p', type: 'quantitative' }
            }
        };
        return specs;
    }
}

export function getTTestPlotStats(
    viz: Visualization,
    width: number = 200,
    height: number = 120,
    title: string = 'T-Test'
) {
    if (!_.isUndefined(viz?.title)) {
        title = viz.title;
    }
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container',
        height: height,
        data: {
            values: viz.vizStats
        },
        axes: [
            {
                orient: 'bottom',
                scale: 'xscale',
                labelOverlap: true,
                zindex: 1
            },
            { orient: 'left', scale: 'yscale', labelOverlap: true, zindex: 1 }
        ],
        layer: [
            {
                mark: 'boxplot',
                encoding: {
                    y: { field: 'group', type: 'nominal' },
                    x: { field: 'value', type: 'quantitative' }
                }
            },
            {
                mark: 'point',
                encoding: {
                    y: { field: 'group', type: 'nominal' },
                    x: { field: 'value', type: 'quantitative' }
                }
            }
        ],
        title: {
            text: title,
            anchor: 'middle'
        }
    };

    return spec;
}

export function getHeatMapStats(
    viz: Visualization,
    width: number = 200,
    height: number = 120
) {
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container',
        height: height,
        data: {
            values: viz.vizStats
        },
        title: {
            text: 'Correlation Matrix',
            anchor: 'middle'
        },
        mark: { type: 'rect', tooltip: true },
        encoding: {
            x: {
                field: 'variable1',
                title: null
            },
            y: {
                field: 'variable2',
                title: null
            },
            color: {
                field: 'value',
                type: 'quantitative',
                scale: { scheme: 'redblue', domain: [-1, 1] },
                legend: {
                    title: null
                },
                as: 'correlation'
            }
        }
    };
    return spec;
}

// generate a dictionary of visualization types and their corresponding functions
export const vizTypeToSpec = {
    boxplot: getBoxplotStats,
    multiBoxplot: getBoxplotStats,
    scatter: getScatterPlotStats,
    density: getDensityPlotStats,
    ttest: getTTestPlotStats,
    heatmap: getHeatMapStats
};