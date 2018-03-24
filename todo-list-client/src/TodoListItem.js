import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-translate';
import FontAwesome from 'react-fontawesome';

@translate('TodoListItem')
export default class TodoListItem extends React.Component {

    static propTypes = {
        todo: PropTypes.object.isRequired,
        onlyEdit: PropTypes.bool,
        update: PropTypes.func.isRequired,
        delete: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.state = {
            edit: false
        };
    }

    _clickEdit = () => {
        if (!this.props.onlyEdit) {
            this.setState({edit: true});
        }
    };

    _clickCancel = () => {
        if (!this.props.onlyEdit) {
            this.setState({edit: false});
        }
    };

    _clickDelete = () => {
        if (!this.props.onlyEdit) {
            this.props.delete(this.props.todo && this.props.todo.id);
        }
    };

    _clickSave = async () => {
        await this.props.update(this.props.todo && this.props.todo.id, {
            ...this.props.todo,
            description: this._editDescription && this._editDescription.value
        });

        if (this._editDescription) {
            this._editDescription.value = '';
        }

        if (!this.props.onlyEdit) {
            this.setState({edit: false});
        }
    };

    _refEditDescription = ref => {
        if (ref) {
            ref.value = this.props.todo && this.props.todo.description;
        }

        this._editDescription = ref;
    };

    render() {
        if (!this.props.todo) {
            return null;
        }

        return (
            <div
                className={`list-group-item ${(this.props.todo && this.props.todo.done) ? 'list-group-item-success' : 'list-group-item'}`}
            >
                <div className="row">
                    <div className="col-md-10 col-sm-9 mb-1">
                        {this._renderDescription()}
                    </div>
                    <div className="col-md-2 col-sm-3">
                        {this._renderButtons()}
                    </div>
                </div>
            </div>
        )
    }

    _renderDescription() {
        if (!this.state.edit && !this.props.onlyEdit) {
            const icon = (this.state.todo && this.state.todo.done)
                ? (<FontAwesome name="check" />) // done
                : (<FontAwesome name="times" />) // not done
            ;

            const description = (this.state.todo && this.state.todo.done)
                ? (<s>{this.props.todo && this.props.todo.description}</s>) // not done
                : (this.props.todo && this.props.todo.description) // done 
            ;

            return (
                <h5 className="align-middle">
                    {icon}{' '}{description}
                </h5>
            );
        }

        return (
            <div className="input-group">
                {!!this.props.onlyEdit && (
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <FontAwesome name="plus" />
                        </div>
                    </div>
                )}
                <input
                    ref={this._refEditDescription}
                    type="text"
                    className="form-control"
                />
            </div>
        );
    }

    _renderButtons() {
        if (!this.state.edit && !this.props.onlyEdit) {
            return (
                <div className="btn-group">
                    <button
                        onClick={this._clickEdit}
                        type="button"
                        className="btn btn-warning"
                        aria-label={this.props.t('BUTTON_EDIT')}
                    >
                        <FontAwesome name="edit" />
                    </button>
                    <button
                        onClick={this._clickDelete}
                        type="button"
                        className="btn btn-danger"
                        aria-label={this.props.t('BUTTON_DELETE')}
                    >
                        <FontAwesome name="times" />
                    </button>
                </div>
            );
        } else {
            return (
                <div className="btn-group">
                    <button
                        onClick={this._clickSave}
                        type="button"
                        className="btn btn-success"
                        aria-label={this.props.t('BUTTON_SAVE')}
                    >
                        <FontAwesome name="save" />
                    </button>
                    {this.props.onlyEdit ? null : (
                        <button
                            onClick={this._clickCancel}
                            type="button"
                            className="btn btn-warning"
                            aria-label={this.props.t('BUTTON_CANCEL')}
                        >
                            <FontAwesome name="ban" />
                        </button>
                    )}
                </div>
            );
        }
    }
}