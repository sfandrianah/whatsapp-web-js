const express = require('express');
const WhatsAppClient = require('../config/wa_client');
const Devices = require('../models/devices');
const router = express.Router();
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const HistorySendMessages = require('../models/history_send_messages');
const OauthToken = require('../models/oauth_token');


router.get('/:device_number/qr', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    var xTrpToken = header["x-trp-token"] ?? null;
    const deviceNumber = param.device_number ?? null;
    // const deviceNumber = query.device_number ?? null;
    var waClient = await WhatsAppClient(xTrpToken, deviceNumber, { refreshQrCode: true });
    console.log(waClient);
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }
    const qrCodeImage = await QRCode.toDataURL(waClient.qrcode);
    return res.send({
        result: true,
        message: "success",
        value: waClient.qrcode ?? null,
        base64: qrCodeImage,
    });
    // const device = await Devices.findOne({ where: { oauth_token_id: oauthTokenId, value: number } });
    // console.log(waClient);
    // const client = waClient.init;
    // var qrcode = null;
    // client.on('qr', async (qr) => {
    //     qrcode = qr;
    // });
    // client.initialize();
    // var nextNumber = 1;
    // let myVar = setInterval(function () {
    //     // console.log(`nextNumber ${nextNumber}`);
    //     if (qrcode != null) {
    //         clearInterval(myVar);
    //         nextNumber = 1;
    //         // console.log(`DEVICE ID = ${waClient.deviceId}`);
    //         Devices.update(
    //             { qrcode: qrcode },
    //             { where: { id: waClient.deviceId } }
    //         )

    //         res.send({
    //             result: true,
    //             message: "success",
    //             value: qrcode,
    //         });
    //     } else {
    //         nextNumber++;
    //     }
    //     if (nextNumber >= 30) {
    //         nextNumber = 1;
    //         clearInterval(myVar);
    //         res.send({
    //             result: false,
    //             message: "Get QR Failed",
    //             value: null,
    //         });
    //     }
    // }, 1000);

    // client.on('ready', () => {
    //     console.log('Client is ready!');
    // });

    // client.on('message', (message) => {
    //     console.log(message.body);
    // });

});

router.get('/:device_number/qr-image', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    var xTrpToken = header["x-trp-token"] ?? null;
    const deviceNumber = param.device_number ?? null;
    // const deviceNumber = query.device_number ?? null;
    var waClient = await WhatsAppClient(xTrpToken, deviceNumber, { refreshQrCode: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }
    // const device = await Devices.findOne({ where: { oauth_token_id: oauthTokenId, value: number } });
    // console.log(waClient);
    // const client = waClient.init;
    const qrCodeImage = await QRCode.toDataURL(waClient.qrcode);
    // res.setHeader("Content-Type", "image/png");
    // return res.status(200).end(qrCodeImage, 'binary');;
    // return res.send(`<img src="${qrCodeImage}" alt="QR Code"/>`);
    res.write(`<img src="${qrCodeImage}" alt="QR Code"/>`);//send image
    res.end();
    // var qrcode = null;
    // client.on('qr', async (qr) => {
    //     qrcode = qr;
    // });

    // client.initialize();
    // var nextNumber = 1;
    // let myVar = setInterval(async function () {
    //     // console.log(`nextNumber ${nextNumber}`);
    //     if (qrcode != null) {
    //         clearInterval(myVar);
    //         nextNumber = 1;
    //         // console.log(`DEVICE ID = ${waClient.deviceId}`);
    //         Devices.update(
    //             { qrcode: qrcode },
    //             { where: { id: waClient.deviceId } }
    //         )

    //         const qrCodeImage = await QRCode.toDataURL(qrcode);
    //         // res.setHeader("Content-Type", "image/png");
    //         // return res.status(200).end(qrCodeImage, 'binary');;
    //         // return res.send(`<img src="${qrCodeImage}" alt="QR Code"/>`);
    //         res.write(`<img src="${qrCodeImage}" alt="QR Code"/>`);//send image
    //         res.end();

    //         // res.send({
    //         //     result: true,
    //         //     message: "success",
    //         //     value: qrcode,
    //         // });
    //     } else {
    //         nextNumber++;
    //     }
    //     if (nextNumber >= 15) {
    //         nextNumber = 1;
    //         clearInterval(myVar);
    //         res.send({
    //             result: false,
    //             message: "Get QR Failed",
    //             value: null,
    //         });
    //     }
    // }, 1000);

    // client.on('ready', () => {
    //     console.log('Client is ready!');
    // });

    // client.on('message', (message) => {
    //     console.log(message.body);
    // });

});

