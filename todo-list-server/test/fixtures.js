import froq from 'froq';

const docker = froq.docker.fromSocket();

export const startApplication = () => {
    const container = await docker
        .createContainer('guestbook_tests')
        .bind('8080/tcp')
        .build()
    ;

    await container.start();

    const customSession = await froq.util.retry({
        name: 'wait for container',
        func: async () => await customBroker.createSession(),
        predicate: async (err, result) => !err,
        retries: 20,
        waitMillis: 500
    });
};