import type { ScaleLinear, ScaleTime } from 'd3-scale';
export declare type GraphicScale = ScaleLinear<number, number> | ScaleTime<Date, number>;
/**
 * Creates a string to be fed into the d attribute of a path,
 * producing a single path definition for one circle.
 * These completed, segmented arcs will not overlap in a way where
 * we can overplot if part of the same path.
 */
export declare function circlePath(cx: number, cy: number, r: number): string;
export declare function pathDoesNotDropToZero(yAccessor: string): (d: any, i: number, arr: any) => boolean;
interface LineGeneratorArguments {
    xAccessor: string;
    xScale: ScaleLinear<number, number> | ScaleTime<Date, number>;
    yScale: ScaleLinear<number, number> | ScaleTime<Date, number>;
    curve: string;
    pathDefined?: (datum: object, i: number, arr: ArrayLike<unknown>) => boolean;
}
/**
 * A convenience function to generate a nice SVG path for a time series.
 * FIXME: rename to timeSeriesLineFactory.
 * FIXME: once we've gotten the data generics in place and threaded into components, let's make sure to type this.
 */
export declare function lineFactory(args: LineGeneratorArguments): (yAccessor: string) => any;
/**
 * A convenience function to generate a nice SVG area path for a time series.
 * FIXME: rename to timeSeriesAreaFactory.
 * FIXME: once we've gotten the data generics in place and threaded into components, let's make sure to type this.
 */
export declare function areaFactory(args: LineGeneratorArguments): (yAccessor: string) => any;
/**
 * Return a list of ticks to be represented on the
 * axis or grid depending on axis-side, it's length and
 * the data type of field
 */
export declare function getTicks(xOrY: string, scale: GraphicScale, axisLength: number, isDate: boolean): any;
export {};
