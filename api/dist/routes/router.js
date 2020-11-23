"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router({ mergeParams: true });
exports.default = router;
router.get('/', (req, res) => {
    res.status(200).send('Health check OK.');
});
//# sourceMappingURL=router.js.map