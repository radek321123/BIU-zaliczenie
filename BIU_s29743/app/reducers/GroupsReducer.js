export const initialGroupsState = {
    groups: [],
    loading: true,
    error: null,
};

export const groupsReducer = (state, action) => {
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
                groups: [...action.payload],
                loading: false,
            };

        case 'FETCH_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case 'ADD_GROUP':
            return {
                ...state,
                groups: [...state.groups, action.payload],
            };

        case 'UPDATE_GROUP':
            return {
                ...state,
                groups: state.groups.map((g) =>
                    g.id === action.payload.id ? action.payload : g
                ),
            };

        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
};
