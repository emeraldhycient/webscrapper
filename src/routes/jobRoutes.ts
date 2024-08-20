import { Router } from 'express';
import { startCrawling } from '../controllers/jobController';

const router = Router();
router.post('/crawl', startCrawling);

export default router;
