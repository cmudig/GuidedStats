export { createSvg, createG, createText, createCircle, createRect, createPath, createUse, createClipPath, createDefs, createForeignObject, };
interface SVGOptions {
    viewBox?: string;
    height?: number;
    width?: number;
    children?: SVGElement[];
}
declare function createSvg(options?: SVGOptions): SVGSVGElement;
interface GOptions {
    children: Array<SVGElement | null>;
    translate?: {
        x: number;
        y: number;
    };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
}
declare function createG(options: GOptions): SVGGElement;
interface TextOptions {
    content: string;
    fill?: string;
    font?: string;
    anchor?: "start" | "middle" | "end";
    translate?: {
        x: number;
        y: number;
    };
    onClick?: () => void;
}
declare function createText(options: TextOptions): SVGTextElement;
interface CircleOptions {
    radius: number;
    id?: string;
    fill?: string;
}
declare function createCircle(options: CircleOptions): SVGCircleElement;
interface RectOptions {
    width: number;
    height: number;
    borderRadius?: number;
    fill?: string;
    stroke?: string;
}
declare function createRect(options: RectOptions): SVGRectElement;
interface PathOptions {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    translate?: {
        x: number;
        y: number;
    };
}
declare function createPath(options: PathOptions): SVGPathElement;
declare function createUse(href: string): SVGUseElement;
declare function createClipPath(): SVGClipPathElement;
declare function createDefs(children: SVGElement[]): SVGDefsElement;
interface ForeignObjectOptions {
    content: string;
    width: number;
    translate?: {
        x: number;
        y: number;
    };
}
declare function createForeignObject(options: ForeignObjectOptions): SVGForeignObjectElement;
