import React from 'react';
import { LineItem } from './sharedModels';
import { NumberPickerButton } from '@components/common/form/numberPicker';
import { IconButton } from '@root/components/common/icons/iconButton';
import { Discount } from '@root/models/discount';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { DiscountPicker } from './discountPicker';
import './lineItemTable.scss';
import { DiscountHelper } from '@root/managers/discountHelper';


interface LineItemTableProps {
  discounts: Discount[];
  lineItems: LineItem[];
  onChangeQuantity?: (li: LineItem, val: number) => void;
  onClickEdit?: (li: LineItem) => void;
  onChangeDiscount?: (li: LineItem, discount?: Discount, openEntryAmount?: number) => void;
}

interface LineItemTableState {
}

export class LineItemTable extends React.PureComponent<LineItemTableProps, LineItemTableState> {
  constructor(props: LineItemTableProps) {
    super(props);

    this.state = {
      products: []
    };
  }

  private onChangeQuantity = (li: LineItem, val: number) => {
    if (this.props.onChangeQuantity) {
      this.props.onChangeQuantity(li, val);
    }
  };

  private formatMoney = (val: number) => val.toFixed(2);

  private calcDiscountAmount = (li: LineItem) => {
    if (li.discountId === undefined) return 0;
    const discount = this.props.discounts.find(x => x.id === li.discountId);
    if (discount === undefined) return 0;
    
    return DiscountHelper.calcDiscountAmount({
      discountType: discount.type,
      isOpenDiscount: discount.isOpen,
      customDiscountEquation: discount.customEquation,
      discountAmount: discount.amount,
      unitPrice: li.unitPrice,
      quantity: li.quantity,
      discountCustomAmount: li.discountCustomAmount
    });
  }


  private calcDiscountPercent = (li: LineItem) => {
    if (li.discountId === undefined) return 0;
    const discount = this.props.discounts.find(x => x.id === li.discountId);
    if (discount === undefined) return 0;
    return DiscountHelper.calcDiscountPercent(li, discount);
  }

  public render(): React.ReactNode {
    let lineItems = this.props.lineItems;
    if (lineItems.length === 0) {
      lineItems = lineItems.concat({
        descTitle: 'Dummy item to take up space',
        quantity: 1,
        unitPrice: 0,
        discountCustomAmount: undefined,
        discountId: undefined,
        total: 0,
        uniqueId: 'dummy-placeholder-item',
        descSubtitle: 'dummy-subtitle',
      });
    }

    return (

      <table className='mt-line-item-table f-fixed f-border'>
        <thead>
          <tr>
            <th className='f-col-desc'>DESCRIPTION</th>
            <th className='f-col-quantity'>QTY</th>
            <th className='f-col-unit-price'>UNIT <span className='x-hide-medium'>PRICE</span></th>
            <th className='f-col-subtotal'>SUB<span className='x-hide-medium'>TOTAL</span></th>
            <th className='f-col-discount'>DISCOUNT</th>
            <th className='f-col-total'>TOTAL</th>
            <th className='f-col-total'>EDIT</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li, i) => {
            const discountAmount = this.calcDiscountAmount(li);
            const discountPercent = this.calcDiscountPercent(li);

            return (
              <tr className='f-line-item-row' key={i}
                style={li.uniqueId !== 'dummy-placeholder-item' ? {}
                  : { visibility: 'hidden', borderColor: 'transparent' }}
              >
                <td className='f-col-desc'>
                  <div className='cc-row-header'>DESCRIPTION</div>
                  <div className='cc-row-cell'>
                    <span className='f-descTitle'>{li.descTitle}</span>
                    {!!li.descSubtitle && <span className='f-descSubtitle'>{li.descSubtitle}</span>}
                  </div>
                </td>
                <td className='f-col-quantity'>
                  <div className='cc-row-header'>QTY</div>
                  <div className='cc-row-cell'>
                    <IconButton
                      iconName={li.quantity > 1 ? 'minus' : 'trash-empty'}
                      title={li.quantity > 1 ? 'Decrease quantity' : 'Remove item'}
                      onClick={() => this.onChangeQuantity(li, li.quantity - 1)}
                    />
                    <NumberPickerButton numDecimals={0}
                      value={li.quantity}
                      onChange={(val) => this.onChangeQuantity(li, val || 0)}
                    />
                    <IconButton
                      iconName='plus'
                      title='Increase quantity'
                      onClick={() => this.onChangeQuantity(li, li.quantity + 1)}
                    />
                  </div>
                </td>
                <td className='cc-td f-col-unit-price'>
                  <div className='cc-row-header'>UNIT PRICE</div>
                  <div className='cc-row-cell'>{this.formatMoney(li.unitPrice)}</div>
                </td>
                <td className='cc-td f-col-subtotal'>
                  <div className='cc-row-header'>SUBTOTAL</div>
                  <div className='cc-row-cell'>{this.formatMoney(li.unitPrice * li.quantity)}</div>
                </td>
                <td className='cc-td f-col-discount'>
                  <div className='cc-row-header'>DISCOUNT</div>
                  <div className='cc-row-cell'>
                    <DiscountPicker
                      key={`discout-picker-${i}`}
                      discounts={this.props.discounts}
                      lineItem={li}
                      selectedDiscountId={li.discountId}
                      openEntryAmountOrPercent={li.discountCustomAmount}
                      onSelectDiscount={(discountId, openEntryAmountOrPercent) => {
                        if (this.props.onChangeDiscount) {
                          const foundDiscount = this.props.discounts.find(x => x.id === discountId);
                          this.props.onChangeDiscount(li, foundDiscount, openEntryAmountOrPercent);
                        }
                      }}
                    />
                  </div>
                </td>
                <td className='cc-td f-col-total'>
                  <div className='cc-row-header'>TOTAL</div>
                  <div className='cc-row-cell'>{this.formatMoney((li.unitPrice * li.quantity) - discountAmount)}</div>
                </td>
                <td className='cc-td f-col-edit'>
                  <div className='cc-row-header'>EDIT</div>
                  <div className='cc-row-cell'><IconButton title='Edit' iconName='pencil'
                    onClick={!this.props.onClickEdit ? undefined : () => this.props.onClickEdit!(li)} /></div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}