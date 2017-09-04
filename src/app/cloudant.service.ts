import { Injectable, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';
import 'rxjs/add/operator/map';

import * as PouchDB from 'pouchdb/dist/pouchdb';

@Injectable()
export class CloudantService {

  db: any;
  username: any;
  password: any;
  remote: any;
  data: any = [];
  url: any;
  results: any;
  api: any;

  constructor(private _http: Http, private zone: NgZone) {
    this.db = new PouchDB('nps_cat');
    this.username = '0d952d90-cd13-4583-91c8-f2caf6d6cb93-bluemix';
    this.password = 'a62e9510825db44339f10bf9c67a9f44e0d43994c6febb364135f8611609e62f';

    this.remote = 'https://0d952d90-cd13-4583-91c8-f2caf6d6cb93-bluemix:a62e9510825db44339f10bf9c67a9f44e0d43994c6febb364135f8611609e62f@0d952d90-cd13-4583-91c8-f2caf6d6cb93-bluemix.cloudant.com/nps_cat/';

    let options = {
      live: true,
      retry: true,
      continuous: true,
      auth: {
        username: this.username,
        password: this.password
      }
    };

    this.db.sync(this.remote, options);

  }

  initCall() {
    // make sure UI is initialised
    // correctly after sync.
    this.zone.run(() => { });
  }

  // NOTE: Another way to retrieve data via a REST call
  /*getUrl() {
    let headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(this.username + ":" + this.password));
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    this.api = this.remote + '/_all_docs?include_docs=true';

    return new Promise(resolve => {
      this._http.get(this.api, { headers: headers })
        .map(res => res.json())
        .subscribe(data => {
          this.results = data;

          this.data = [];

          let docs = this.results.rows.map((row) => {
            this.data.push(row.doc);
          });

          resolve(this.data);

          this.db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
            this.handleChange(change);
          });

        });
    });
  }*/

  addDocument(doc) {
    this.db.put(doc);
  }


  getMetrics() {
    return new Promise(resolve => {
      this.db.query('All-metrics/get_metrics', {
      }).then((res) => {
        this.data = res;
        resolve(this.data);
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  getCredentials() {
    return new Promise(resolve => {
      this.db.get('Credentials', {
      }).then((res) => {
        this.data = res;
        resolve(this.data);
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  /*deleteDocument(id) {
    this.db.remove(id);
  }*/

  /*getDocuments() {
    return new Promise(resolve => {
      this.db.allDocs({
        include_docs: true,
        descending: true
      }).then((result) => {
        this.data = [];

        let docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });

        this.data.reverse();

        resolve(this.data);

        this.db.changes({
          live: true, since: 'now', include_docs:
          true
        }).on('change', (change) => {
          this.handleChange(change);
        });

      }).catch((error) => {

        console.log(error);

      });

    });

  }

  handleChange(change) {
    let changedDoc = null;
    let changedIndex = null;

    this.data.forEach((doc, index) => {
      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }
    });

    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
    }
    else {
      //A document was updated
      if (changedDoc) {
        this.data[changedIndex] = change.doc;
      }
      //A document was added
      else {
        this.data.push(change.doc);
      }
    }
  }*/
}
