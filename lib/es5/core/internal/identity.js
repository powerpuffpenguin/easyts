"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityException = exports.Identity = void 0;
var Identity = /** @class */ (function () {
    function Identity(id, message) {
        this.id = id;
        this.message = message;
    }
    return Identity;
}());
exports.Identity = Identity;
exports.IdentityException = { id: 1, name: 'Exception' };
//# sourceMappingURL=identity.js.map