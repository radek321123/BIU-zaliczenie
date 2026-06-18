export const initialUsersState = {
    users: [],
    loggedIn: null,
    loading: false,
    error: null,
};

export const userReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null,
            };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                users: [...action.payload],
                loading: false,
            };

        case 'FETCH_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case 'ADD_USER':
            return {
                ...state,
                users: [...state.users, action.payload],
            };

        case 'LOGIN_USER':
            return {
                ...state,
                loggedIn: action.payload,
            }

        case 'LOGOUT_USER':
            return {
                ...state,
                loggedIn: null,
            }

        case 'UPDATE_USER':
            return {
                ...state,
                users: state.users.map((u) =>
                    u.id === action.payload.id ? action.payload : u
                ),
                loggedIn: state.loggedIn?.id === action.payload.id
                    ? action.payload
                    : state.loggedIn,
            }


        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
};