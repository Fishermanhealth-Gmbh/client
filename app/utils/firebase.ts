import firebase, { initializeApp } from 'firebase/app';
import 'firebase/remote-config';
import 'firebase/analytics';
import 'firebase/performance';
export class Firebase {
  firebase: firebase.app.App;
  config: firebase.remoteConfig.RemoteConfig;
  analytics: firebase.analytics.Analytics;
  performance: firebase.performance.Performance;
  constructor() {
    this.firebase = initializeApp({
      apiKey: 'AIzaSyCDVyyqkoehfv9oI3wzjPP58qF5QephD3g',
      authDomain: 'iisy-env-19f51.firebaseapp.com',
      databaseURL: 'https://iisy-env-19f51.firebaseio.com',
      projectId: 'iisy-env',
      storageBucket: 'iisy-env.appspot.com',
      messagingSenderId: '651990409362',
      appId: '1:651990409362:web:bafc3e4e79a433d696064b',
      measurementId: 'G-5BQMZG9B6W'
    });
    this.config = this.firebase.remoteConfig();
    this.analytics = this.firebase.analytics();
    this.analytics.setAnalyticsCollectionEnabled(true);
    this.performance = this.firebase.performance();
  }

  async activateConfig() {
    return await this.config.fetchAndActivate();
  }
}
