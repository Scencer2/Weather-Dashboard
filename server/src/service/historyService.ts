import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../../db/searchHistory.json');

class City {
  constructor(public id: string, public name: string) {}
}

class HistoryService {
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as City[];
    } catch (error) {
      console.error('Error reading file:', error);
      return [];
    }
  }

  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing file:', error);
    }
  }

  public async getCities(): Promise<City[]> {
    return await this.read();
  }

  public async addCity(cityName: string): Promise<void> {
    const cities = await this.read();

    const exists = cities.some(city => city.name.toLowerCase() === cityName.toLowerCase());
    if (exists) return;

    const newCity = new City(uuidv4(), cityName);
    cities.push(newCity);
    await this.write(cities);
  }

  public async deleteCity(id: string): Promise<void> {
    const cities = await this.read();
    const filtered = cities.filter(city => city.id !== id);
    await this.write(filtered);
  }
}

export default new HistoryService();

