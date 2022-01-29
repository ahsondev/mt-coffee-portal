import React from 'react';
import { DiscountOption } from './sharedModels';
import { NumberPickerButton } from '@components/common/form/numberPicker';
import './orderSummary.scss';


interface OrderSummaryProps {
    subtotal: number;
    discountAmount: number | any;
    taxAmount: number;
    onGetDiscountOptions?: () => DiscountOption[];
    onChangeNumberPicker?:(value?:number) => void;
}

interface OrderSummaryState {
}

export class OrderSummary extends React.PureComponent<OrderSummaryProps, OrderSummaryState> {

    constructor(props: OrderSummaryProps) {
        super(props);

        this.state = {
            products: []
        };
    }

    public static defaultProps: OrderSummaryProps = {
        discountAmount: 0,
        subtotal: 0,
        taxAmount: 0
    };
    private onChangeNumberPicker = (value?: number): void => {
        if(this.props.onChangeNumberPicker){
            this.props.onChangeNumberPicker(value);
        }
      };

      
      public render(): React.ReactNode {
          const { subtotal = 0, taxAmount = 0, discountAmount } = this.props;
        return (
            <div className='mt-order-summary'>
                <div data-grid="col-12" className='f-row'>
                    <div className='f-col-left'>Subtotal</div>
                    <div className='f-col-right'>{subtotal.toFixed(2)}</div>
                </div>
                <div data-grid="col-12" className='f-row'>
                    <div className='f-col-left'>Discount</div>
                    <div className='f-col-right' style={{ color: 'var(--mt-color-font-discount)' }}>
                    <NumberPickerButton numDecimals={2} value={discountAmount || 0} onChange={this.onChangeNumberPicker}/>
                    </div>
                </div>
                <div data-grid="col-12" className='f-row'>
                    <div className='f-col-left'>Tax</div>
                    <div className='f-col-right'>{((subtotal - discountAmount) * taxAmount).toFixed(2)}</div>
                </div>
                <div data-grid="col-12" className='f-row'>
                    <div className='f-col-left' style={{ borderBottom: 'none' }}></div>
                    <div className='f-col-right' style={{ fontSize: '26px', borderBottom: 'none' }}>
                        {((subtotal - discountAmount) + taxAmount).toFixed(2)}
                    </div>
                </div>
                <div data-grid='col-12' className='f-row cc-order-summary-buttons'>
                    <button className='c-button f-teal f-inline icon-x-before icon-credit-card' title='Card'><span aria-hidden={true}>Card</span></button>
                    <button className='c-button f-teal f-inline icon-x-before icon-money' title='Cash'><span aria-hidden={true}>Cash</span></button>
                    <button className='c-button f-gray f-inline icon-x-before icon-dot-3' title='More'><span aria-hidden={true}>...</span></button>
                </div>
            </div>
        );
    }
}