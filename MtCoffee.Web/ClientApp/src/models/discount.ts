
export const DEFAULT_DISCOUNT_SORT_ORDER = 50;
export type DiscountType = 'AMOUNT' | 'PERCENT' | 'CUSTOM';
export interface Discount {
    id?: number;
    name: string;
    description?: string;
    customEquation?: string;
    type: DiscountType;
    amount?: number;
    sortOrder?: number;
    isOpen: boolean;
    isManagerRequired: boolean;
    isActive: boolean;
    isAppliedToTransactions: boolean;
    isAppliedToItems: boolean;
}
