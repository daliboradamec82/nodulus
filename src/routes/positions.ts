import { Router } from 'express';
import { Position } from '../models/position.model';
import auth from '../middleware/auth';

const router = Router();

// Získání seznamu pozic
router.get('/', auth, async (req, res) => {
  try {
    console.log('Získání seznamu pozic');
    const positions = await Position.find();
    console.log('Pozice:', positions);
    res.json(positions);
  } catch (error) {
    console.error('Chyba při načítání pozic:', error);
    res.status(500).json({ message: 'Chyba při načítání pozic' });
  }
});

// Vytvoření nové pozice
router.post('/', auth, async (req, res) => {
  try {
    const { NamePosition, DescribePosition, Account, AnalyzePositions } = req.body;
    
    const position = new Position({
      NamePosition,
      DescribePosition,
      Account,
      AnalyzePositions
    });

    await position.save();
    res.status(201).json(position);
  } catch (error) {
    res.status(400).json({ message: 'Chyba při vytváření pozice' });
  }
});

// Aktualizace pozice
router.put('/:id', auth, async (req, res) => {
  try {
    const { NamePosition, DescribePosition, Account,AnalyzePositions } = req.body;
    
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      { NamePosition, DescribePosition, Account,AnalyzePositions },
      { new: true }
    );

    if (!position) {
      return res.status(404).json({ message: 'Pozice nenalezena' });
    }

    res.json(position);
  } catch (error) {
    res.status(400).json({ message: 'Chyba při aktualizaci pozice' });
  }
});

// Aktualizace pozice (POST)
router.post('/:id', auth, async (req, res) => {
  try {
    console.log('Aktualizace pozice - ID:', req.params.id);
    console.log('Aktualizace pozice - Body:', req.body);
    const { NamePosition, DescribePosition, Account,AnalyzePositions } = req.body;
    
    if (!NamePosition || !DescribePosition) {
      console.log('Chybějící povinná pole:', { NamePosition, DescribePosition });
      return res.status(400).json({ message: 'Chybí povinná pole NamePosition nebo DescribePosition' });
    }

    // Vytvoříme novou pozici s daným ID
    const position = new Position({
      _id: req.params.id,
      NamePosition,
      DescribePosition,
      Account: Account || '',
      AnalyzePositions: AnalyzePositions || []
    });

    // Použijeme findOneAndUpdate s upsert
    const updatedPosition = await Position.findOneAndUpdate(
      { _id: req.params.id },
      position,
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Úspěšně aktualizovaná pozice:', updatedPosition);
    res.json(updatedPosition);
  } catch (error: any) {
    console.error('Chyba při aktualizaci pozice:', error);
    res.status(400).json({ message: 'Chyba při aktualizaci pozice', error: error.message });
  }
});

// Smazání pozice
router.delete('/:id', auth, async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Pozice nenalezena' });
    }

    res.json({ message: 'Pozice byla úspěšně smazána' });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při mazání pozice' });
  }
});

export default router; 