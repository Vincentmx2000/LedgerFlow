import express from 'express';
import {
  getPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} from '../controllers/personController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all routes with JWT authentication
router.use(protect);

router.route('/')
  .get(getPeople)
  .post(createPerson);

router.route('/:id')
  .get(getPersonById)
  .put(updatePerson)
  .delete(deletePerson);

export default router;
