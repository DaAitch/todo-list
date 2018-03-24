export const reducers = {
    app: (state = {}, action) => {
        console.log(action);
        switch (action.type) {
            case 'SET_AUTH_TOKEN': {
                
                return {
                    ...state,
                    authToken: action.payload
                };
            }
            case 'SET_USER_ID': {
                return {
                    ...state,
                    userId: action.payload
                };
            }
            default:
                return state;
        }
    }
};

export const actions = {
    setAuthToken: dispatch => token => dispatch({type: 'SET_AUTH_TOKEN', payload: token}),
    setUserId: dispatch => userId => dispatch({type: 'SET_USER_ID', payload: userId})
};

export const extractors = {
    getAuthToken: state => state && state.app && state.app.authToken,
    getUserId: state => state && state.app && state.app.userId
};