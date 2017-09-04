import { AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { CloudantService } from './cloudant.service';
import { Metric } from './metric/metric.model';
import { MetricComponent } from './metric/metric.component';

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

  loginForm= new FormGroup({
    userCtrl: new FormControl(),
    passCtrl: new FormControl()
  });

  settings = {
    actions: false,
    attr: {
        class: 'table-striped table-bordered',
    },
    noDataMessage: 'No data found',
    columns: {
      metric: {
        title: 'Metric'
      },
      score: {
        title: 'Score'
      },
      comment: {
        title: 'Comment',
        width: '50%'
      },
      created_at: {
        title: 'Date Created',
        sortDirection: 'desc'
      }
    },
    pager: {
        display: true,
        perPage: 5,
    }
  };

  constructor(public db: CloudantService) {
    this.csat = new Metric('csat', 'Tequila Squad');
    this.nps = new Metric('nps', 'Tequila Squad');
  }

  ngOnInit() {
    this.db.initCall();
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

  retrieveMetricsData() {
    this.metrics = [];
    this.db.getMetrics().then((data: any[]) => {
        this.settings = {
          actions: false,
          attr: {
              class: 'table-striped table-bordered',
          },
          noDataMessage: 'No data found',
          columns: {
            metric: {
              title: 'Metric'
            },
            score: {
              title: 'Score'
            },
            comment: {
              title: 'Comment',
              width: '50%'
            },
            created_at: {
              title: 'Date Created',
              sortDirection: 'desc'
            }
          },
          pager: {
              display: true,
              perPage: 5,
          }
        };
        for (let i = 0; i < data['total_rows']; i++) {
            this.metrics.push(data['rows'][i].value);
        }
    }).catch((ex) => {
      console.error('Error fetching metrics', ex);
    });
  }

  private showLoginModal(){
    $('#login-modal').modal();
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
            this.retrieveMetricsData();
            $('#login-modal').modal("hide");
            this.loginForm.reset();
            this.metricInstances['_results']['0'].exit();
            this.metricInstances['_results']['1'].exit();
            this.csat_sent = false;
            this.nps_sent = false;
          } else {
            alert("Wrong credentials");
          }
        }).catch((ex) => {
          console.error('Error fetching metrics', ex);
        });
        /*if(user === "tequila" && pass === "squad") {

        }*/
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
}
