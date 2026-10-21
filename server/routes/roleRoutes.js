import express from 'express';
import { getRoles, createRole } from '../controllers/roleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all routes with JWT authentication
router.use(protect);

router.route('/')
  .get(getRoles)
  .post(createRole);

export default router;
