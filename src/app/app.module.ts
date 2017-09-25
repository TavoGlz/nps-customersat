import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MyDateRangePickerModule } from 'mydaterangepicker';

import { AppComponent } from './app.component';
import { MetricComponent } from './metric/metric.component';
import { CloudantService } from './cloudant.service';

@NgModule({
  declarations: [
    AppComponent,
    MetricComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    Ng2SmartTableModule,
    MyDateRangePickerModule
  ],
  providers: [
    CloudantService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
