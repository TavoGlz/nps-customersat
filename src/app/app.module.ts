import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MetricComponent } from './metric/metric.component';
import { CloudantService } from './cloudant.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MyDateRangePickerModule } from 'mydaterangepicker';

@NgModule({
  declarations: [
    AppComponent,
    MetricComponent
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
