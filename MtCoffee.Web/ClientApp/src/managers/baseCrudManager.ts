import { HttpClient, getHttpClient } from '@root/utils/httpClient';
import { JsonPayload } from '@root/models/jsonPayload';
import { RequestPayload } from '@root/models/requestPayload';

export class BaseCrudManager<T> {
    protected httpClient: HttpClient;
    protected controllerName: string;

    constructor(controllerName: string) {
        this.httpClient = getHttpClient();
        this.controllerName = controllerName;
    }

    public async list(): Promise<JsonPayload<T[]>> {
        const rs = await this.httpClient.get(`${this.controllerName}/list`) as JsonPayload<T[]>;
        return rs;
    }

    public async create(model: T): Promise<JsonPayload<number>> {
        const rs = await this.httpClient.post(`${this.controllerName}/create`, JSON.stringify(model)) as JsonPayload<number>;
        return rs;
    }

    public async update(model: T): Promise<JsonPayload<number>> {
        const rs = await this.httpClient.put(`${this.controllerName}/update`, JSON.stringify(model)) as JsonPayload<number>;
        return rs;
    }

    public async save(model: T): Promise<JsonPayload<number>> {
        const rs = await this.httpClient.post(`${this.controllerName}/save`, JSON.stringify(model)) as JsonPayload<number>;
        return rs;
    }

    public async delete(discountId: number): Promise<JsonPayload<number>> {
        const rs = await this.httpClient.delete(`${this.controllerName}/delete?id=${discountId}`, '') as JsonPayload<number>;
        return rs;
    }

    public async deleteBulk(entityIds: number[]): Promise<JsonPayload<number>> {
        const payload: RequestPayload<number[]> = {
            payload: entityIds
        };

        const rs = await this.httpClient.delete(`${this.controllerName}/deleteBulk`, JSON.stringify(payload)) as JsonPayload<number>;
        return rs;
    }
}