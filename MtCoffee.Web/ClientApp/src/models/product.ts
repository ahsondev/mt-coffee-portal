
export type DrinkSizeOption = '8oz' | '12oz' | '16oz' | '20oz' | '24oz' | '32oz';
// export type ProductCategory = 'Drinks' | 'Food';
// export type ProductSubcategory = 'Hot/Iced' | 'Bubble Tea' | 'Energy' | 'Blended' | 'Tea and Other' | 'Pastry'; 

export interface Product {
    id?: number;
    name: string;
    description?: string;
    price: number;
    isActive: boolean;

    categoryId?: number;
    hasVariants?: Readonly<boolean>;  // readonly
    discountIds: number[];
    productOptionIds: number[];
    variants: ProductVariant[];
}

export interface ProductVariant {
    id?: number;
    productId: number;
    name: string;
    priceOverride?: number;
    isDefaultVariant: boolean;
}

export interface ProductOption {
    id?: number;
    name: string;
    price?: number;
    optionGroupKey?: string;
    isQuantityEnabled: boolean;
    isActive: boolean;
}

export interface ProductCategory {
    id?: number;
    name: string;
    tileColor: string;
    sortOrder: number;
    categoryGroupName: string;
}