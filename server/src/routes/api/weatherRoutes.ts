import { Router, Request, Response } from 'express';
import WeatherService from '../../service/weatherService';
import HistoryService from '../../service/historyService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const weather = await WeatherService.getWeatherForCity(city);
    await HistoryService.addCity(city);
    res.json(weather);
  } catch (error) {
    console.error('Error getting weather data:', error);
    res.status(500).json({ error: 'Failed to get weather data' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

router.delete('/history/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    await HistoryService.deleteCity(id);
    res.json({ message: 'City deleted from history' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

export default router;

