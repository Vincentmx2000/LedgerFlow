import express from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  markPlanCompleted,
  deletePlan,
} from '../controllers/planController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all plan routes with JWT authentication
router.use(protect);

router.route('/')
  .get(getPlans)
  .post(createPlan);

router.route('/:id')
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

router.route('/:id/complete')
  .put(markPlanCompleted)
  .patch(markPlanCompleted);

export default router;
