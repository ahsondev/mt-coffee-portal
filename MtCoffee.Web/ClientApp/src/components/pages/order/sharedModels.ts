import { DiscountType } from "@root/models/discount";

export interface LineItem {
    descTitle: string;
    descSubtitle?: string; // options
    total: number;
    quantity: number; // float
    unitPrice: number; // float
    discountId?: number;
    discountCustomAmount?: number;
    uniqueId: string;
}

export interface DiscountOption {
    title: string;
    description?: string;
    discountType: 'percent' | 'amount';
    discountPer: 'unit' | 'line-item' | 'order';
    isCustomAmount?: boolean;
    amount?: number;
}

export interface Order {
    items: OrderItem[];
}

export interface OrderItem {
    // ID => Quantity
    options: Record<number, number>;
    variantId?: number;
    productId: number;
    quantity: number;
    discountId?: number;
    discountCustomAmount?: number;
}