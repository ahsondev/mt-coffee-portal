import { Logger } from '@root/utils/logger';
import React from 'react';
import ReactDOM from 'react-dom';

import './numberPicker.scss';

export interface NumberPickerProps {
  value?: number;
  allowUndefined: boolean;
  numDecimals: number;
  onChange?: (value?: number) => void;
  onClosePicker?: () => void;
  styleFlyout?: React.CSSProperties;
}

export interface NumberPickerState {
  valText: string;
  isNegative: boolean;
}

export class NumberPicker extends React.PureComponent<NumberPickerProps, NumberPickerState> {
  private focusedElementBeforeOpening?: Element;

  constructor(props: NumberPickerProps) {
    super(props);

    this.state = {
      valText: '',
      isNegative: false,
    };
  }

  public static defaultProps: NumberPickerProps = {
    allowUndefined: false,
    numDecimals: 0
  }

  private onKeyDelete = (): void => {
    this.setState({ valText: this.state.valText.substring(0, this.state.valText.length - 1) });
  }

  private onKeyInput = (key: string): void => {
    const updated = this.state.valText + key;
    this.setState({ valText: updated });
  }

  private onKeyFlipSign = (): void => {
    this.setState({ isNegative: !this.state.isNegative });
  }

  public static getFormattedValueText = (numDecimals: number, isNegative: boolean, valText: string): string => {
    const sign = (isNegative && '-') || ' ';

    while (valText.startsWith('0')) {
      valText = valText.slice(1);
    }

    const decimals = valText.substr(valText.length - numDecimals, numDecimals).padStart(numDecimals, '0');
    const integers = valText.substr(0, valText.length - numDecimals).padStart(1, '0');
    const rt = `${sign}${integers}${numDecimals > 0 ? '.' : ''}${decimals}`;

    return rt;
  }

  private doClosePicker = () => {
    this.haveArrowKeysBeenUsed = false;
    if (this.props.onClosePicker) {
      this.props.onClosePicker();
    }
  }

  private onClickConfirm = () => {
    const confirmedVal = (NumberPicker.getFormattedValueText(this.props.numDecimals, this.state.isNegative, this.state.valText));
    if (this.props.onChange) {
      const nVal = this.props.numDecimals > 0
        ? parseFloat(confirmedVal)
        : parseInt(confirmedVal, 10);
      this.props.onChange(nVal);
    }

    if (this.props.onClosePicker) { this.props.onClosePicker(); }
  }

  private onClickUndefined = () => {
    if (this.props.onChange) {
      this.props.onChange(undefined);
    }
    if (this.props.onClosePicker) { this.props.onClosePicker(); }
  }

  private haveArrowKeysBeenUsed: boolean = false;
  private onKeyPress = (ev: React.KeyboardEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const text = (ev.target as HTMLElement).textContent || '';
    let iconName = '';
    (ev.target as HTMLElement).classList.forEach(cls => {
      if (cls.startsWith('icon-')) {
        iconName = cls.replace('icon-', '');
      }
    });

    let x = 0, y = 0;
    let colSpan = 1;
    let rowSpan = 1;

    if (iconName === 'cancel-alt') {
      y = 4; x = 2;
    } else if (iconName === 'deny') {
      y = 0; x = 3;
    } else if ((ev.target as HTMLElement).classList.contains('cc-numberPickerInput')) {
      y = 0; x = 0; colSpan = 3;
    } else {
      switch (text) {
        case '7': y = 1; x = 0; break;
        case '8': y = 1; x = 1; break;
        case '9': y = 1; x = 2; break;
        case 'X': y = 1; x = 3; rowSpan = 2; break;

        case '4': y = 2; x = 0; break;
        case '5': y = 2; x = 1; break;
        case '6': y = 2; x = 2; break;

        case '1': y = 3; x = 0; break;
        case '2': y = 3; x = 1; break;
        case '3': y = 3; x = 2; break;
        case 'O': y = 3; x = 3; rowSpan = 2; break;

        case '+/-': y = 4; x = 0; break;
        case '0': y = 4; x = 1; break;
        case '00': y = 4; x = 2; break;
        default: y = 0; x = 0; break;
      }
    }

    switch (ev.key) {
      case 'ArrowRight': {
        this.haveArrowKeysBeenUsed = true;
        if (x < 3) x = Math.min(3, x + colSpan);
        ev.stopPropagation();
        ev.preventDefault();
        break;
      }
      case 'ArrowLeft': {
        this.haveArrowKeysBeenUsed = true;
        if (x > 0) x = Math.max(x - colSpan, 0);
        ev.stopPropagation();
        ev.preventDefault();
        break;
      }
      case 'ArrowDown':
        this.haveArrowKeysBeenUsed = true;
        if (y < 4) y = Math.min(4, y + rowSpan);
        ev.stopPropagation();
        ev.preventDefault();
        break;
      case 'ArrowUp':
        this.haveArrowKeysBeenUsed = true;
        if (y > 0) y = Math.max(y - rowSpan, 0);
        ev.stopPropagation();
        ev.preventDefault();
        break;
      case 'Escape':
        ev.stopPropagation();
        ev.preventDefault();
        this.doClosePicker();
        break;
      case 'Backspace':
        ev.stopPropagation();
        ev.preventDefault();
        if (this.state.valText.length > 0) {
          this.setState({ valText: this.state.valText.slice(0, this.state.valText.length - 1) });
        }
        break;
      case 'Enter':
        if (!this.haveArrowKeysBeenUsed) {
          // After entering in values, they may want to complete their entry
          // with the "Enter" key. Otherwise if they were using arrow keys to 
          // navigate, they probably wish to submit their entry when they hit
          // "Enter" key.
          this.haveArrowKeysBeenUsed = false;
          ev.stopPropagation();
          ev.preventDefault();
          this.onClickConfirm();
        }
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({ valText: this.state.valText + ev.key });
        return;
      default:
        Logger.debug('The key pressed was: ' + ev.key);
        return;
    }

    this.focusButtonAt(x, y);
  }

