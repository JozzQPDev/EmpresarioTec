import 'zone.js';
import '@angular/compiler';
import { ɵresolveComponentResources } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Comenta esta línea hasta que ejecutes 'npx boneyard-js build' por primera vez:
//import './bones/registry';

ɵresolveComponentResources(async (url) => {
  const response = await fetch(url);
  return await response.text();
}).then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});