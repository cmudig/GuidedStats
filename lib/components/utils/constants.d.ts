export interface DomainCoordinates {
    x: number;
    y: number;
}
export declare const DEFAULT_COORDINATES: DomainCoordinates;
export interface PlotConfig {
    top: number;
    bottom: number;
    left: number;
    right: number;
    buffer: number;
    width: number;
    height: number;
    devicePixelRatio: number;
    plotTop: number;
    plotBottom: number;
    plotLeft: number;
    plotRight: number;
    fontSize: number;
    textGap: number;
    id: any;
}
