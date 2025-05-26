const express = require('express');
const path = require('path');

const configureExpress = (app) => {
  // View engine setup
  app.set('views', path.join(__dirname, '../../views'));
  app.set('view engine', 'pug');

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '../../public')));
  app.use(express.static(path.join(__dirname, '../../src')));
};

module.exports = configureExpress;