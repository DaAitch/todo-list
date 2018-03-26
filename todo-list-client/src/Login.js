import React from 'react';
import { translate } from 'react-translate';
import { connect } from 'react-redux';
import { actions } from './reducers';
import ErrorCode from './ErrorCode';
import { fetchBackend } from './rest';
import FontAwesome from 'react-fontawesome';

@translate('Login')
@connect(
    state => ({}),
    dispatch => ({
        setAuthToken: actions.setAuthToken(dispatch)
    })
)
export default class Login extends React.Component {

    constructor() {
        super();

        this.state = {
            errorCode: null
        };
    }

    clickLogin = async () => {
        const username = this._getUsername();
        const password = this._getPassword();

        try {
            const result = await fetchBackend('/api/user/login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            this.props.setAuthToken(result && result.authToken)
        } catch (e) {
            this.setState({
                errorCode: e.code
            });
        }
    }

    _getUsername() {
        return this._username && this._username.value;
    }

    _getPassword() {
        return this._password && this._password.value;
    }

    render() {

        return (
            <div className="card col-lg-4 col-md-6 col-sm-8 col-xs-12">
                <div className="card-block">
                    <div className="card-title"><h5>{this.props.t('HEADER')}</h5></div>
                    <div className="card-body">
                        <ErrorCode code={this.state.errorCode} />
                        <div className="form-group">
                            <label htmlFor="formFieldUsername">{this.props.t('FORM_FIELD_USERNAME')}</label>
                            <input ref={ref => this._username = ref} type="text" name="username" id="formFieldUsername" className="form-control" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="formFieldPassword">{this.props.t('FORM_FIELD_PASSWORD')}</label>
                            <input ref={ref => this._password = ref} type="password" name="password" id="formFieldPassword" className="form-control" />
                        </div>
                        <div className="form-group">
                            <button
                                onClick={this.clickLogin}
                                type="submit"
                                class="btn btn-primary"
                            >
                                <FontAwesome name="sign-in" />
                                {this.props.t('FORM_SUBMIT_LOGIN')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}