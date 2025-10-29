import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the tenant
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Create Project model and service
    // For now, return mock data that matches frontend expectations
    const projects = [
      { id: '1', name: 'Project Alpha', code: 'PA', active: true },
      { id: '2', name: 'Project Beta', code: 'PB', active: true },
      { id: '3', name: 'Project Gamma', code: 'PG', active: true },
      { id: '4', name: 'Internal', code: 'INT', active: true },
      { id: '5', name: 'Training', code: 'TRN', active: true }
    ];

    res.json({
      success: true,
      data: projects
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // TODO: Implement when Project model exists
    res.json({
      success: true,
      data: { id: req.params.id, name: 'Project', code: 'PRJ', active: true }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
});

export default router;
