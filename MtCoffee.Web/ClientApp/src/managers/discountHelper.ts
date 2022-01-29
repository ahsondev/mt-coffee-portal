import { Discount, DiscountType } from '@root/models/discount';
import { LineItem } from '@components/pages/order/sharedModels';
import { Logger } from '@root/utils/logger';

export class AppliedDiscount {
  effectivePercent?: number;
  effectiveAmount?: number;
}

interface LineItemDiscountVariables {
  quantity: number;
  unitPrice: number;
  type: DiscountType;
}


interface LineItemDiscountRequest {
  discountCustomAmount?: number;
  quantity: number;
  unitPrice: number;
  discountType?: DiscountType;
  discountAmount?: number;
  isOpenDiscount?: boolean;
  customDiscountEquation?: string;
}

export class DiscountHelper {
  /**
   * Calculates the AMOUNT ($N.00) that the discount is, based on the line item and discount.
   * @param li 
   * @param discount 
   * @returns 
   */
  public static calcDiscountAmount = (req: LineItemDiscountRequest): number => {
    const amountBeforeDiscount = req.quantity * req.unitPrice;
    const discountToApply = (req.isOpenDiscount && req.discountCustomAmount) || req.discountAmount || 0;

    if (req.discountType === 'AMOUNT') {
      return discountToApply;
    }

    if (req.discountType === 'PERCENT') {
      const amountRemovedByDiscount = amountBeforeDiscount * discountToApply / 100;
      return amountRemovedByDiscount;
    }

    if (req.discountType === 'CUSTOM') {
      try {
        let data: LineItemDiscountVariables = {
          quantity: req.quantity,
          unitPrice: req.unitPrice,
          type: req.discountType
        };

        const discountAmountFunc = window.eval(req.customDiscountEquation || '(data) => 0');
        const discountAmount = discountAmountFunc(data);

        if (!Number.isNaN(discountAmount)) {
          return discountAmount;
        }
      } catch (e) {
        Logger.error(e);
      }

      return 0;
    }

    return 0;
  }

  public static calcDiscountPercent = (li: Pick<LineItem, 'discountCustomAmount' | 'quantity' | 'unitPrice'>, discount: Discount) => {
    const amountBeforeDiscount = li.quantity * li.unitPrice;
    const discountToApply = (discount.isOpen && li.discountCustomAmount) || discount.amount || 0;

    if (discount.type === 'PERCENT') {
      return discountToApply;
    }

    if (discount.type === 'AMOUNT') {
      // what percentage of the total amount is our discountToApply amount?
      // X/100 = discountToApply/amountBeforeDiscount
      // x = discountToApply * 100 / amountBeforeDiscount
      const percentDiscounted = discountToApply * 100 / amountBeforeDiscount;
      return percentDiscounted;
    }

    if (discount.type === 'CUSTOM') {
      try {
        let data: LineItemDiscountVariables = {
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          type: discount.type
        };

        const discountAmountFunc = window.eval(discount.customEquation || '(data) => 0');
        const discountAmount = discountAmountFunc(data);
        if (!Number.isNaN(discountAmount)) {
          const percentDiscounted = discountAmount * 100 / amountBeforeDiscount;
          return percentDiscounted;
        }
      } catch (e) {
        Logger.error(e);
      }

      return 0;
    }

    return 0;
  }

}
