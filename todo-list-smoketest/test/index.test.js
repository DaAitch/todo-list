
import Q from 'froq';

fixture
    .before(ctx => {
        ctx.docker = Q.docker.fromSocket();
        ctx.mongoClient = Mongo
    });

test('should create new item', t => {

    t.ctx.mongoClient.insert('users', {});

    t
        .navigateTo(t.ctx.url)
        .typeText('#username', 'admin')
        .typeText('#password', 'admin')
        .click('#login_button')
        

});