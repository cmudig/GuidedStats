import type { Visualization } from "../../../interface/interfaces";

export function getBoxplotStats(viz: Visualization) {

    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 120,
        "height": 120,
        "data": {
            "values": viz.vizStats
        },
        "encoding": { "y": { "field": "name", "type": "nominal", "title": null } },
        "layer": [
            {
                "mark": { "type": "rule" },
                "encoding": {
                    "x": { "field": "lower", "type": "quantitative", "scale": { "zero": false }, "title": null },
                    "x2": { "field": "upper" }
                }
            },
            {
                "mark": { "type": "bar", "size": 14 },
                "encoding": {
                    "x": { "field": "q1", "type": "quantitative" },
                    "x2": { "field": "q3" },
                    "color": { "field": "name", "type": "nominal", "legend": null }
                }
            },
            {
                "mark": { "type": "tick", "color": "white", "size": 14 },
                "encoding": {
                    "x": { "field": "median", "type": "quantitative" }
                }
            },
            {
                "transform": [{ "flatten": ["outliers"] }],
                "mark": { "type": "point", "style": "boxplot-outliers" },
                "encoding": {
                    "x": { "field": "outliers", "type": "quantitative" }
                }
            }
        ]
    };

    return spec;
}

export function getScatterPlotStats(viz: Visualization) {

    const spec =
    {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 120,
        "height": 120,
        "data": {"values": viz.vizStats},
        "mark": "point",
        "encoding": {
            "x": { "field": "x", "title": viz.xLabel, "type": "quantitative" },
            "y": { "field": "y", "title": viz.yLabel,"type": "quantitative" }
        }
    }


    return spec;
}