  private focusButtonAt(x: number, y: number): void {
    const elemContainer = document.getElementsByClassName('c-numberPickerFlyout').item(0) as Element;

    if (x === 3) {
      if (y === 0) {
        const row = elemContainer.children.item(0);
        const button = row && row.children.item(1);
        (button as HTMLButtonElement).focus();
      } else if (y === 1 || y === 2) {
        const row = elemContainer.children.item(1);
        const button = row && row.children.item(3);
        (button as HTMLButtonElement).focus();
      } else if (y === 3 || y === 4) {
        const row = elemContainer.children.item(3);
        const button = row && row.children.item(3);
        (button as HTMLButtonElement).focus();
      } else {
        throw new Error('Invalid coordinates: ' + x + ', ' + y);
      }
    } else if (y === 0) {
      const row = elemContainer.children.item(0);
      const button = row && row.children.item(0);
      (button as HTMLInputElement).focus();
    } else {
      const row = elemContainer.children.item(y);
      const button = row && row.children.item(x);
      (button as HTMLButtonElement).focus();
    }
  }

  private onClickShadePanel = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    if ((event.target as HTMLElement).classList.contains('c-shadePanel')) {
      this.doClosePicker();
    }
  }

  public render(): React.ReactNode {
    return ReactDOM.createPortal((
      <div className='c-shadePanel z-numberPicker'
        onClick={this.onClickShadePanel}
        aria-label='Close number input pad'
        style={this.props.styleFlyout}>
        <div className='c-numberPickerFlyout'>
          <div data-grid='col-12'>
            <input className='c-text-field cc-numberPickerInput' type='text'
              onKeyDown={this.onKeyPress} tabIndex={0} autoFocus={true}
              readOnly={true} placeholder='0.00'
              value={NumberPicker.getFormattedValueText(this.props.numDecimals, this.state.isNegative, this.state.valText)}
            />
            <button className='c-button f-compact f-yellow icon-x-before icon-cancel-alt'
              onClick={this.onKeyDelete} onKeyDown={this.onKeyPress}>&nbsp;</button>
          </div>
          <div data-grid='col-12' className='cc-picker-row' >
            <button className='c-button f-compact f-gray'
              onKeyDown={this.onKeyPress}
              onClick={() => this.onKeyInput('7')}>7</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('8')} onKeyDown={this.onKeyPress}>8</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('9')} onKeyDown={this.onKeyPress}>9</button>
            <button className='c-button f-compact f-red f-rowspan-2' onClick={this.doClosePicker} onKeyDown={this.onKeyPress}>X</button>
          </div>
          <div data-grid='col-12' className='cc-picker-row'>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('4')} onKeyDown={this.onKeyPress}>4</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('5')} onKeyDown={this.onKeyPress}>5</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('6')} onKeyDown={this.onKeyPress}>6</button>
          </div>
          <div data-grid='col-12' className='cc-picker-row'>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('1')} onKeyDown={this.onKeyPress}>1</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('2')} onKeyDown={this.onKeyPress}>2</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('3')} onKeyDown={this.onKeyPress}>3</button>
            <button className='c-button f-compact f-green f-rowspan-2' onClick={() => this.onClickConfirm()} onKeyDown={this.onKeyPress}>O</button>
          </div>
          <div data-grid='col-12' className='cc-picker-row'>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyFlipSign()} onKeyDown={this.onKeyPress}>+/-</button>
            <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('0')} onKeyDown={this.onKeyPress}>0</button>
            {this.props.allowUndefined && (
              <button className='c-button f-compact f-gray icon-x-before icon-deny' onClick={() => this.onClickUndefined()} onKeyDown={this.onKeyPress}></button>

            ) || (
                <button className='c-button f-compact f-gray' onClick={() => this.onKeyInput('00')} onKeyDown={this.onKeyPress}>00</button>
              )}
          </div>
        </div>
      </div>
    ), document.body, 'c-numberPickerFlyout');
  }
}
