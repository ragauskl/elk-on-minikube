"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
class HttpError {
    constructor(message, code = 500, redirect = false) {
        this.setContext = (data) => {
            this.context = data;
        };
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
        this.status = code;
        this.redirect = redirect;
    }
}
exports.default = HttpError;
util.inherits(HttpError, Error);
//# sourceMappingURL=http-error.js.map