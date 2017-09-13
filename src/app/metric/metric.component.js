"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
// Need input and output import to receive and send data from parent
var core_1 = require("@angular/core");
// Need these imports to control our forms. (Note: To use this you might import ReactiveFormsModule
// to your NgModule)
var forms_1 = require("@angular/forms");
var MetricComponent = /** @class */ (function () {
    //private radioSelected: HTMLInputElement;
    function MetricComponent() {
        this.metricForm = new forms_1.FormGroup({
            scoreCtrl: new forms_1.FormControl(),
            commentCtrl: new forms_1.FormControl()
        });
        //Aux to control the survey
        this.surveyShown = false;
        this.onSendSurvey = new core_1.EventEmitter();
        this.reloadSurvey = new core_1.EventEmitter();
    } //constructor
    MetricComponent.prototype.ngAfterViewInit = function () {
        this.mainDiv = document.getElementById(this.metric.getName() + '-id');
        this.survey = document.getElementById(this.metric.getName() + '-survey-id');
    }; //ngAfterViewInit
    /**
     * Shows text area and button
     */
    MetricComponent.prototype.openSurvey = function () {
        if (!this.surveyShown) {
            this.survey.classList.remove('hidden-inline');
            this.survey.classList.add('show-inline');
            this.surveyShown = true;
        } //if{}
    }; //openSurvey
    /**
     * Set comment, score and currentDate to JSON,
     * Hide the whole component and
     * Emit JSON
     */
    MetricComponent.prototype.sendSurvey = function () {
        var commentVal = this.metricForm.get('commentCtrl').value;
        if (commentVal === null || commentVal.trim() === "" || commentVal === "") {
            alert("Please write a comment");
        }
        else {
            // Set JSON values
            this.metric.setCommentJSON(commentVal.trim());
            this.metric.setScoreJSON(this.metricForm.get('scoreCtrl').value);
            this.metric.setCurrentDateJSON();
            // Hide the component
            this.cleanUpMetric();
            // Emit metricJSON
            this.onSendSurvey.emit(this.metric.getJSON());
        }
    }; //sendSurvey
    MetricComponent.prototype.exit = function () {
        this.cleanUpMetric();
        this.reloadSurvey.emit(true);
    }; //exit
    MetricComponent.prototype.cleanUpMetric = function () {
        this.mainDiv.classList.add('hidden');
        this.survey.classList.add('hidden-inline');
        this.survey.classList.remove('show-inline');
        this.metricForm.reset();
        this.surveyShown = false;
    };
    __decorate([
        core_1.Input()
    ], MetricComponent.prototype, "metric");
    __decorate([
        core_1.Output()
    ], MetricComponent.prototype, "onSendSurvey");
    __decorate([
        core_1.Output()
    ], MetricComponent.prototype, "reloadSurvey");
    MetricComponent = __decorate([
        core_1.Component({
            // Pass in the name for the HTML class selector (<metric></metric>)
            selector: 'metric',
            // Set the styles of our component using the styles options
            styleUrls: ['./metric.component.css'],
            // Define our component's template inline, rather than using the templateUrl
            // option to access an external file.
            templateUrl: './metric.component.html'
        }) //@Component
        // Export our component so that it can be imported to other files
        // AfterViewInit is a Lifecycle hooks that is executed after the constructor,
        // Is used to set up the component after angular sets the input properties.
    ], MetricComponent);
    return MetricComponent;
}()); //class NpsComponent
exports.MetricComponent = MetricComponent;
