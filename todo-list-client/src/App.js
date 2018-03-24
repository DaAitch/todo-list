import React from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { TranslatorProvider } from 'react-translate';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import Auth from './Auth';
import NavBar from './NavBar';
import TodoList from './TodoList';
import PropTypes from 'prop-types';

export default class App extends React.Component {

    static propTypes = {
        store: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            translations: null
        };
    }

    async componentDidMount() {
        const resp = await fetch('/translation.de.json');
        const json = await resp.json();
        this.setState({translations: json});
    }

    render() {
        if (!this.state.translations) {
            return (<div><i className="fas fa-spin fa-circle-notch"></i></div>);
        }

        return (
            <TranslatorProvider translations={this.state.translations}>
                <Provider store={this.props.store}>
                    <ConnectedRouter history={this.props.history}>
                        <div className="container">
                            <NavBar />
                            <Auth>
                                <Route path="/">
                                    <TodoList />
                                </Route>
                            </Auth>
                        </div>
                    </ConnectedRouter>
                </Provider>
            </TranslatorProvider>
        );
    }
}