import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public description: string,
    public temperature: number,
    public humidity: number,
    public windSpeed: number
  ) {}
}

class WeatherService {
  private baseGeocodeURL = 'http://api.openweathermap.org/geo/1.0/direct';
  private baseWeatherURL = 'https://api.openweathermap.org/data/2.5/forecast';
  private apiKey = process.env.OPENWEATHER_API_KEY!;

  private async fetchLocationData(query: string) {
    const url = `${this.baseGeocodeURL}?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data[0];
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseWeatherURL}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    const response = await axios.get(url);
    return response.data;
  }

  private parseCurrentWeather(response: any): Weather {
    const current = response.list[0];
    return new Weather(
      response.city.name,
      current.dt_txt,
      current.weather[0].icon,
      current.weather[0].description,
      current.main.temp,
      current.main.humidity,
      current.wind.speed
    );
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecast: Weather[] = [];
    for (let i = 7; i < weatherData.length; i += 8) {
      const data = weatherData[i];
      const w = new Weather(
        currentWeather.city,
        data.dt_txt,
        data.weather[0].icon,
        data.weather[0].description,
        data.main.temp,
        data.main.humidity,
        data.wind.speed
      );
      forecast.push(w);
    }
    return forecast;
  }

  public async getWeatherForCity(city: string) {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    const weatherData = await this.fetchWeatherData(coordinates);
    const current = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(current, weatherData.list);
    return {
      current,
      forecast,
    };
  }
}

export default new WeatherService();
