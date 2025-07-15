import { Router } from 'express';
import User from '../models/User';
import auth from '../middleware/auth';

const router = Router();

// GET /api/users - Získat všechny uživatele
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Vynecháme heslo z výsledků
    res.json(users);
  } catch (error) {
    console.error('Chyba při načítání uživatelů:', error);
    res.status(500).json({ message: 'Interní chyba serveru' });
  }
});

// PATCH /api/users/:id - Aktualizovat roli uživatele
router.patch('/:id', auth, async (req, res) => {
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

// DELETE /api/users/:id - Smazat uživatele
router.delete('/:id', auth, async (req, res) => {
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