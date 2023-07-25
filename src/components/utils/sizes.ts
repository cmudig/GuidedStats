export const config = {
    nullPercentageWidth: 80,
    compactBreakpoint: 260,
    largeBreakpoint: 500,
    extraLargeBreakpoint: 625,
    summaryVizWidth: { default: 120, large: 240, xlarge: 380 },
};


export function getSummarySize(containerWidth: number): number {
    if (containerWidth > config.extraLargeBreakpoint) {
        return config.summaryVizWidth.xlarge;
    }

    if (containerWidth > config.largeBreakpoint) {
        return config.summaryVizWidth.large;
    }

    return config.summaryVizWidth.default;
}
