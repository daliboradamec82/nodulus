import { Router } from 'express';
import User from '../models/User';
import auth from '../middleware/auth';
import { requireAdmin, requireSuperAdmin, requirePermission } from '../middleware/role.middleware';
import { PaginationUtils } from '../utils/pagination.utils';

const router = Router();

// GET /api/users - Získat všechny uživatele (pouze admin)
router.get('/', auth, requirePermission('manage_users'), async (req, res) => {
  try {
    const paginationOptions = PaginationUtils.getPaginationOptions(req);
    
    // Získání celkového počtu uživatelů
    const total = await User.countDocuments({});
    
    // Získání uživatelů s pagination
    const users = await User.find({}, '-password')
      .skip(paginationOptions.skip)
      .limit(paginationOptions.limit)
      .sort({ createdAt: -1 });
    
    // Nastavení pagination hlaviček
    PaginationUtils.setPaginationHeaders(res, total, paginationOptions);
    
    // Vrácení paginated response
    const response = PaginationUtils.createPaginatedResponse(users, total, paginationOptions);
    res.json(response);
  } catch (error) {
    console.error('Chyba při načítání uživatelů:', error);
    res.status(500).json({ message: 'Interní chyba serveru' });
  }
});

// PATCH /api/users/:id - Aktualizovat roli uživatele (pouze super admin)
router.patch('/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Chyba při aktualizaci role uživatele:', error);
    res.status(500).json({ message: 'Interní chyba serveru' });
  }
});

// DELETE /api/users/:id - Smazat uživatele (pouze admin)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Uživatel nenalezen' });
    }
    
    // Zakážeme smazání superAdmin účtu
    if (user.role === 'superAdmin') {
      return res.status(403).json({ message: 'Nelze smazat superAdmin účet' });
    }
    
    await user.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error('Chyba při mazání uživatele:', error);
    res.status(500).json({ message: 'Interní chyba serveru' });
  }
});

export default router; 