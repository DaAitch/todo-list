import React from 'react';
import { translate } from 'react-translate';
import PropTypes from 'prop-types';

@translate('ErrorCode')
export default class ErrorCode extends React.Component {
    static propTypes = {
        code: PropTypes.string
    };

    render() {
        if (!this.props.code) {
            return null;
        }

        return (
            <div className="alert alert-danger" role="alert">
                {this.props.t(this.props.code)}
            </div>
        );
    }
}