import { ProductCategory } from '../models/product';
import { BaseCrudManager } from './baseCrudManager';

export class ProductCategoryManager extends BaseCrudManager<ProductCategory> {
    constructor() {
        super('productCategory');
        (window as any)['mgr'] = { ...(window as any)['mgr'], productCategory: this };
    }
}