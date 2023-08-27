import { Commit } from "./commit";
export { Refs };
declare type Name = string;
declare class Refs {
    private commitPerName;
    private namesPerCommit;
    /**
     * Set a new reference to a commit hash.
     *
     * @param name Name of the ref (ex: "master", "v1.0")
     * @param commitHash Commit hash
     */
    set(name: Name, commitHash: Commit["hash"]): this;
    /**
     * Delete a reference
     *
     * @param name Name of the reference
     */
    delete(name: Name): this;
    /**
     * Get the commit hash associated with the given reference name.
     *
     * @param name Name of the ref
     */
    getCommit(name: Name): Commit["hash"] | undefined;
    /**
     * Get the list of reference names associated with given commit hash.
     *
     * @param commitHash Commit hash
     */
    getNames(commitHash: Commit["hash"]): Name[];
    /**
     * Get all reference names known.
     */
    getAllNames(): Name[];
    /**
     * Returns true if given commit hash is referenced.
     *
     * @param commitHash Commit hash
     */
    hasCommit(commitHash: Commit["hash"]): boolean;
    /**
     * Returns true if given reference name exists.
     *
     * @param name Name of the ref
     */
    hasName(name: Name): boolean;
    private removeNameFrom;
    private addNameTo;
    private addCommitTo;
}
