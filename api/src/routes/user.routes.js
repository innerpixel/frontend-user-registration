import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
