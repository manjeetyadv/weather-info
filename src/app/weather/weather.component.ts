import {Component, OnInit, ViewChild} from '@angular/core';
import {WeatherService} from "../services/weather.service";
import * as moment from "moment";
import {Moment} from "moment";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {MapInfoWindow} from "@angular/google-maps";

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {

  /**
   * Weather Data (Using any as of now.)
   */
  weatherData: any;

  /**
   * History Weather data (Using any as of now.)
   */
  weatherHistoryData: Array<any> = [];

  /**
   * Weather type
   * 'daily'|'historical'|'map'
   */
  weatherType: 'daily' | 'historical' | 'map' = 'daily';

  /**
   * To show loading
   */
  showLoader = false;

  /**
   * Weather Image Icon Url
   */
  imageUrl: string | undefined;

  /**
   * Moment ref
   */
  moment: Moment = moment();

  /**
   * To store Day and date string.
   */
  dateData = {
    dayString: '',
    dateString: ''
  };

  /**
   * To store current location
   */
  currentPosition = {
    lat: 0,
    long: 0
  }

  /**
   * To store last 5 days of date.
   */
  last5DaysDate: Array<number> = [];

  /**
   * Store date and day for historical weather.
   */
  storeDates: Array<{ day: string, date: string }> = [];

  /**
   * Stores loading status of google map api.
   */
  apiLoaded: Observable<boolean>;

  /**
   * Map Options
   */
  mapOptions = {
    center: {lat: 0, lng: 0},
    zoom: 10
  };

  marker = {
    position: {
      lat: 0,
      lng: 0
    }
  }

  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  /**
   * To store boolean value if location has been loaded or not
   */
  locationLoaded = false;

  /**
   * Show location fail text.
   */
  showLocationFailText = false;

  constructor(
    private weatherService: WeatherService,
    private httpClient: HttpClient
  ) {
    this.getCurrentLocation();
  }

  ngOnInit(): void {
    this.changeWeatherType('daily');
  }

  /**
   * Change Weather Type
   * @param type Type of weather like map, daily, historical
   */
  changeWeatherType(type: 'daily' | 'historical' | 'map') {
    this.showLoader = true;
    this.weatherType = type;

    this.resetValues();

    switch (type) {
      case "daily":
        this.getDailyForeCast();
        break;
      case "historical":
        this.initHistoricalData();
        break;
      case "map":
        this.initMap();
        break;
    }
  }

  /**
   * Get daily Forecast
   */
  getDailyForeCast() {
    const payload = {
      lat: this.currentPosition.lat,
      lon: this.currentPosition.long
    };
    this.weatherService.getCurrentWeather(payload).subscribe({
      next: (data: any) => {
        this.weatherData = data.current;
        this.dateData.dayString = this.getDayFormat(this.weatherData.dt);
        this.dateData.dateString = this.getDateFormat(this.weatherData.dt);
        this.imageUrl = this.getImageUrl(this.weatherData.weather?.[0].icon);
      },
      complete: () => {
        this.showLoader = false;
      }
    });
  }

  /**
   * Get Historical weather data
   */
  initHistoricalData() {
    for (let i = 1; i <= 5; i++) {
      this.last5DaysDate.push(moment().subtract(i, 'days').unix());
    }

    this.last5DaysDate.forEach((date) => {
      const payload = {
        lat: this.currentPosition.lat,
        lon: this.currentPosition.long,
        dt: date,
      };

      this.getHistoricalData(payload).then();
    });
  }

  /**
   * Get Historical Data
   */
  getHistoricalData(payload: { lat: number, lon: number, dt: number }) {
    return new Promise((resolve) => {
      this.weatherService.getWeatherHistory(payload).subscribe({
        next: (data: any) => {
          this.weatherHistoryData.push(data);
          this.storeDates.push({
            date: this.getDateFormat(data.current.dt),
            day: this.getDayFormat(data.current.dt)
          });
          resolve(data);
        },
        complete: () => {
          this.showLoader = false;
        }
      });
    });
  }

  /**
   * Get current location coordinates
   */
  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.currentPosition.lat = position.coords.latitude;
      this.currentPosition.long = position.coords.longitude;
      this.setMarkerPosition();
      this.locationLoaded = true;
    }, () => {
      this.setMarkerPosition();
    });
  }

  /**
   * Returns URL of an weather icon image.
   * @param icon image
   */
  getImageUrl(icon: string) {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  /**
   * Returns day
   * @param time
   */
  getDateFormat(time: number) {
    return moment.unix(time).format("DD/MM/YYYY")
  }

  /**
   * Returns day
   * @param time
   */
  getDayFormat(time: number) {
    return moment.unix(time).format("dddd")
  }

  /**
   * Reset values of weather data.
   */
  resetValues() {
    this.weatherHistoryData = [];
    this.last5DaysDate = [];
  }

  /**
   * Initiate map
   */
  private initMap() {
    this.showLoader = false;
    if (!this.apiLoaded) {
      this.apiLoaded = this.httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyDgd53DuN0JwnzHuPJN2yDCgg7vfJPuz0M', 'callback')
        .pipe(
          map(() => true)
        );
    }
  }

  openInfo(marker: any) {
    this.infoWindow.open(marker)
  }

  setMarkerPosition() {
    this.marker.position.lat = this.currentPosition.lat;
    this.marker.position.lng = this.currentPosition.long;
    this.mapOptions.center.lat = this.currentPosition.lat;
    this.mapOptions.center.lng = this.currentPosition.long;

    setTimeout(() => {
      if ((this.marker.position.lat === 0) && (this.marker.position.lng === 0)) {
        this.showLocationFailText = true;
      }
    }, 5000);
  }
}
