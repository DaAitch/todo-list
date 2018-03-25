import fs from 'fs';
import util from 'util';
import https from 'https';

const readFile = util.promisify(fs.readFile);

export const createServer = async ({keyFile, certFile, passphrase, host, port, requestHandler}) => {
    const [key, cert] = await Promise.all([
        readFile(keyFile),
        readFile(certFile)
    ]);

    const sslOptions = {
        key,
        cert,
        passphrase
    };

    const server = new https.Server(sslOptions, requestHandler);
    const listen = util.promisify(server.listen.bind(server));
    await listen(port, host);

    return server;
};
