import React from 'react';
import { getId } from '@root/utils/getId';
import { NumberPicker, NumberPickerProps } from './numberPicker';

// --------------------  T E X T _ B O X ---------------------------------------------------
interface NumberPickerTextBoxState {
  isPickerVisible: boolean;
}

interface NumberPickerTextBoxProps extends Omit<NumberPickerProps, 'onClosePicker'> {
  styleRoot?: React.CSSProperties;
  size: 'f-small' | 'f-flex' | '';
  disabled: boolean;
  label?: string;
}

export class NumberPickerTextBox extends React.PureComponent<NumberPickerTextBoxProps, NumberPickerTextBoxState> {
  private idToFocusOnClose = getId('numberPickerTextBox');
  private inputId = getId('numberPicker-');

  constructor(props: NumberPickerTextBoxProps) {
    super(props);

    this.state = {
      isPickerVisible: false
    };
  }

  public static defaultProps: NumberPickerTextBoxProps = {
    allowUndefined: false,
    disabled: false,
    numDecimals: 0,
    size: 'f-flex'
  }

  private doOpenPicker = () => {
    this.setState({ isPickerVisible: true }); // , valText: '', isNegative: false });
  }

  private onClosePicker = () => {
    this.setState({ isPickerVisible: false });

    if (!!this.idToFocusOnClose) {
      const elem = document.getElementById(this.idToFocusOnClose);
      if (!!elem) {
        elem.focus();
      }
    }
  }

  public render(): React.ReactNode {
    const {
      disabled,
      styleRoot,
      value,
      size,
      ...pickerProps
    } = this.props;

    const valAdjustedFordecimals = Math.round((value || 0) * Math.pow(10, this.props.numDecimals));
    const valToShow = (this.props.allowUndefined && value === undefined)
      ? 'N/A'
      : NumberPicker.getFormattedValueText(
        this.props.numDecimals,
        valAdjustedFordecimals < 0,
        Math.abs(valAdjustedFordecimals).toString()
      );

    return (<div className='c-numberPicker' style={styleRoot}>
      {!!this.props.label && <label className='c-label' htmlFor={this.inputId}>{this.props.label}</label>}
      <input
        className={`c-text-field f-inline ${size} ${disabled ? 'f-disabled' : ''}`.trim()}
        type='text'
        disabled={disabled}
        id={this.inputId}
        readOnly={true}
        value={valToShow}
        onClick={disabled ? undefined : this.doOpenPicker}
      />
      {this.state.isPickerVisible && <NumberPicker
        {...pickerProps}
        value={value}
        onClosePicker={this.onClosePicker}
      />}
    </div>);
  }
}
