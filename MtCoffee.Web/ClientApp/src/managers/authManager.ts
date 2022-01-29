import { HttpClient, getHttpClient } from '@root/utils/httpClient';
import { JsonPayload } from '@root/models/jsonPayload';
import { UserProfile } from '@root/models/userProfile';
import { UserLogin, UserLoginResult } from '@root/models/userLogin';
import { PermissionSet } from '@root/models/permissions';

export class AuthManager {
    private httpClient: HttpClient;

    constructor() {
        this.httpClient = getHttpClient();
        (window as any)['mgr'] = { ...(window as any)['mgr'], auth: this };
    }

    public async login(model: UserLogin): Promise<JsonPayload<UserLoginResult>> {
        const rs = await this.httpClient.post('account/login', JSON.stringify(model)) as JsonPayload<UserLoginResult>;
        if (!!rs.payload) window.localStorage.setItem('jwt-auth-token', rs.payload.jwtToken);
        else window.localStorage.removeItem('jwt-auth-token');
        return rs;
    }

    public async logout(): Promise<boolean> {
        const isSuccess = await this.httpClient.get('account/logout') as boolean;
        if (isSuccess) window.localStorage.removeItem('jwt-auth-token');
        const date = new Date();
        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        // Set it
        document.cookie = "jwt-auth-token=; expires="+date.toUTCString()+"; path=/";
        window.location.reload();
        return isSuccess;
    }

    public async getUserProfile(): Promise<JsonPayload<UserProfile>> {
        const isSuccess = await this.httpClient.get('account/getUserProfile') as JsonPayload<UserProfile>;
        return isSuccess;
    }

    public async getPermissions(): Promise<JsonPayload<PermissionSet>> {
        const rs = await this.httpClient.get('account/getPermissions') as JsonPayload<PermissionSet>;
        return rs;
    }
    

    public async isAuthenticated(): Promise<JsonPayload<boolean>> {
        const rs = await this.httpClient.get('account/isAuthenticated') as JsonPayload<boolean>;
        return rs;
    }
}