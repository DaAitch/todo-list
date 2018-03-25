import moment from 'moment';
import {success} from '../../../rest';


export default ({app, db}) => {
    const upSince = moment();
    
    app.get('/api/system/status', async (req, resp) => {
    
        const now = moment();
        resp.json(success({
            sanity: db.connected,
            uptime: {
                text: upSince.from(now),
                seconds: now.diff(upSince, 'seconds')
            },
            db: {
                connected: db.connected
            }
        }));
    });
};
