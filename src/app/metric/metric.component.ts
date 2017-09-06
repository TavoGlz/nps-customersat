// Need input and output import to receive and send data from parent
import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
// Need these imports to control our forms. (Note: To use this you might import ReactiveFormsModule
// to your NgModule)
import { FormGroup, FormControl } from '@angular/forms';
// Set the model to ours metrics
import { Metric } from './metric.model';

@Component({
  // Pass in the name for the HTML class selector (<metric></metric>)
  selector: 'metric',
  // Set the styles of our component using the styles options
  styleUrls: ['./metric.component.css'],
  // Define our component's template inline, rather than using the templateUrl
  // option to access an external file.
  templateUrl: './metric.component.html'
})//@Component
// Export our component so that it can be imported to other files
// AfterViewInit is a Lifecycle hooks that is executed after the constructor,
// Is used to set up the component after angular sets the input properties.
export class MetricComponent implements AfterViewInit {
  componentName: 'MetricComponent'

  @Input() metric: Metric;
  @Output() onSendSurvey: EventEmitter<JSON>;
  @Output() reloadSurvey: EventEmitter<boolean>;

  mainDiv: HTMLElement;
  survey: HTMLElement;

  metricForm= new FormGroup({
    scoreCtrl: new FormControl(),
    commentCtrl: new FormControl()
  });

  //Aux to control the survey
  private surveyShown: boolean = false;
  //private radioSelected: HTMLInputElement;

  constructor() {
    this.onSendSurvey = new EventEmitter();
    this.reloadSurvey = new EventEmitter();
  }//constructor

  ngAfterViewInit() {
    this.mainDiv = <HTMLElement> document.getElementById(this.metric.getName()+'-id');
    this.survey = <HTMLElement> document.getElementById(this.metric.getName()+'-survey-id');
  }//ngAfterViewInit

  /**
   * Shows text area and button
   */
  private openSurvey() {
    if ( !this.surveyShown ) {
      this.survey.classList.remove('hidden-inline');
      this.survey.classList.add('show-inline');
      this.surveyShown=true;
    }//if{}
  }//openSurvey

  /**
   * Set comment, score and currentDate to JSON,
   * Hide the whole component and
   * Emit JSON
   */
  private sendSurvey() {
    let commentVal = this.metricForm.get('commentCtrl').value;
    if(commentVal === null || commentVal.trim() === "" || commentVal === ""){
      alert("Please write a comment");
    } else {
      // Set JSON values
      this.metric.setCommentJSON(
        commentVal.trim());
      this.metric.setScoreJSON(
        this.metricForm.get('scoreCtrl').value);
      this.metric.setCurrentDateJSON();

      // Hide the component
      this.cleanUpMetric();
      // Emit metricJSON
      this.onSendSurvey.emit(<JSON> this.metric.getJSON());
    }
  }//sendSurvey

  exit() {
    this.cleanUpMetric();
    this.reloadSurvey.emit(<boolean> true);
  }//exit

  private cleanUpMetric() {
    this.mainDiv.classList.add('hidden');
    this.survey.classList.add('hidden-inline');
    this.survey.classList.remove('show-inline');
    this.metricForm.reset();
    this.surveyShown=false;
  }
}//class NpsComponent
