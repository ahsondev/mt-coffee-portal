import React from 'react';
import { IconButton } from '@root/components/common/icons/iconButton';
import { Discount } from '@root/models/discount';
import { MenuItem, Select } from '@material-ui/core';
import { Logger } from '@root/utils/logger';
import { getId } from '@root/utils/getId';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { NumberPicker } from '@components/common/form/numberPicker';
import { TextButton } from '@root/components/common/form/textButton';
import { LineItem } from './sharedModels';

import './discountPicker.scss';
import { DiscountHelper } from '@root/managers/discountHelper';

interface DiscountPickerProps {
  discounts: Discount[];
  selectedDiscountId?: number;
  openEntryAmountOrPercent?: number;
  lineItem: LineItem;
  onSelectDiscount?: (discountId?: number, openEntryAmountOrPercent?: number) => void;
}

interface DiscountPickerState {
  isSelectMenuOpen: boolean;
  isNumberPickerOpen: boolean;
  openEntryAmountOrPercentToTry?: number;
  selectedDiscountIdToTry?: number;
}

export class DiscountPicker extends React.PureComponent<DiscountPickerProps, DiscountPickerState> {
  private idClosedPickerElement = getId('discountPicker');
  private setStateAsync = setStateAsyncFactory(this);

  constructor(props: DiscountPickerProps) {
    super(props);

    this.state = {
      isSelectMenuOpen: false,
      isNumberPickerOpen: false
    };
  }

  private onOpenDiscountPicker = () => {
    this.setState({ isSelectMenuOpen: true });
  }

  private setFocusOnClosedPickerElement = () => {
    const elem = document.querySelector(`#${this.idClosedPickerElement}`) as HTMLElement;
    if (!!elem) {
      elem.focus();
    }
  }

  private onClickDiscount = async (discount?: Discount) => {
    if (!this.props.onSelectDiscount) {
      Logger.warn('No onSelectDiscount handler has been set yet.');
      return;
    }

    if (discount === undefined) {
      await this.setStateAsync({
        isSelectMenuOpen: false,
        openEntryAmountOrPercentToTry: undefined,
        selectedDiscountIdToTry: undefined,
      });
      this.props.onSelectDiscount(undefined, undefined);
      this.setFocusOnClosedPickerElement();
      return;
    }

    if (!discount.isOpen) {
      await this.setStateAsync({
        isSelectMenuOpen: false,
        openEntryAmountOrPercentToTry: undefined,
        selectedDiscountIdToTry: undefined,
      });
      this.props.onSelectDiscount(discount.id, undefined);
      this.setFocusOnClosedPickerElement();
      return;
    }

    await this.setStateAsync({
      isNumberPickerOpen: true,
      openEntryAmountOrPercentToTry: undefined,
      selectedDiscountIdToTry: discount.id
    });
  }

  private getItemDisplayFragment(discount?: Discount): React.ReactFragment {
    if (discount === undefined) {
      return <span className='cc-label'>No discount</span>;
    }

    const dispAmount = discount.isOpen ? '' : discount.amount;
    let dispValue: React.ReactFragment;

    switch (discount.type) {
      case 'AMOUNT':
        dispValue = `$${dispAmount}`;
        break;
      case 'PERCENT':
        dispValue = `${dispAmount}%`;
        break;
      case 'CUSTOM':
        dispValue = '---';
        break;
    }

    return <>
      <span className={`cc-label`}>{discount.name}</span>
      <span className='cc-value'>{dispValue}</span>
    </>;
  }

  private renderSelectMenu = () => {
    return (
      <Select
        className='mt-discountPicker-sel-input'
        key='dp-selectMenu'
        open={true}
        disableUnderline={true}
        value={this.props.selectedDiscountId}
        onClose={async () => {
          await this.setStateAsync({ isSelectMenuOpen: false })
          this.setFocusOnClosedPickerElement();
        }}
        onOpen={() => this.setState({ isSelectMenuOpen: true })}
        MenuProps={{ className: 'mt-discountPicker-select' }}
      >
        <MenuItem key='select-none' value={undefined} onClick={() => this.onClickDiscount(undefined)}>
          <span className='cc-label'><em>None</em></span>
        </MenuItem>

        {this.props.discounts.map((option: Discount, di: number) => {
          return (
            <MenuItem
              key={di}
              value={option.id}
              onClick={() => this.onClickDiscount(option)}
            >
              {this.getItemDisplayFragment(option)}
            </MenuItem>
          );
        })}
      </Select >
    );
  }

