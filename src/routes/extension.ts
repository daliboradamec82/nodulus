import express from 'express';
import { Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();

// Proměnná pro ukládání dat
let lastReceivedData: any = null;
let lastLogTime: number = 0;

// GET endpoint pro získání dat
router.get('/data', (req, res) => {
  const currentTime = Date.now();
  // Logujeme pouze jednou za 5 sekund
  if (currentTime - lastLogTime > 5000) {
    console.log('Backend: GET požadavek na /api/extension/data');
    console.log('Backend: Aktuální data:', lastReceivedData);
    lastLogTime = currentTime;
  }
  
  if (!lastReceivedData) {
    return res.json({
      success: true,
      data: [
        'Žádná data zatím nejsou k dispozici',
        'Počkejte na aktualizaci z rozšíření'
      ]
    });
  }

  res.json({
    success: true,
    data: lastReceivedData
  });
});

// POST endpoint pro příjem dat z rozšíření
router.post('/data', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { url, textContent } = req.body;

    let textToSend;
    if (Array.isArray(textContent)) {
      textToSend = textContent.join(' ');
    } else {
      textToSend = textContent;
    }

    // Připrav payload pro externí server
    const payload = {
      project_name: 'TestProject',
      label_name: 'SEO Specialist',
      texts: [textToSend]
    };
    let mappedData;

    // Pošli požadavek na externí server
    if(true){ const response = await axios.post('http://localhost:8000/predictAll', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Přemapuj odpověď do požadovaného formátu
      mappedData = response.data[0].predictions.map((item: any) => ({
        position: item.label,
        score: item.score,
        location: '',
        selected: false
      }));
    } else{
      mappedData = getRandomData();
    }
    console.log('Sending response data:', mappedData);

    res.json({
      success: true,
      data: mappedData
    });
  } catch (error) {
    console.error('Backend: Chyba při zpracování dat:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při zpracování dat'
    });
  }
});


// Funkce pro náhodné promíchání pole
function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Základní pole pozic
const basePositions = [
  "Data Scientist",
  "Machine Learning Engineer", 
  "AI Research Engineer",
  "Data Engineer",
  "MLOps Engineer",
  "AI Product Manager"
];

// Získání náhodně promíchaného pole pozic
const getRandomizedPositions = () => shuffleArray(basePositions);

function getRandomData() {
  const positions = getRandomizedPositions();
  const locations = ["Praha", "Brno", "Olomouc", "Zlín"];
  
  return positions.map(position => ({
    position,
    location: locations[Math.floor(Math.random() * locations.length)],
    score: Math.floor(Math.random() * (200000 - 80000) + 80000)/10000,
    company: `Company ${Math.floor(Math.random() * 100)}`
  }));
}

export default router; 