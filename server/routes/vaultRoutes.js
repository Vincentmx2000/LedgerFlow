import express from 'express';
import {
  getVaults,
  getVaultById,
  createVault,
  addCashToVault,
  claimVault,
  deleteVault,
} from '../controllers/vaultController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all vault routes with JWT authentication
router.use(protect);

router.route('/')
  .get(getVaults)
  .post(createVault);

router.route('/:id')
  .get(getVaultById)
  .delete(deleteVault);

router.route('/:id/add-cash')
  .post(addCashToVault);

router.route('/:id/claim')
  .put(claimVault);

export default router;
