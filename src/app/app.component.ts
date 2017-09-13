import { AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { CloudantService } from './cloudant.service';
import { LoginAuth } from './sso.service';
import { Metric } from './metric/metric.model';
import { MetricComponent } from './metric/metric.component';

import {IMyDrpOptions, IMyDateRangeModel} from 'mydaterangepicker';
import { Observable } from 'rxjs/Observable';

declare var $:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit{
  @ViewChildren(MetricComponent)
  private metricInstances: QueryList<MetricComponent>;
  //@ViewChildren('input') inpt;

  title = 'NPS & Client Satisfaction';
  csat: Metric;
  nps: Metric;
  nps_metric: HTMLElement;
  csat_metric: HTMLElement;
  metrics: any = [];
  metricsArr = [];
  is_logged: boolean = false;
  csat_sent: boolean = false;
  nps_sent: boolean = false;
  reload_csat: boolean = false;
  reload_nps: boolean = false;
  netProScore: number = 0;

  loginForm= new FormGroup({
    userCtrl: new FormControl(),
    passCtrl: new FormControl()
  });

  settings = {
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

  constructor(public db: CloudantService, private formBuilder: FormBuilder, private sso: LoginAuth) {
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

        myDateRange: ['', Validators.required]
        // other controls are here...
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
            $('#login-modal').modal("hide");
            this.loginForm.reset();
            this.metricInstances['_results']['0'].exit();
            this.metricInstances['_results']['1'].exit();
            this.csat_sent = false;
            this.nps_sent = false;
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
    } else {
      this.retrieveMetricsData("", "");
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
    }
  }
}