router.get('/:device_number', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    const xTrpToken = header["x-trp-token"] ?? null;
    const deviceNumber = param.device_number ?? null;
    var waClient = await WhatsAppClient(xTrpToken, deviceNumber, { withReady: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }
    delete waClient.init;
    waClient.message = "Device Connected";
    // console.log(waClient);
    return res.send(waClient);
    // const client = waClient.init;
    // console.log(client.info);
    // client.on('ready', () => {
    //     console.log('Client is ready!');
    // });
    // client.initialize();
});


router.post('/:device_number/send', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    var body = req.body;
    const phoneNumber = body.phone_number;
    const image = body.image ?? null;
    const message = body.message;
    console.log(body);

    const xTrpToken = header["x-trp-token"] ?? null;
    const deviceNumber = param.device_number ?? null;
    var waClient = await WhatsAppClient(xTrpToken, deviceNumber, { withReady: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }
    var historySendMessageData = {
        from_number: deviceNumber,
        to_number: phoneNumber,
        messages: message,
        device_id: waClient.deviceId,
    };
    const client = waClient.init;
    console.log(waClient);
    if (waClient.ready) {
        const chatId = phoneNumber + "@c.us";
        if (image == null) {
            console.log("PENGIRIMAN TEXT");
            client.sendMessage(chatId, message).then(function (e) {
                HistorySendMessages.create(historySendMessageData)
                res.send({
                    result: true,
                    message: "Send Message Success",
                });
            }).catch(function (e) {
                // console.log(e);
                historySendMessageData.err_messages = e.toString();
                HistorySendMessages.create(historySendMessageData)
                res.send({
                    result: false,
                    message: e.toString(),
                });
            });
        } else {
            // const imagePath = path.resolve(__dirname + '/../uploads/image.jpg');
            // console.log("PENGIRIMAN DENGAN GAMBAR");
            // const media = MessageMedia.fromFilePath('what.png');
            const media = await MessageMedia.fromUrl(image);
            historySendMessageData.image_type = "URL";
            historySendMessageData.image_value = image;

            client.sendMessage(chatId, media, { caption: message }).then(function (e) {
                HistorySendMessages.create(historySendMessageData)
                res.send({
                    result: true,
                    message: "Send Message Success",
                });
            }).catch(function (e) {
                // console.log(e);
                historySendMessageData.err_messages = e.toString();
                HistorySendMessages.create(historySendMessageData)
                res.send({
                    result: false,
                    message: e.toString(),
                });
            });
        }

    } else {
        historySendMessageData.err_messages = "Device Not Connected";
        HistorySendMessages.create(historySendMessageData)
        res.send({
            result: false,
            message: "Device Not Connected",
        });
    }

});

router.post('/create', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    var body = req.body;
    const phoneNumber = body.device_number;
    const xTrpToken = header["x-trp-token"] ?? null;

    const oauthToken = await OauthToken.findOne({ where: { token: xTrpToken } });
    if (oauthToken == null) {
        return res.send({
            result: false,
            message: "Token Invalid"
        });
    }
    const oauthTokenId = oauthToken.id ?? null;

    const device = await Devices.findOne({ where: { oauth_token_id: oauthTokenId, value: phoneNumber } });
    if (device == null) {
        await Devices.create({ value: phoneNumber, oauth_token_id: oauthTokenId })
        return res.send({
            result: true,
            message: "Device Registered Successfully",
        });
    } else {
        return res.send({
            result: true,
            message: "Device Already Registered",
        });
    }

});

router.get('/:device_number/disconnected', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    const xTrpToken = header["x-trp-token"] ?? null;
    const deviceNumber = param.device_number ?? null;
    var waClient = await WhatsAppClient(xTrpToken, deviceNumber, { withReady: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }

    waClient = await WhatsAppClient(xTrpToken, deviceNumber, { disconnected: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }
    // delete waClient.init;
    // const client = waClient.init;
    // console.log(waClient);
    return res.send(waClient);
    // const client = waClient.init;
    // console.log(client.info);
    // client.on('ready', () => {
    //     console.log('Client is ready!');
    // });
    // client.initialize();
});

router.delete('/:device_number', async (req, res) => {
    var param = req.params;
    var header = req.headers;
    var query = req.query;
    const xTrpToken = header["x-trp-token"] ?? null;
    const deviceNumber = param.device_number ?? null;
    var waClient = await WhatsAppClient(xTrpToken, deviceNumber, { withReady: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }

    waClient = await WhatsAppClient(xTrpToken, deviceNumber, { disconnected: true });
    if (!waClient.result) {
        return res.status(404).send({
            result: waClient.result,
            message: waClient.message
        });
    }
    await Devices.destroy({ where: { id: waClient.deviceId } });
    return res.send(waClient);
});

module.exports = router;