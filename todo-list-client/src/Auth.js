import React from 'react';
import { connect } from 'react-redux';
import Login from './Login';
import { extractors, actions } from './reducers';
import { fetchBackend } from './rest';

@connect(
    state => ({
        authToken: extractors.getAuthToken(state),
        userId: extractors.getUserId(state)
    }),
    dispatch => ({
        setAuthToken: actions.setAuthToken(dispatch),
        setUserId: actions.setUserId(dispatch)
    })
)
export default class Auth extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            authState: 'UNKNOWN'
        };
    }

    componentDidMount() {
        if (!this.props.authToken) {
            const authToken = localStorage.getItem('authToken');
            localStorage.removeItem('authToken');
            
            if (authToken) {
                this.props.setAuthToken(authToken);
            } else {
                this.setState({authState: 'NOT_AUTHORIZED'});
            }
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.authToken !== this.props.authToken) {
            await this._doCheckAuth();
        }
    }

    async _doCheckAuth() {
        this.setState({authState: 'CHECKING'});

        try {
            const authToken = this.props.authToken;

            const result = await fetchBackend('/api/user/auth', {
                method: 'POST', 
                headers: {Authorization: authToken}
            });

            this.props.setUserId(result && result.userId);

            localStorage.setItem('authToken', authToken);
            this.setState({authState: 'AUTHORIZED'});

        } catch (e) {
            this.setState({authState: 'NOT_AUTHORIZED'});
        }
        
        
    }

    render() {
        if (this.state.authState === 'NOT_AUTHORIZED') {
            return (<Login />);
        }

        if (this.state.authState !== 'AUTHORIZED') {
            return (<div>{this.state.authState}</div>);
        }

        return this.props.children;
    }
}