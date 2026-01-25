const express = require("express");
const app = express();

// import actual backend
const backendApp = require("./api/index");

// forward all requests to backend app
app.use(backendApp);

module.exports = app;
