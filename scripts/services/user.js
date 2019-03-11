const login = (username, password) => {
    if (!password)
        return Promise.reject("Password cannot be empty");
    if (!username)
        return Promise.reject("Username cannot be empty");
    return new Promise(resolve => {
        console.log("Login service with ", {
            username,
            password
        });
        setTimeout(() => { resolve(); }, 2500);
    });
};

Object.assign(exports, { login });
