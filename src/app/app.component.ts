import { AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { CloudantService } from './cloudant.service';
import { Metric } from './metric/metric.model';
import { MetricComponent } from './metric/metric.component';

import {IMyDrpOptions, IMyDateRangeModel} from 'mydaterangepicker';
import { Observable } from 'rxjs/Observable';

import * as Moment from 'moment';
//import * as express from 'express';

//var app = require('./server').app;
declare var $:any;
//const app: express.Application = express();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit{
  @ViewChildren(MetricComponent)
  private metricInstances: QueryList<MetricComponent>;
  //@ViewChildren('input') inpt;

  squad = 'MXBI | Tequila';
  csat: Metric;
  nps: Metric;
  nps_metric: HTMLElement;
  csat_metric: HTMLElement;
  metrics: any = [];
  IterationsArr: any = [];
  is_logged: boolean = false;
  csat_sent: boolean = false;
  nps_sent: boolean = false;
  reload_csat: boolean = false;
  reload_nps: boolean = false;
  npstotal_shown: boolean = false;
  netProScore: number = 0;

  loginForm = new FormGroup({
    userCtrl: new FormControl(),
    passCtrl: new FormControl()
  });

  private settings = {
    actions: false,
    attr: { class: 'table-striped table-bordered' },
    noDataMessage: 'No data found',
    columns: {
      metric: { title: 'Metric' },
      score: { title: 'Score' },
      comment: { title: 'Comment', width: '50%' },
      created_at: { title: 'Date Submitted', sortDirection: 'desc' }
    },
    pager: { display: true, perPage: 8 }
  };

  private myDateRangePickerOptions: IMyDrpOptions = {
        dateFormat: 'yyyy/mm/dd',
        showApplyBtn: false,
        sunHighlight: false,
        alignSelectorRight: true
  };

  private myForm: FormGroup;

  constructor(public db: CloudantService, private formBuilder: FormBuilder) {
    this.csat = new Metric('csat', 'Tequila Squad');
    this.nps = new Metric('nps', 'Tequila Squad');
  }

  ngOnInit() {
    try{
      this.db.initCall();
      this.myForm = this.formBuilder.group({
        // Empty string means no initial value. Can be also specific date range for example:
        // {beginDate: {year: 2018, month: 10, day: 9}, endDate: {year: 2018, month: 10, day: 19}}
        // which sets this date range to initial value. It is also possible to set initial
        // value using the selDateRange attribute.

        myDateRange: ['', Validators.required],
        myItSelector: ''
      });
    } catch(except){
      console.log("Error on Init: "+except);
    }
  }

  ngAfterViewInit() {
    this.csat_metric = <HTMLElement>document.getElementById("csat-id");
    this.nps_metric = <HTMLElement>document.getElementById("nps-id");
    this.showMetric(true, true);
  }

  onSendSrvy(metric: JSON) {
    let isoDate = new Date().toISOString();
    let docId = 'metric:'+metric['metric']+':'+isoDate;
    let newDoc = {
      _id: docId,
      tag: 'survey',
      value: metric
    };
    this.db.addDocument(newDoc);
    if(metric['metric'] == "csat") this.csat_sent = true;
    if(metric['metric'] == "nps") this.nps_sent = true;
  }

  showMetric(csat_show, nps_show) {
    if (csat_show) {
      this.reload_csat = false;
      this.csat_metric.classList.remove('hidden');
      this.csat_metric.parentElement.parentElement.classList.add('div-top');
    }
    if (nps_show) {
      this.reload_nps = false;
      this.nps_metric.classList.remove('hidden');
      this.nps_metric.parentElement.parentElement.classList.add('div-bottom');
    }
  }

  private retrieveMetricsData(date1: any, date2: any) {
    this.metrics = [];
    this.db.getMetrics(date1, date2).then((data: any[]) => {
        this.settings = {
          actions: false,
          attr: { class: 'table-striped table-bordered' },
          noDataMessage: 'No data found',
          columns: {
            metric: { title: 'Metric' },
            score: { title: 'Score' },
            comment: { title: 'Comment', width: '50%' },
            created_at: { title: 'Date Submitted', sortDirection: 'desc' }
          },
          pager: { display: true, perPage: 8 }
        };
        if(data['rows'].length > 0) {
          for (let i=0; i<data['rows'].length; i++) {
              this.metrics.push(data['rows'][i].value);
          }
          let npsFilter = this.metrics.filter((metric) => metric.metric === "nps");
          this.setNetProScore(npsFilter);
        } else {
          this.npstotal_shown = false;
        }
    }).catch((ex) => {
      console.error('Error fetching metrics', ex);
    });
  }

  private showLoginModal(){
    $('#login-modal').modal();
    //this.inpt['_results']['0'].nativeElement.focus();
  }

  private authLogin() {
    let validUser = false;
    let validPass = false;
    let user = this.loginForm.get('userCtrl').value;
    let pass = this.loginForm.get('passCtrl').value;
    if(user != null && user != ""){
      if(pass != null && pass != "") {
        this.db.getCredentials().then((data: any[]) => {
          for (let i=0; i<data['value'].length; i++) {
            if(user === data['value'][i].user){validUser = true};
            if(pass === data['value'][i].password){validPass = true};
          }
          if(validUser && validPass){
            this.is_logged = true;
            this.retrieveMetricsData("", "");
            this.getIterations("2017/03/08", 10, false);
            $('#login-modal').modal("hide");
            this.loginForm.reset();
            this.metricInstances['_results']['0'].exit();
            this.metricInstances['_results']['1'].exit();
            this.csat_sent = false;
            this.nps_sent = false;
            this.npstotal_shown = false;
          } else {
            alert("ACCESS DENIED\n Unknown credentials");
          }
        }).catch((ex) => {
          console.error('Error fetching credentials', ex);
        });
      } else {
        alert("Pasword required");
      }
    } else {
      alert("User input is empty");
    }
  }

  private logOut() {
    this.is_logged = false;
    this.showMetric(true, true);
  }

  private reloadSurvey(re: boolean, metric: string) {
    if(!this.is_logged) {
      if(metric === 'csat') {
        this.reload_csat = re;
      }
      if(metric === 'nps') {
        this.reload_nps = re;
      }
    }
  }

  private onDateRangeChanged(event: IMyDateRangeModel) {
    if (event.formatted !== null && event.formatted !== "") {
      let startd = event.formatted.substring(0,10);
      let endd = event.formatted.substring(13);
      this.retrieveMetricsData(startd, endd);
      this.npstotal_shown = true;
      $("#slciterat")[0].selectedIndex = 0;
    } else {
      this.retrieveMetricsData("", "");
      this.npstotal_shown = false;
      $("#slciterat")[0].selectedIndex = 0;
    }
  }

  private setNetProScore(npsArr: any[]) {
    if(npsArr.length > 0) {
      let detractors = [];
      let promoters = [];
      let pasives = [];
      let npsSum = 0;
      let npsTotal = 0;
      let scoreVal = 0;
      for (let i=0; i<npsArr.length; i++) {
          scoreVal = Number(npsArr[i].score);
          if(scoreVal >= 0 && scoreVal <= 6) {
            detractors.push(scoreVal);
            npsSum += 1;
          };
          if(scoreVal === 7 || scoreVal === 8) {
            pasives.push(scoreVal);
            npsSum += 1;
          };
          if(scoreVal === 9 || scoreVal === 10) {
            promoters.push(scoreVal);
            npsSum += 1;
          };
      }
      //console.log(detractors.length+" + "+pasives.length+" + "+promoters.length+" = "+(detractors.length+pasives.length+promoters.length));
      //console.log(((promoters.length * 100)/npsSum)+" - "+((detractors.length * 100)/npsSum)+" = "+(((promoters.length * 100)/npsSum) - ((detractors.length * 100)/npsSum)));
      npsTotal = ((promoters.length * 100)/npsSum) - ((detractors.length * 100)/npsSum);
      this.netProScore = Number(npsTotal.toFixed(2));
    } else {
      this.netProScore = 0;
      this.npstotal_shown = false;
    }
  }
  private getIterations(itsstart: any, itduration: Number, skipholidays: boolean) {
    // Get available iteration days
    let validItDays = [];
    let currentYear = Moment().year(); // Current year
    let firstDayY = Moment().startOf('year').format("YYYY[/]MM[/]DD"); //First day of year
    let momentDate = Moment(firstDayY, "YYYY[/]MM[/]DD"); // MomentJS Object
    let dayOfWeek = Moment(momentDate).format("dddd"); // Sunday, ..., Saturday

    let cstmFrmtDate = Moment(momentDate).format("YYYY[/]MM[/]DD"); // Custom format date YYYY/MM/DD
    let lastDayY = Number(Moment().endOf("year").format("DDD")); // Last day of year
    let holiDays = [currentYear+"/01/01", currentYear+"/02/06", currentYear+"/03/20", currentYear+"/05/01", // Holidays by law
                    currentYear+"/09/16", currentYear+"/11/20", currentYear+"/12/25"];

    for (let i = 1; i < lastDayY; i++) {
      momentDate = Moment(momentDate).add(1, 'days');
      dayOfWeek = Moment(momentDate).format("dddd");
      cstmFrmtDate = Moment(momentDate).format("YYYY[/]MM[/]DD");

      if (dayOfWeek !== "Saturday" && dayOfWeek !== "Sunday") { // Skip weekends
        if (skipholidays) { // Skip holidays if true
          if (!holiDays.includes(cstmFrmtDate)) {
            validItDays.push(cstmFrmtDate);
          }
        } else { // Don't skip holidays
          validItDays.push(cstmFrmtDate);
        }
      }
    }

    // Get iterations
    let itsStart = itsstart // Iterations starting day.
    let itDuration = itduration; //Iteration length in days
    let itNumber = 1; // Incremental var to set iteration number
    let frstItDay = ""; // Temp var to get 1st iteration day
    let lastItDay = ""; // Temp var to get 10th iteration day
    let fidArray = {}; // frstItDay array-formated for range-datetime-picker
    let lidArray = {}; // lastItDay array-formated for range-datetime-picker
    let dayCounter = 1; // Temp support var to know 1st and 10th day of each iteration

    if (validItDays.includes(itsStart)) {
      let x = validItDays.indexOf(itsStart);
      for (let i = x; i < validItDays.length; i++) {
        frstItDay = (dayCounter === 1) ? validItDays[i]: frstItDay;
        lastItDay = (dayCounter === itDuration) ? validItDays[i]: lastItDay;
        dayCounter++;
        if (frstItDay !== "" && lastItDay !== "") {
          fidArray = {year: Moment(frstItDay, "YYYY[/]MM[/]DD").year(), month: Moment(frstItDay, "YYYY[/]MM[/]DD").month()+1, day: Moment(frstItDay, "YYYY[/]MM[/]DD").date()};
          lidArray = {year: Moment(lastItDay, "YYYY[/]MM[/]DD").year(), month: Moment(lastItDay, "YYYY[/]MM[/]DD").month()+1, day: Moment(lastItDay, "YYYY[/]MM[/]DD").date()};
          this.IterationsArr.push([itNumber, frstItDay, lastItDay, fidArray, lidArray]);
          itNumber++;
          frstItDay = ""; lastItDay = "";
          dayCounter = 1;
        }
      }
    }
  }

  private OnItSelected(value) {
    if (value !== "-") {
      let index = Number(value);
      let first = this.IterationsArr[index][1];
      let last = this.IterationsArr[index][2];
      let firstFormated = this.IterationsArr[index][3];
      let lastFormated = this.IterationsArr[index][4];
      this.retrieveMetricsData(first, last);
      this.myForm.setValue({myDateRange: {beginDate: firstFormated, endDate: lastFormated}, myItSelector: index});
      this.npstotal_shown = true;
    }
  }
}
