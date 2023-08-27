"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Refs {
    constructor() {
        this.commitPerName = new Map();
        this.namesPerCommit = new Map();
    }
    /**
     * Set a new reference to a commit hash.
     *
     * @param name Name of the ref (ex: "master", "v1.0")
     * @param commitHash Commit hash
     */
    set(name, commitHash) {
        const prevCommitHash = this.commitPerName.get(name);
        if (prevCommitHash) {
            this.removeNameFrom(prevCommitHash, name);
        }
        this.addNameTo(commitHash, name);
        this.addCommitTo(name, commitHash);
        return this;
    }
    /**
     * Delete a reference
     *
     * @param name Name of the reference
     */
    delete(name) {
        if (this.hasName(name)) {
            this.removeNameFrom(this.getCommit(name), name);
            this.commitPerName.delete(name);
        }
        return this;
    }
    /**
     * Get the commit hash associated with the given reference name.
     *
     * @param name Name of the ref
     */
    getCommit(name) {
        return this.commitPerName.get(name);
    }
    /**
     * Get the list of reference names associated with given commit hash.
     *
     * @param commitHash Commit hash
     */
    getNames(commitHash) {
        return this.namesPerCommit.get(commitHash) || [];
    }
    /**
     * Get all reference names known.
     */
    getAllNames() {
        return Array.from(this.commitPerName.keys());
    }
    /**
     * Returns true if given commit hash is referenced.
     *
     * @param commitHash Commit hash
     */
    hasCommit(commitHash) {
        return this.namesPerCommit.has(commitHash);
    }
    /**
     * Returns true if given reference name exists.
     *
     * @param name Name of the ref
     */
    hasName(name) {
        return this.commitPerName.has(name);
    }
    removeNameFrom(commitHash, nameToRemove) {
        const names = this.namesPerCommit.get(commitHash) || [];
        this.namesPerCommit.set(commitHash, names.filter((name) => name !== nameToRemove));
    }
    addNameTo(commitHash, nameToAdd) {
        const prevNames = this.namesPerCommit.get(commitHash) || [];
        this.namesPerCommit.set(commitHash, [...prevNames, nameToAdd]);
    }
    addCommitTo(name, commitHashToAdd) {
        this.commitPerName.set(name, commitHashToAdd);
    }
}
exports.Refs = Refs;
//# sourceMappingURL=refs.js.map