import express from 'express';
import {
  getSplitCollections,
  getSplitCollectionById,
  createSplitCollection,
  updateParticipantStatus,
  deleteSplitCollection,
} from '../controllers/splitCollectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all split collection routes with JWT authentication
router.use(protect);

router.route('/')
  .get(getSplitCollections)
  .post(createSplitCollection);

router.route('/:id')
  .get(getSplitCollectionById)
  .delete(deleteSplitCollection);

router.route('/:id/participants/:participantId/status')
  .put(updateParticipantStatus)
  .patch(updateParticipantStatus);

export default router;
