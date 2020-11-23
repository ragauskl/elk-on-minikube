"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpointNotFound = void 0;
const http_error_1 = require("../util/http-error");
function endpointNotFound(req, res, next) {
    const err = new http_error_1.default('Not Found', 404);
    res.status(err.status).send(err.message);
}
exports.endpointNotFound = endpointNotFound;
//# sourceMappingURL=endpoint-not-found.js.map