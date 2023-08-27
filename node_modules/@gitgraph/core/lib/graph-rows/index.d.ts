import { Mode } from "../mode";
import { Commit } from "../commit";
import { RegularGraphRows } from "./regular";
export { createGraphRows, RegularGraphRows as GraphRows };
declare function createGraphRows<TNode>(mode: Mode | undefined, commits: Array<Commit<TNode>>): RegularGraphRows<TNode>;
