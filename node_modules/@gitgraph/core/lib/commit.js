"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_1 = require("./tag");
/**
 * Generate a random hash.
 *
 * @return hex string with 40 chars
 */
const getRandomHash = () => (Math.random().toString(16).substring(3) +
    Math.random().toString(16).substring(3) +
    Math.random().toString(16).substring(3) +
    Math.random().toString(16).substring(3)).substring(0, 40);
class Commit {
    constructor(options) {
        /**
         * Ref names
         */
        this.refs = [];
        /**
         * Commit x position
         */
        this.x = 0;
        /**
         * Commit y position
         */
        this.y = 0;
        // Set author & committer
        let name, email;
        try {
            [, name, email] = options.author.match(/(.*) <(.*)>/);
        }
        catch (e) {
            [name, email] = [options.author, ""];
        }
        this.author = { name, email, timestamp: Date.now() };
        this.committer = { name, email, timestamp: Date.now() };
        // Set commit message
        this.subject = options.subject;
        this.body = options.body || "";
        // Set commit hash
        this.hash = options.hash || getRandomHash();
        this.hashAbbrev = this.hash.substring(0, 7);
        // Set parent hash
        this.parents = options.parents ? options.parents : [];
        this.parentsAbbrev = this.parents.map((commit) => commit.substring(0, 7));
        // Set style
        this.style = Object.assign({}, options.style, { message: Object.assign({}, options.style.message), dot: Object.assign({}, options.style.dot) });
        this.dotText = options.dotText;
        // Set callbacks
        this.onClick = () => (options.onClick ? options.onClick(this) : undefined);
        this.onMessageClick = () => options.onMessageClick ? options.onMessageClick(this) : undefined;
        this.onMouseOver = () => options.onMouseOver ? options.onMouseOver(this) : undefined;
        this.onMouseOut = () => options.onMouseOut ? options.onMouseOut(this) : undefined;
        // Set custom renders
        this.renderDot = options.renderDot;
        this.renderMessage = options.renderMessage;
        this.renderTooltip = options.renderTooltip;
    }
    /**
     * Message
     */
    get message() {
        let message = "";
        if (this.style.message.displayHash) {
            message += `${this.hashAbbrev} `;
        }
        message += this.subject;
        if (this.style.message.displayAuthor) {
            message += ` - ${this.author.name} <${this.author.email}>`;
        }
        return message;
    }
    /**
     * Branch that should be rendered
     */
    get branchToDisplay() {
        return this.branches ? this.branches[0] : "";
    }
    setRefs(refs) {
        this.refs = refs.getNames(this.hash);
        return this;
    }
    setTags(tags, getTagStyle, getTagRender) {
        this.tags = tags
            .getNames(this.hash)
            .map((name) => new tag_1.Tag(name, getTagStyle(name), getTagRender(name), this.style));
        return this;
    }
    setBranches(branches) {
        this.branches = branches;
        return this;
    }
    setPosition({ x, y }) {
        this.x = x;
        this.y = y;
        return this;
    }
    withDefaultColor(color) {
        const newStyle = Object.assign({}, this.style, { dot: Object.assign({}, this.style.dot), message: Object.assign({}, this.style.message) });
        if (!newStyle.color)
            newStyle.color = color;
        if (!newStyle.dot.color)
            newStyle.dot.color = color;
        if (!newStyle.message.color)
            newStyle.message.color = color;
        const commit = this.cloneCommit();
        commit.style = newStyle;
        return commit;
    }
    /**
     * Ideally, we want Commit to be a [Value Object](https://martinfowler.com/bliki/ValueObject.html).
     * We started with a mutable class. So we'll refactor that little by little.
     * This private function is a helper to create a new Commit from existing one.
     */
    cloneCommit() {
        const commit = new Commit({
            author: `${this.author.name} <${this.author.email}>`,
            subject: this.subject,
            style: this.style,
            body: this.body,
            hash: this.hash,
            parents: this.parents,
            dotText: this.dotText,
            onClick: this.onClick,
            onMessageClick: this.onMessageClick,
            onMouseOver: this.onMouseOver,
            onMouseOut: this.onMouseOut,
            renderDot: this.renderDot,
            renderMessage: this.renderMessage,
            renderTooltip: this.renderTooltip,
        });
        commit.refs = this.refs;
        commit.branches = this.branches;
        commit.tags = this.tags;
        commit.x = this.x;
        commit.y = this.y;
        return commit;
    }
}
exports.Commit = Commit;
//# sourceMappingURL=commit.js.map