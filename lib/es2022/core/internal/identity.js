"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityException = exports.Identity = void 0;
class Identity {
    id;
    message;
    constructor(id, message) {
        this.id = id;
        this.message = message;
    }
}
exports.Identity = Identity;
exports.IdentityException = { id: 1, name: 'Exception' };
//# sourceMappingURL=identity.js.map