  public componentDidUpdate(prevProps: Readonly<DiscountPickerProps>, prevState: Readonly<DiscountPickerState>) {
    console.log('did_update', { prevProps, prevState, p: this.props, s: this.state });
  }
  // This only happens for the "open amount" or "open percent" cases.
  private renderNumberPickerForOpenEntry = () => {
    if (!this.state.isNumberPickerOpen) { return undefined; }
    if (this.state.selectedDiscountIdToTry === undefined) { return undefined; }
    const selectedDiscount = this.props.discounts.find(x => x.id === this.state.selectedDiscountIdToTry);

    if (!selectedDiscount) {
      Logger.error('Invalid state. The selected discount was not found.');
      return undefined;
    }

    if (selectedDiscount.isOpen === false) {
      Logger.error('Invalid state. The discount is not open entry type.');
      return undefined;
    }

    const isAmount = selectedDiscount.type === 'AMOUNT';
    return (<NumberPicker
      allowUndefined={false}
      numDecimals={isAmount ? 2 : 0}
      onClosePicker={() => {
        this.setState({ isNumberPickerOpen: false });
      }}
      onChange={(val) => {
        this.setState({ openEntryAmountOrPercentToTry: val });

        if (this.props.onSelectDiscount) {
          this.props.onSelectDiscount(this.state.selectedDiscountIdToTry, val);
          this.setState({ openEntryAmountOrPercentToTry: undefined });
        }
      }}
    />);
  }

  private renderDiscountDisplay = () => {
    const discount = this.props.discounts.find(x => x.id === this.props.selectedDiscountId);
    if (discount === undefined) {
      Logger.error('Make sure the discount is valid before calling this function.');
      return undefined;
    }

    let dispValue = '';
    let dispAmount = (discount.isOpen ? this.props.openEntryAmountOrPercent : discount.amount) || 0;

    switch (discount.type) {
      case 'AMOUNT':
        dispValue=  `$${NumberPicker.getFormattedValueText(2, dispAmount < 0, ''+(dispAmount * 100))}`;
        break;
      case 'PERCENT':
        dispValue = `${dispAmount}%`;
        break;
      case 'CUSTOM':
        dispAmount = DiscountHelper.calcDiscountAmount({
          discountType: discount.type,
          isOpenDiscount: discount.isOpen,
          customDiscountEquation: discount.customEquation,
          discountAmount: discount.amount,
          unitPrice: this.props.lineItem.unitPrice,
          quantity: this.props.lineItem.quantity,
          discountCustomAmount: this.props.openEntryAmountOrPercent
        });
        dispValue=  `$${NumberPicker.getFormattedValueText(2, dispAmount < 0, ''+(dispAmount * 100))}`;
        break;
    }

    return (<TextButton
      text={dispValue}
      onClick={this.onOpenDiscountPicker}
      id={this.idClosedPickerElement}
    />);
  }

  public render(): React.ReactNode {
    const {
      selectedDiscountId,
      onSelectDiscount,
      discounts,
    } = this.props;

    const {
      isSelectMenuOpen,
      isNumberPickerOpen,
      openEntryAmountOrPercentToTry
    } = this.state;

    const numberPickerOpenEntry = this.renderNumberPickerForOpenEntry();
    const selectMenu = isSelectMenuOpen && this.renderSelectMenu() || undefined;
    const btnPlusIcon = selectedDiscountId === undefined && (<IconButton
      key='dp-icon-button'
      id={this.idClosedPickerElement}
      className='mt-discountPicker'
      iconName='plus-squared-alt'
      title='Open number picker'
      onClick={this.onOpenDiscountPicker}
    />) || undefined;
    const elemDiscountDisplay = selectedDiscountId !== undefined && this.renderDiscountDisplay() || undefined;

    return <>
      {btnPlusIcon}
      {selectMenu}
      {numberPickerOpenEntry}
      {elemDiscountDisplay}
    </>;
  }
}