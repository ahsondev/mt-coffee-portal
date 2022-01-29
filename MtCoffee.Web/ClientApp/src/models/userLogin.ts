export interface UserLogin {
    password: string;
    email: string;
    rememberMe: boolean;
}

export interface UserLoginResult {
    jwtToken: string;
}