import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, combineReducers, applyMiddleware } from 'redux';

import createHistory from 'history/createBrowserHistory';

import { routerReducer, routerMiddleware } from 'react-router-redux';

import registerServiceWorker from './registerServiceWorker';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './App';
import { reducers } from './reducers';

const history = createHistory();
const middleware = routerMiddleware(history);

const store = createStore(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    applyMiddleware(middleware)
);

ReactDOM.render(
    (<App store={store} history={history} />),
    document.getElementById('root')
);
registerServiceWorker();
