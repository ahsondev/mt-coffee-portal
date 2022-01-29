export interface GiftCardInfo {
    id?: number;
    points: number;
    balance: number;
    phone?: string;
    cardSwipe?: string;
    primaryAccountNumber?: string;
    lastUsed?: Date;
    isActive: boolean;
}