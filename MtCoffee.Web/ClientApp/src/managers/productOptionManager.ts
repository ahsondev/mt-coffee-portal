import { JsonPayload } from '@root/models/jsonPayload';
import { ProductOption } from '../models/product';
import { BaseCrudManager } from './baseCrudManager';

export class ProductOptionManager extends BaseCrudManager<ProductOption> {
    constructor() {
        super('productOption');
        (window as any)['mgr'] = { ...(window as any)['mgr'], productOpt: this };
    }

    public linkToProducts = async (productOptionId: number, productIds: number[]): Promise<JsonPayload<boolean | undefined>> => {
        const body: FormData = new FormData();
        body.append('productOptionId', productOptionId.toString());
        productIds.forEach(pid => body.append('productIds', pid.toString()));

        const rs = await this.httpClient.post(`${this.controllerName}/linkToProducts/`, body) as JsonPayload<boolean | undefined>;

        return rs;
    }

    public unlinkFromProducts = async (productOptionId: number, productIds: number[]): Promise<JsonPayload<boolean | undefined>> => {
        const body: FormData = new FormData();
        body.append('productOptionId', productOptionId.toString());
        productIds.forEach(pid => body.append('productIds', pid.toString()));

        const rs = await this.httpClient.delete(`${this.controllerName}/unlinkFromProducts/`, body) as JsonPayload<boolean | undefined>;

        return rs;
    }
}