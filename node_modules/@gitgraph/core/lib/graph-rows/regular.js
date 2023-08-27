"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RegularGraphRows {
    constructor(commits) {
        this.rows = new Map();
        this.maxRowCache = undefined;
        this.computeRowsFromCommits(commits);
    }
    getRowOf(commitHash) {
        return this.rows.get(commitHash) || 0;
    }
    getMaxRow() {
        if (this.maxRowCache === undefined) {
            this.maxRowCache = uniq(Array.from(this.rows.values())).length - 1;
        }
        return this.maxRowCache;
    }
    computeRowsFromCommits(commits) {
        commits.forEach((commit, i) => {
            this.rows.set(commit.hash, i);
        });
        this.maxRowCache = undefined;
    }
}
exports.RegularGraphRows = RegularGraphRows;
/**
 * Creates a duplicate-free version of an array.
 *
 * Don't use lodash's `uniq` as it increased bundlesize a lot for such a
 * simple function.
 * => The way we bundle for browser seems not to work with `lodash-es`.
 * => I didn't to get tree-shaking to work with `lodash` (the CommonJS version).
 *
 * @param array Array of values
 */
function uniq(array) {
    const set = new Set();
    array.forEach((value) => set.add(value));
    return Array.from(set);
}
//# sourceMappingURL=regular.js.map