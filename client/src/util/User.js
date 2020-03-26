const getMe = (users, me) => users.find((user) => user.name === me);

export { getMe };
