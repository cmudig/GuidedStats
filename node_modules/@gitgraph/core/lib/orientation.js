"use strict";
// Extracted from `gitgraph.ts` because it caused `utils` tests to fail
// because of circular dependency between `utils` and `template`.
// It's not clear why (the circular dependency still exist) but `Orientation`
// was the only one causing issue. Maybe because it's an enum?
Object.defineProperty(exports, "__esModule", { value: true });
var Orientation;
(function (Orientation) {
    Orientation["VerticalReverse"] = "vertical-reverse";
    Orientation["Horizontal"] = "horizontal";
    Orientation["HorizontalReverse"] = "horizontal-reverse";
})(Orientation = exports.Orientation || (exports.Orientation = {}));
//# sourceMappingURL=orientation.js.map