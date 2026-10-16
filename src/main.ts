import 'zone.js';
import '@angular/compiler';
import { ɵresolveComponentResources } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

ɵresolveComponentResources(async (url) => {
  const response = await fetch(url);
  return await response.text();
}).then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
