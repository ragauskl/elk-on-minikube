"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require("morgan");
const endpoint_not_found_1 = require("./middleware/endpoint-not-found");
const router_1 = require("./routes/router");
const app = express();
app.use(morgan('combined'));
app.use(router_1.default);
app.use(endpoint_not_found_1.endpointNotFound);
app.listen(3000, () => {
    console.log('API Listening on port 3000.');
});
//# sourceMappingURL=index.js.map