export declare function mouseLocationToBoundingRect({ x, y, width, height }: {
    x: any;
    y: any;
    width?: number;
    height?: number;
}): {
    width: number;
    height: number;
    left: any;
    right: any;
    top: any;
    bottom: any;
};
export declare function placeElement({ location, alignment, parentPosition, // using getBoundingClientRect // DOMRect
elementPosition, // using getBoundingClientRect // DOMRect
distance, x, y, windowWidth, windowHeight, pad, }: {
    location: any;
    alignment: any;
    parentPosition: any;
    elementPosition: any;
    distance?: number;
    x?: number;
    y?: number;
    windowWidth?: number;
    windowHeight?: number;
    pad?: number;
}): any[];
