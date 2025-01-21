const express = require('express');
const app = express();
const deviceRouter = require("./device");

app.use("/device", deviceRouter);

module.exports = app;