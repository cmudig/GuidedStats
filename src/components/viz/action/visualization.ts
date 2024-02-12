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
                mark: { type: 'point', style: 'boxplot-outliers' },
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
        spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            width: 'container',
            height: height,
            data: { values: viz.vizStats },
            mark: { type: 'point', tooltip: true },
            encoding: {
                x: { field: 'x', title: viz.xLabel, type: 'quantitative' },
                y: { field: 'y', title: viz.yLabel, type: 'quantitative' }
            }
        };
    } else {
        spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            width: 'container',
            height: height,
            data: {
                values: viz.vizStats.filter((d: any) => d.group === group)
            },
            mark: { type: 'point', tooltip: true },
            encoding: {
                x: { field: 'x', title: viz.xLabel, type: 'quantitative' },
                y: { field: 'y', title: viz.yLabel, type: 'quantitative' }
            }
        };
    }
    return spec;
}

export function getDensityPlotStats(
    viz: Visualization,
    width: number = 200,
    height: number = 120
) {
    const maximum = Math.max(...viz.vizStats.map((d: any) => d.value));
    const minimum = Math.min(...viz.vizStats.map((d: any) => d.value));
    const spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container',
        height: height,
        data: {
            values: viz.vizStats
        },
        mark: 'area',
        transform: [
            {
                density: 'value',
                groupby: ['group'],
                extent: [minimum, maximum]
            }
        ],
        encoding: {
            x: { field: 'value', type: 'quantitative' },
            y: { field: 'density', type: 'quantitative', stack: 'zero' },
            color: { field: 'group', type: 'nominal' }
        }
    };
    return spec;
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
        layer: [
            {
                mark: 'boxplot',
                encoding: {
                    x: { field: 'group', type: 'nominal' },
                    y: { field: 'value', type: 'quantitative' }
                }
            },
            {
                mark: 'point',
                encoding: {
                    x: { field: 'group', type: 'nominal' },
                    y: { field: 'value', type: 'quantitative' }
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
                legend: {
                    title: null
                }
            }
        }
    };
    return spec;
}
