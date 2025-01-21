// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
const fs = require('fs');
const QRCode = require('qrcode');
const sequelize = require('./config/database');
const express = require('express');
const OauthToken = require('./models/oauth_token');
const Devices = require('./models/devices');
const Utils = require('./config/utils');
const WhatsAppClient = require('./config/wa_client');
const routes = require("./routes");
var http = require('http');


// const client = new Client({
//     authStrategy: new LocalAuth()
// });

// client.on('qr', (qr) => {
// 	console.log(qr);
//   //  qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });

// client.on('message', (message) => {
//     console.log(message.body);
// });

// client.initialize();

const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Route dasar
app.get('/', (req, res) => {
    res.send('Hello, World! Welcome to Express API.');
});


app.use("/api", routes);
var server = http.createServer(app);
// Menjalankan server
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;