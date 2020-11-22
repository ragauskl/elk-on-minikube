import { Router } from 'express';
const router = Router({ mergeParams: true });
export default router;
router.get('/', (req, res) => {
    res.status(200).send('Health check OK.');
});
//# sourceMappingURL=router.js.map