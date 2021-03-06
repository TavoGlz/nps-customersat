export class Metric {
    // This is the model of any metric
    private name: string;
    private title: string;
    private projectName: string;
    private score = new Array();
    private less: string;
    private more: string;

    // Json that is used to send data to parent
    private metricJSON = {
        // JSON strings are supposed to use ", instead '
        // Wrapping the property names in double quotation marks in JSON
        // is mandatory. Furthermore, all strings should be double quoted as follows:
        "metric": "",
        "score": "",
        "comment": "",
        "created_at": ""
    }//metricJSON

    // To get a 'ces' you should set:
    //     name
    // To get a 'nps' or 'csat' you should set:
    //     name
    //     projectName
    // If you want to create a new metric you should set:
    //     name,
    //     title,
    //     minScore,
    //     maxScore,
    //     less,
    //     more
    constructor( name?: string, projectName?:string, title?: string,
                 minScore?: number, maxScore?:number, less?: string, more?: string ) {
        this.name= name || 'nps';
        this.projectName= projectName || 'this app';
        switch( this.name.toUpperCase() ) {
            case 'NPS':
                this.name='nps';
                this.title='How likely are you to recommend '+this.projectName+' to a friend or co-worker';
                this.score=[0,1,2,3,4,5,6,7,8,9,10];
                this.less='Not at all likely';
                this.more='Extremely likely';
                break;

            case 'CES':
                this.name='ces';
                this.title='How easy was it for you to complete this task or action?';
                this.score=[1,2,3,4,5,6,7];
                this.less='Very difficult';
                this.more='Very easy';
                break;

            case 'CSAT':
                this.name='csat';
                this.title='How satisfied are you with '+this.projectName+'?';
                this.score=[1,2,3,4,5];
                this.less='Very unsatisfied';
                this.more='Very satisfied';
                break;

            default:
                this.name=name;
                this.title=title;
                for ( ; minScore <= maxScore; minScore++ ) {
                    this.score.push(minScore);
                }//for
                this.less=less;
                this.more=more;
                break;
        }//switch
        this.metricJSON.metric = this.name;
    }//constructor

    public getName(): string {
        return this.name;
    }//getName

    public setCommentJSON( comment: string ){
        this.metricJSON.comment=comment
    }//setCommentJSON

    public setScoreJSON( score: number ){
        this.metricJSON.score=score.toString()
    }//setScoreJSON

    public setCurrentDateJSON() {
        this.metricJSON.created_at =
            new Date().toJSON().slice(0,10).replace(/-/g,'/');
    }//setCurrentDateJSON

    // Send data to DB
    public getJSON(): Object {
        return this.metricJSON;
    }//sendJson
}//Metric
