import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WeatherComponent} from "./weather.component";
import {RouterModule, Routes} from "@angular/router";
import {HttpClientJsonpModule, HttpClientModule} from "@angular/common/http";
import {GoogleMapsModule} from "@angular/google-maps";

const routes: Routes = [
  {
    path: '',
    component: WeatherComponent
  }
];


@NgModule({
  declarations: [
    WeatherComponent
  ],
  imports: [
    CommonModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    RouterModule.forChild(routes)
  ]
})
export class WeatherModule { }
