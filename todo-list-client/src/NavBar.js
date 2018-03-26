import React from 'react';
import { translate } from 'react-translate';
import FontAwesome from 'react-fontawesome';
import { extractors, actions } from './reducers';
import { connect } from 'react-redux';
import { fetchBackend } from './rest';

@translate('NavBar')
@connect(
    state => ({
        authToken: extractors.getAuthToken(state)
    }),
    dispatch => ({
        setAuthToken: actions.setAuthToken(dispatch)
    })
)
export default class NavBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

    _clickLogout = async () => {
        await fetchBackend(`/api/user/auth`, {
            method: 'DELETE',
            headers: {
                Authorization: this.props.authToken
            }
        });

        this.props.setAuthToken(null);
    };

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
                <span className="navbar-brand"><i className="fas fa-clipboard-check"></i> {this.props.t('HEADER')}</span>
                

                <div>
                    {this.props.authToken &&
                        <button
                            onClick={this._clickLogout}
                            type="button"
                            class="btn btn-danger"
                        >
                            <FontAwesome name="sign-out" />
                            {this.props.t('LOGOUT')}
                        </button>
                    }
                </div>
                </nav>
        );
    }
}