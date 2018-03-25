export const userHasRight = (user, right) => {
    if (!user || !user.rights || !Array.isArray(user.rights)) {
        return false;
    }

    return user.rights.some(r => r === right);
};

export const RIGHTS = {
    ADMIN: 'ADMIN'
};

export const allowed = {
    addUser: user => userHasRight(user, RIGHTS.ADMIN),
    addTodo: () => true,
    updateTodo: () => true,
    deleteTodo: () => true
};
