//import { Injectable } from '@angular/core';
import express from 'express';
import * as passport from 'passport/lib/index';
import { IDaaSOIDCStrategy } from 'passport-idaas-openidconnect/lib/index';

//@Injectable()
export class LoginAuth {

  constructor() {
    //let app = express();
    //let api = express();
    console.log("started");
    //app.use(passport.initialize());
  }

  /*private client_id = 'YTExNTk4OWUtNzQ0MC00';
  private client_secret = 'ZmM1ZmJmMTQtOGM1Mi00';
  private authorization_url = 'https://w3id.alpha.sso.ibm.com/isam/oidc/endpoint/amapp-runtime-oidcidp/authorize';
  private token_url = 'https://w3id.alpha.sso.ibm.com/isam/oidc/endpoint/amapp-runtime-oidcidp/token';
  private issuer_id = 'https://w3id.alpha.sso.ibm.com/isam';
  private callback_url = 'http://localhost:4200/authcb';

  private strategy = new OpenIdConnect({
    authorizationURL : this.authorization_url,
    tokenURL : this.token_url,
    clientID : this.client_id,
    scope: 'openid',
    response_type: 'code',
    clientSecret : this.client_secret,
    callbackURL : this.callback_url,
    skipUserProfile: true,
    issuer: this.issuer_id,
    addCACert: true,
    CACertPathList: ['/certs/oidc_w3id_staging.cer','/certs/SymantecClass3SecureServerCA-G4.pem','/certs/VeriSignClass3PublicPrimaryCertificationAuthority-G5.pem']
  },
  function(iss, sub, profile, accessToken, refreshToken, params, done){
    process.nextTick(function(){
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      done(null, profile);
    )};
  });*/

  //passport.use(Strategy);
}
