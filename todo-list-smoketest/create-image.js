import froq from 'froq';
import { spawn } from 'child_process';
import targz from 'targz';
import fs from 'fs';

const npm = process.env.npm_execpath;

const buildClient = async () => {
    const proc = spawn(npm, ['run', 'build'], {
        cwd: `${__dirname}/../todo-list-client`,
    });

    return await new Promise((resolve, reject) => {
        proc.once('exit', (code, signal) => {
            if (code !== 0) {
                reject(`code: ${code}, signal: ${signal}`);
                return;
            }

            resolve();
        });

        proc.stdout.on('data', data => {
            process.stdout.write('client: ');
            process.stdout.write(data);
            process.stdout.write('\n');
        });

        proc.stderr.on('data', data => {
            process.stderr.write('client: ');
            process.stderr.write(data);
            process.stderr.write('\n');
        });
    });
};

const packClient = () => {
    return new Promise((resolve, reject) => {
        targz.compress({
            src: __dirname + '/../todo-list-client',
            dest: 'lib/client.tar.gz',
            tar: {
                entries: [
                    'build'
                ],
                map: header => {
                    if (header.name.substr(0, 'build/'.length) === 'build/') {
                        header.name = header.name.substring('build/'.length);
                    }
                },
                // ignore: name => { console.log(`NAME= ${name}`); return false;}
            },
            gz: {
                level: 6,
                memLevel: 6
            }
        }, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
};

const buildServer = async () => {
    const proc = spawn(npm, ['run', 'build'], {
        cwd: `${__dirname}/../todo-list-server`,
    });

    return await new Promise((resolve, reject) => {
        proc.once('exit', (code, signal) => {
            if (code !== 0) {
                reject(`code: ${code}, signal: ${signal}`);
                return;
            }

            resolve();
        });

        proc.stdout.on('data', data => {
            process.stdout.write('server: ');
            process.stdout.write(data);
            process.stdout.write('\n');
        });

        proc.stderr.on('data', data => {
            process.stderr.write('server: ');
            process.stderr.write(data);
            process.stderr.write('\n');
        });
    });
};

const packServer = () => {
    return new Promise((resolve, reject) => {
        targz.compress({
            src: __dirname + '/../todo-list-server',
            dest: __dirname + '/lib/server.tar.gz',
            tar: {
                dereference: true,
                entries: [
                    'build',
                    'node_modules'
                ],
                map: header => {
                    if (header.name.substr(0, 'build/'.length) === 'build/') {
                        header.name = 'src/' + header.name.substring('build/'.length);
                    }
                },
                ignore: name => name === 'build'
            },
            gz: {
                level: 6,
                memLevel: 6
            }
        }, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
};


const buildImage = async () => {
    const docker = froq.docker.fromSocket();
    await docker.buildImage()
        .name('todolist_tests')
        .fromDockerfile(__dirname, [
            'Dockerfile',
            'lib/client.tar.gz',
            'lib/server.tar.gz',
            'lib/cert.pem',
            'lib/key.pem'
        ])
        .build(ev => {
            console.log(ev);
        });
};

const copySsl = async() => {
    return await Promise.all([
        new Promise((resolve, reject) => {
            fs.copyFile(__dirname + '/../todo-list-server/ssl/key.pem', __dirname + '/lib/key.pem', err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        }),
        new Promise((resolve, reject) => {
            fs.copyFile(__dirname + '/../todo-list-server/ssl/cert.pem', __dirname + '/lib/cert.pem', err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        })
    ]);
};


(async () => {
    
    if (!fs.existsSync(__dirname + '/lib')) {
        fs.mkdirSync(__dirname + '/lib');
    }
    
    try {
        

        await Promise.all([
            (async () => {
                await buildClient();
                await packClient();
            })(),
            (async () => {
                await buildServer();
                await packServer();
            })(),
            (async () => {
                await copySsl();
            })()
        ]);

        await buildImage();
    } catch (e) {
        console.error(e);
    }
})().then(() => {
    console.log('finished');
});







// // (async () => {
// //     await pack();
// //     await buildImage();
// // })();