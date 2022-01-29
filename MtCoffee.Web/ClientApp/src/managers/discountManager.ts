import { JsonPayload } from '@root/models/jsonPayload';
import { Discount } from '@root/models/discount';
import { BaseCrudManager } from './baseCrudManager';

export class DiscountManager extends BaseCrudManager<Discount> {

  constructor() {
    super('discount');
    (window as any)['mgr'] = { ...(window as any)['mgr'], discount: this };
  }

  public async unlinkFromProducts(discountId: number, productIds: number[]): Promise<JsonPayload<number>> {
    const data: FormData = new FormData();
    data.append('discountId', '' + discountId);
    data.append('productIds', productIds.join(','));
    // let rs = await this.httpClient.delete(`discounts/UnlinkFromProducts?discountId=${discountId}&productIds=${productIds.join(',')}`) as JsonPayload<number>;
    const rs = await this.httpClient.delete(`discounts/UnlinkFromProducts`, data) as JsonPayload<number>;
    return rs;
  }

  public async linkToProducts(discountId: number, productIds: number[]): Promise<JsonPayload<boolean>> {
    const data: FormData = new FormData();
    data.append('discountId', '' + discountId);
    data.append('productIds', productIds.join(','));
    // let rs = await this.httpClient.delete(`discounts/linkToProducts?discountId=${discountId}&productIds=${productIds.join(',')}`) as JsonPayload<boolean>;
    const rs = await this.httpClient.delete(`discounts/linkToProducts`, data) as JsonPayload<boolean>;
    return rs;
  }
}