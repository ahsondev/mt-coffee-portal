import { ProductVariant } from '../models/product';
import { BaseCrudManager } from './baseCrudManager';

export class ProductVariantManager extends BaseCrudManager<ProductVariant> {
    constructor() {
        super('productVariant');
        (window as any)['mgr'] = { ...(window as any)['mgr'], productVariant: this };
    }
}