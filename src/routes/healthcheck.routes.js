import { Router } from 'express';

import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();

router.route('/healthcheck').get(healthcheck);

export default router;