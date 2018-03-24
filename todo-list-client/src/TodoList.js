import React from 'react';
import { fetchBackend } from './rest';
import { connect } from 'react-redux';
import { extractors } from './reducers';
import TodoListItem from './TodoListItem';

const emptyTodo = {
    description: '',
    done: false
};

@connect(
    state => ({
        authToken: extractors.getAuthToken(state),
        userId: extractors.getUserId(state)
    })
)
export default class TodoList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            todos: null
        };
    }

    async componentDidMount() {
        await this._doUpdateList();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.authToken !== this.props.authToken) {
            await this._doUpdateList();
        }
    }

    async _doUpdateList() {

        if (!this.props.authToken || !this.props.userId) {
            return;
        }

        try {
            const result = await fetchBackend(`/api/user/${this.props.userId}/todos`, {
                headers: {
                    Authorization: this.props.authToken
                }
            });

            const todos = (result && Array.isArray(result.todos) && result.todos) || null;
            this.setState({todos});
        } catch (e) {
            console.error(e);
        }
    }

    _createItem = async (todoId, todo) => {
        try {
            await fetchBackend(`/api/user/${this.props.userId}/todos`, {
                method: 'POST',
                headers: {
                    Authorization: this.props.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: todo && todo.description
                })
            });

            await this._doUpdateList();

        } catch (e) {
            console.error(e);
        }
    };

    _updateItem = async (todoId, todo) => {
        try {
            await fetchBackend(`/api/user/${this.props.userId}/todos/${todoId}`, {
                method: 'PUT',
                headers: {
                    Authorization: this.props.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: todo && todo.description,
                    done: todo && todo.done
                })
            });

            await this._doUpdateList();
        } catch (e) {
            console.error(e);
        }
    };

    _deleteItem = async todoId => {
        try {
            await fetchBackend(`/api/user/${this.props.userId}/todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: this.props.authToken
                }
            });

            await this._doUpdateList();
        } catch (e) {
            console.error(e);
        }
    };

    render() {
        return (
            <div className="list-group">
                {!this.state.todos ? null : this.state.todos.map(todo => {
                    return (
                        <TodoListItem
                            key={todo.id}
                            todo={todo}
                            update={this._updateItem}
                            delete={this._deleteItem}
                        />
                    );
                })}
                <TodoListItem
                    key="new"
                    onlyEdit={true}
                    todo={emptyTodo}
                    update={this._createItem}
                />
            </div>
        );
    }
}