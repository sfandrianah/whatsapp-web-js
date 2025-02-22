const { Client, LocalAuth } = require("whatsapp-web.js");
const Devices = require("../models/devices");
const OauthToken = require("../models/oauth_token");
const Utils = require("./utils");
const fs = require('fs');
const path = require("path");

var globWaClient = {};

const WhatsAppClient = async (token, number, options = {}) => {
    const oauthToken = await OauthToken.findOne({ where: { token: token } });
    if (oauthToken == null) {
        return {
            result: false,
            message: "Token Invalid"
        };
    }
    const oauthTokenId = oauthToken.id ?? null;

    const device = await Devices.findOne({ where: { oauth_token_id: oauthTokenId, value: number } });
    if (device == null) {
        return {
            result: false,
            message: "Device Not Registered"
        };
    }
    var withReady = options.withReady ?? null;
    var refreshQrCode = options.refreshQrCode ?? null;
    var isDisconnected = options.disconnected ?? null;
    var clientId = Utils.makeid(12);
    var dataPath = __dirname + '/../session_wa/' + oauthTokenId + '-' + number;

    // console.log(device);
    const deviceId = device.id ?? null;
    const deviceQrCode = device.qrcode ?? null;
    const deviceReady = device.ready ?? 0;
    const isDeviceReady = deviceReady == 1 ? true : false;
    var deviceSessValue = device.sess_value ?? null;
    if(device.updatedAt != null){
        const deviceUpdateAt = device.updatedAt;
        // console.log(deviceUpdateAt);
        deviceUpdateAt.setMinutes(deviceUpdateAt.getMinutes() + 1); 
        const deviceAddUpdatedAt = new Date(deviceUpdateAt); 
        var now = new Date();
        if(now > deviceAddUpdatedAt){
            deviceSessValue = null;
        } 
    }
    if (deviceSessValue == null) {
        var updateSessValue = {
            sess_value: clientId,
        };
        Devices.update(
            updateSessValue,
            { where: { id: deviceId } }
        )
    } else {
        clientId = deviceSessValue;
    }
    // var dataPathSession = dataPath + '/session-' + oauthTokenId + '-' + clientId;

    // console.log(device);
    // console.log(clientId);

    var client = null;
    var resultGlob = true;
    if (globWaClient == null) {
        resultGlob = false;
    } else {
        if (globWaClient[token] == null) {
            resultGlob = false;
            globWaClient[token] = {};
            globWaClient[token][deviceSessValue] = {};
        } else {
            if (globWaClient[token][deviceSessValue] == null) {
                resultGlob = false;
                globWaClient[token][deviceSessValue] = {
                    ready: false,
                    init: null
                };
            } else {
                if (globWaClient[token][deviceSessValue]["init"] == null) {
                    resultGlob = false;
                }
            }
        }
    }


    var resultReady = false;

    var resultData = {
        result: true,
        message: "",
        init: client,
        oauthTokenId: oauthTokenId,
        deviceId: deviceId,
        ready: resultReady,
    };
    if (isDisconnected != null) {
        if (isDisconnected) {
            if (resultGlob) {
                client = globWaClient[token][deviceSessValue]["init"];
                await client.logout();
                await client.destroy();
                delete globWaClient[token];
                resultData.result = true;
                resultData.message = "Device Disconnected Successfully";
                Devices.update(
                    { ready: 0 },
                    { where: { id: deviceId } }
                )
                return resultData;
            } else {
                resultData.result = false;
                resultData.message = "Device Disconnected Failed";
                return resultData;
            }
        }
    }
    
    if (refreshQrCode != null) {
        try {
            if (resultGlob) {
                if(device.updatedAt != null){
                    const deviceUpdateAt = device.updatedAt;
                    // console.log(deviceUpdateAt);
                    deviceUpdateAt.setMinutes(deviceUpdateAt.getMinutes() + 1); 
                    const deviceAddUpdatedAt = new Date(deviceUpdateAt); 
                    var now = new Date();
                    if(now > deviceAddUpdatedAt){
                        resultGlob = false;
                        // console.log("LEBIH");
                    } 
                }
            }
            var qrcode = null;
            if (refreshQrCode) {
                if (resultGlob) {
                    client = globWaClient[token][deviceSessValue]["init"];
                    resultData.init = client;
                    resultData.qrcode = deviceQrCode;
                    resultData.ready = deviceReady;
                    return resultData;
                } else {
                    client = new Client({
                        puppeteer: {
                            headless: true,
                            args: [
                                '--no-sandbox',
                            ]
                        },
                        authStrategy: new LocalAuth({
                            clientId: clientId,
                            dataPath: dataPath,
                        })
                    });
                    client.authStrategy.logout = () => {
                        console.log("OK");
                    };

                    client.on('qr', async (qr) => {
                        console.log(`Get QR! ${clientId}`);
                        qrcode = qr;
                        Devices.update(
                            { qrcode: qrcode },
                            { where: { id: deviceId } }
                        )
                    });

                    // client.on('authenticated', (session) => {
                    //     fs.writeFileSync(path.resolve(dataPath), JSON.stringify(session));
                    //   });

                    client.on('ready', async () => {
                        console.log(`Update Ready! ${clientId}`);
                        Devices.update(
                            { ready: 1 },
                            { where: { id: deviceId } }
                        )
                        console.log(`Client is ready! ${globWaClient}`);
                        // resolve(await WhatsAppClient(token, number));
                        return await WhatsAppClient(token, number, { refreshQrCode: true });
                    });
                    client.on('disconnected', async (reason) => {
                        console.log('Client disconnected. Reason:', reason);
                        delete globWaClient[token];
                        try {
                            // Destrói o cliente para liberar recursos
                            await client.destroy();
                            console.log(`Cliente destruído para o usuário ${clientId}`);
                        } catch (err) {
                            if (err.code === 'EBUSY') {
                                console.warn(`Erro EBUSY ao destruir cliente para o usuário ${clientId}. Recurso ocupado ou bloqueado.`);
                                // Aguarda um curto período e tenta novamente
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                try {
                                    console.log(`Tentando destruir novamente o cliente para o usuário ${clientId}`);
                                    await client.destroy();
                                } catch (retryErr) {
                                    console.warn(`Tentativa final de destruir cliente para o usuário ${clientId} falhou:`, retryErr);
                                }
                            } else {
                                console.warn(`Erro inesperado ao destruir cliente para o usuário ${clientId}:`, err);
                            }
                        }

                        // Verifica se a desconexão foi causada por logout ou navegação
                        if (reason === 'NAVIGATION' || reason === 'LOGOUT') {
                            const folderPath = path.join(__dirname, `/../.wwebjs_auth/session-${clientId}`);
                            fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                                if (err) {
                                    console.log(`Erro ao excluir a pasta da sessão para o usuário ${clientId}: ${err.message}`);
                                } else {
                                    console.log(`Pasta da sessão excluída com sucesso para o usuário ${clientId}`);
                                }
                            });
                        }


                    });
                    globWaClient[token][deviceSessValue]["init"] = client;

                    client.initialize().catch((error) => {
                        Devices.update(
                            { ready: 0 },
                            { where: { id: deviceId } }
                        )
                        console.log(error);
                        client.destroy();
                        console.error(`Error initializing client :`, error);

                    });
                    var nextNumberQr = 1;
                    return new Promise((resolve, reject) => {
                        let myVar = setInterval(async function () {
                            console.log(`nextNumberQR ${nextNumberQr}`);
                            if (qrcode != null) {

                                nextNumberQr = 1;
                                clearInterval(myVar);
                                resultData.qrcode = qrcode;
                                resolve(resultData);
                            } else {
                                nextNumberQr++;
                            }
                            if (nextNumberQr >= 10) {
                                nextNumberQr = 1;
                                clearInterval(myVar);
                                resultData.qrcode = null;
                                resultData.result = false;
                                resultData.message = "failed";
                                resolve(resultData);
                            }
                        }, 1000);
                    });
                }
            } else {
                return resultData;
            }

        } catch (e) {
            console.log("ERROR");
            console.log(e);
        }
    } else {
        if (!isDeviceReady) {
            resultGlob = false;
        }
        console.log("MASUK");
        console.log(resultGlob);
        if (resultGlob) {
            client = globWaClient[token][deviceSessValue]["init"];
            resultReady = globWaClient[token][deviceSessValue]["ready"] ?? isDeviceReady;
            resultData.ready = resultReady;
            resultData.init = client;
            console.log("=================");
            console.log(globWaClient);
            console.log("=================");
            return resultData;
        } else {

            client = new Client({
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                    ]
                },
                authStrategy: new LocalAuth({
                    clientId: clientId,
                    dataPath: dataPath,
                })
            });
            client.authStrategy.logout = () => {
                console.log("OK");
            };
            client.on('ready', () => {
                Devices.update(
                    { ready: 1 },
                    { where: { id: deviceId } }
                )
                globWaClient[token][deviceSessValue]["ready"] = true;
                resultReady = true;
                console.log(`Client is ready! ${globWaClient}`);
                // globWaClient[token][deviceSessValue]["init"] = client;
            });
            client.on('disconnected', async (reason) => {
                console.log('Client disconnected. Reason:', reason);
                delete globWaClient[token];
                try {
                    // Destrói o cliente para liberar recursos
                    await client.destroy();
                    console.log(`Cliente destruído para o usuário ${clientId}`);
                } catch (err) {
                    if (err.code === 'EBUSY') {
                        console.warn(`Erro EBUSY ao destruir cliente para o usuário ${clientId}. Recurso ocupado ou bloqueado.`);
                        // Aguarda um curto período e tenta novamente
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        try {
                            console.log(`Tentando destruir novamente o cliente para o usuário ${clientId}`);
                            await client.destroy();
                        } catch (retryErr) {
                            console.warn(`Tentativa final de destruir cliente para o usuário ${clientId} falhou:`, retryErr);
                        }
                    } else {
                        console.warn(`Erro inesperado ao destruir cliente para o usuário ${clientId}:`, err);
                    }
                }

                // Verifica se a desconexão foi causada por logout ou navegação
                if (reason === 'NAVIGATION' || reason === 'LOGOUT') {
                    const folderPath = path.join(__dirname, `/../.wwebjs_auth/session-${clientId}`);
                    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.log(`Erro ao excluir a pasta da sessão para o usuário ${clientId}: ${err.message}`);
                        } else {
                            console.log(`Pasta da sessão excluída com sucesso para o usuário ${clientId}`);
                        }
                    });
                }


            });
            globWaClient[token][deviceSessValue]["init"] = client;
            client.initialize().catch((error) => {
                Devices.update(
                    { ready: 0 },
                    { where: { id: deviceId } }
                );
                client.destroy();
                console.log(error);
                console.error(`Error initializing client :`, error);
            });;
            if (withReady != null) {
                if (withReady) {
                    var nextNumber = 1;

                    return new Promise((resolve, reject) => {
                        let myVar = setInterval(async function () {
                            console.log(`nextNumber ${nextNumber}`);
                            if (resultReady) {
                                nextNumber = 1;
                                clearInterval(myVar);
                                resolve(await WhatsAppClient(token, number));
                            } else {
                                nextNumber++;
                            }
                            if (nextNumber >= 10) {
                                nextNumber = 1;
                                clearInterval(myVar);
                                // resultData.ready = resultReady;
                                resultData.result = false;
                                resultData.ready = false;
                                resolve(resultData);
                                // res.send({
                                //     result: false,
                                //     message: "Send Message Failed",
                                // });
                            }
                        }, 1000);
                    });
                } else {
                    return resultData;
                }
            }

        }

    }

};
// export default waClient;
module.exports = WhatsAppClient;
