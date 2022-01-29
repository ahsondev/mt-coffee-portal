import { QuantityTile } from '@root/components/common/quantityTile';
import React from 'react';
import { ProductOption, ProductVariant } from '../../../models/product';
import { TileButton } from '../../common/tileButton';
import './lineItemCustomizer.scss';
import { OrderItem } from './sharedModels';

interface LineItemCustomizerProps {
  options: ProductOption[];
  variants: ProductVariant[];
  defaultPrice: number;
  onClickFinish?: () => void;
  orderItem: OrderItem;
  onChangeOrderItem: (loi: OrderItem) => void;
}

interface LineItemCustomizerState {
}

export class LineItemCustomizer extends React.PureComponent<LineItemCustomizerProps, LineItemCustomizerState> {
  constructor(props: LineItemCustomizerProps) {
    super(props);

    this.state = {
      orderItems: []
    };
  }

  public render(): React.ReactNode {
    const { options, variants, defaultPrice, orderItem } = this.props;
    return (
      <div className='mt-lineItem-customizer'>
        <div className='cc-col-finished'>
          <TileButton
            title='Done'
            onClick={this.props.onClickFinish}
          />
        </div>
        <div className='cc-col-variants'>
          {variants.length && variants.map((v, vi) => {
            const isSelected = orderItem.variantId === undefined ? v.isDefaultVariant : v.id === orderItem.variantId;
            const priceDiff = (v.priceOverride || defaultPrice) - defaultPrice;
            let priceDiffStr: string;
            if (priceDiff > 0) priceDiffStr = `+${priceDiff.toFixed(2)}`;
            else if (priceDiff < 0) priceDiffStr = priceDiff.toFixed(2);
            else priceDiffStr = `( ${this.props.defaultPrice.toFixed(2)} )`

            return <TileButton
              key={vi}
              title={v.name}
              className={!isSelected ? 'f-teal' : 'f-teal f-border'}
              description={priceDiffStr}
              disabled={isSelected}
              onClick={() => this.props.onChangeOrderItem({ ...orderItem, variantId: v.id })}
            />
          }) || undefined}
          <span className='cc-col-label'>Variants</span>
        </div>
        <div className='cc-col-options'>
          {options.length && options.map((opt, oi) => {
            return <QuantityTile title={opt.name} key={oi}
              isQuantityEnabled={opt.isQuantityEnabled}
              borderEnabled={true}
              quantity={orderItem.options[opt.id!] || 0} className='f-red'
              onChangeQuantity={(quantity => {
                const nOpts = { ...orderItem.options };
                nOpts[opt.id!] = quantity;
                this.props.onChangeOrderItem({ ...orderItem, options: nOpts });
              })}
            />
          }) || undefined}
          <span className='cc-col-label'>Options</span>
        </div>
        {/* {products.length > 0 && products.map((p, i) => {
          const onClickTile = !!this.props.onClickProduct
            ? () => this.props.onClickProduct!(p.id!)
            : undefined;

          const colorCls = '';
          // switch (p.subcategory) {
          //   case 'Hot/Iced': colorCls = 'f-red-muted'; break;
          //   case 'Tea and Other': colorCls = 'f-green'; break;
          //   case 'Energy': colorCls = 'f-purple'; break;
          //   case 'Blended': colorCls = 'f-blue'; break;
          //   default: break;
          // }

          return <TileButton key={i}
            className={colorCls}
            title={p.name}
            description={undefined} // `$${price}`
            onClick={onClickTile}
          />
        })} */}
      </div>
    );
  }
}