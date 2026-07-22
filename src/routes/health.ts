import { Router } from 'express';
import { getCurrentTimestamp } from '../utils/helpers';

const router = Router();

router.get("/", (_req, res) => {
  res.json({ 
    status: "ok", 
    service: "oxetech-helpdesk",
    timestamp: getCurrentTimestamp()
  });
});

export default router;