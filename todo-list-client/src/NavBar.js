import React from 'react';
import { translate } from 'react-translate';

@translate('NavBar')
export default class NavBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
                <span className="navbar-brand"><i className="fas fa-clipboard-check"></i> {this.props.t('HEADER')}</span>
                

                <div>
                    Nav
                </div>
                </nav>
        );
    }
}