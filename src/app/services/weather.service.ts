import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Gets current weather
   */
  getCurrentWeather(data?: any): Observable<any> {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=hourly,daily&units=metrics&appid=${environment.openWeatherApiKey}`;
    return this.http.get(url);
  }

  /**
   * Gets historical weather
   * data - contains - lat, long, dt
   */
  getWeatherHistory(data?: any): Observable<any> {
    const url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${data.lat}&lon=${data.lon}&dt=${data.dt}&appid=${environment.openWeatherApiKey}`
    return this.http.get(url);
  }
}
