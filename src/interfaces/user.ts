interface registeruserI{
    email:string,
    username:string,
    password:string,
}

interface loginuserI{
    email:string,
    password:string
}

export type {
    registeruserI,
    loginuserI
}