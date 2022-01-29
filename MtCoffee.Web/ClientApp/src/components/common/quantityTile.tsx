import React from 'react';
import { IconButton } from './icons/iconButton';
import './quantityTile.scss';

interface QuantityTileProps {
  title: string;
  className?: string;
  disabled?: boolean;
  isQuantityEnabled: boolean;
  quantity: number;
  borderEnabled?: boolean;
  onChangeQuantity?: (quantity: number) => void;
}

interface QuantityTileState {
}

export class QuantityTile extends React.PureComponent<QuantityTileProps, QuantityTileState> {
  constructor(props: QuantityTileProps) {
    super(props);

    this.state = {
    };
  }

  // public static defaultProps: QuantityTileProps = {
  //   isQuantityEnabled: false
  //   title: ''
  // };

  private onClickPlus = () => {
    if (this.props.onChangeQuantity) {
      this.props.onChangeQuantity(this.props.quantity + 1);
    }
  }

  private onClickMinus = () => {
    if (this.props.onChangeQuantity) {
      this.props.onChangeQuantity(this.props.quantity - 1);
    }
  }

  private onClickToggle = () => {
    if (this.props.onChangeQuantity) {
      const nQ = this.props.quantity === 0 ? 1 : 0;
      this.props.onChangeQuantity(nQ);
    }
  }

  public render(): React.ReactNode {
    const {
      title, isQuantityEnabled, borderEnabled
    } = this.props;

    const quantity = isNaN(this.props.quantity) ? 0 : this.props.quantity;
    const className = (this.props.className || '') + ((borderEnabled && quantity > 0) ? ' f-border' : '');

    if (!isQuantityEnabled) {
      return (
        <div className={`mt-quantity-tile-button js-clickOnSpaceOrEnter f-s64 ${className}`.trim()}
          data-display='checkbox'
          tabIndex={0} role='checkbox' aria-checked={quantity > 0}
          aria-label={quantity > 0 ? `Add ${title}` : `Remove ${title}`}
          onClick={this.onClickToggle}>
          <div className='f-quantity'>
            {quantity}
          </div>
          <div className='f-title'>
            <span>{title}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div
          className={`mt-quantity-tile-button f-s64 ${className}`.trim()}
          data-display='counter'>
          <div className='f-quantity'>
            {quantity}
          </div>
          <div className='f-title'>
            <span>{title}</span>
          </div>
          <div className='f-buttons'>
            <IconButton iconName='plus' title='1' onClick={this.onClickPlus} />
            <IconButton iconName='minus' title='-1' onClick={this.onClickMinus} disabled={quantity < 1} />
          </div>
        </div>
      );
    }
  }
}