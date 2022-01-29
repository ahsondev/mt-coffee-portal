import { Logger } from '@utils/logger';
const jsonContentType = 'application/json';
const defaultUrl = process.env.API_SERVICE_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
const jwtAuthCookieName = 'jwt-auth-token';

export default interface HttpClientOptions extends RequestInit {
    authenticated?: boolean;
    failOnError?: boolean;
    method?: HttpMethod;
    scope?: string;
    parseJsonResponse?: boolean;
}

const defaultRequestOptions: HttpClientOptions = {
    authenticated: true,
    failOnError: false,
    method: 'GET',
    // scope: auth.scopes.app,
    parseJsonResponse: true,
};

export class HttpClient {
    private url: string;

    constructor(baseUrl?: string) {
        this.url = `${(baseUrl || defaultUrl)}/api`;
    }

    private async performRequest<T = Response>(url: string, options: HttpClientOptions): Promise<T> {
        const response = await fetch(url, options);
        const status = `${response.status} ${response.statusText}`;
        Logger.debug(`${options.method} request to ${url} returned with ${status}`);

        if (!response || (options.failOnError && !response.ok)) {
            throw new Error(`${options.method} request to [${url}] failed with [${status}]`);
        } else {
            return options.parseJsonResponse ? response.json() : response;
        }
    }

    private async requestWithBody(apiName: string, method: HttpMethod, body: BodyInit, options: HttpClientOptions): Promise<any> {
        if (!!(body as FormData).append && !!(body as FormData).delete) {
            // it's form data.
            const config: HttpClientOptions = {
                ...options,
                body,
                headers: { ...options.headers },
                method,
            };

            return await this.request(`${this.url}/${apiName}`, config);
        } else {
            // it's json data.
            const config: HttpClientOptions = {
                ...options,
                body,
                headers: { ...options.headers, 'Content-Type': jsonContentType },
                method,
            };
            return await this.request(`${this.url}/${apiName}`, config);
        }
    }

    public async request<T = Response>(url: string, options: HttpClientOptions = {}): Promise<T> {
        const requestOptions = { ...defaultRequestOptions, ...options };
        Logger.debug(`Making a ${requestOptions.method} request to ${url}`);

        if (requestOptions.authenticated) {
            const authToken = window.localStorage.getItem(jwtAuthCookieName) || undefined;

            requestOptions.headers = { ...requestOptions.headers };

            if (!!authToken) {
                (requestOptions.headers as Record<string, string>)[`authorization`] = `Bearer ${authToken}`;
            }
        }

        return this.performRequest<T>(url, requestOptions);
    }

    public async get(apiName: string, options: HttpClientOptions = {}): Promise<any> {
        return await this.request(`${this.url}/${apiName}`, { ...options, method: 'GET' });
    }

    public async post(apiName: string, body: BodyInit, options: HttpClientOptions = {}): Promise<any> {
        return this.requestWithBody(apiName, 'POST', body, options);
    }

    public async patch(apiName: string, body: BodyInit, options: HttpClientOptions = {}): Promise<any> {
        return this.requestWithBody(apiName, 'PATCH', body, options);
    }

    public async put(apiName: string, body: BodyInit, options: HttpClientOptions = {}): Promise<any> {
        return this.requestWithBody(apiName, 'PUT', body, options);
    }

    public async delete(apiName: string, body: BodyInit, options: HttpClientOptions = {}): Promise<any> {
        return this.requestWithBody(apiName, 'DELETE', body, options);
    }
}

export const getHttpClient = (): HttpClient => {
    let url = process.env.API_SERVICE_URL;
    url = 'https://portal.mtcoffee.net';
    // url = 'https://localhost:44310';

    return new HttpClient(url);
};
