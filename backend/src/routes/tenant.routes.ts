import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('super_admin'), async (req, res) => {
  res.json({ message: 'Get all tenants - To be implemented' });
});

router.post('/', authorize('super_admin'), async (req, res) => {
  res.json({ message: 'Create tenant - To be implemented' });
});

router.get('/:id', async (req, res) => {
  res.json({ message: 'Get tenant by ID - To be implemented' });
});

router.put('/:id', authorize('super_admin', 'admin'), async (req, res) => {
  res.json({ message: 'Update tenant - To be implemented' });
});

export default router;
