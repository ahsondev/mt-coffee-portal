import React from 'react';
import { TextButton } from '@components/common/form/textButton';
import { IconButton } from '@components/common/icons/iconButton';
import { getId } from '@root/utils/getId';
import { NumberPicker, NumberPickerProps } from './numberPicker';

// --------------------  B U T T O N  ---------------------------------------------------
interface NumberPickerButtonState {
  isPickerVisible: boolean;
}

interface NumberPickerButtonProps extends Omit<NumberPickerProps, 'onClosePicker'> {
  showUndefinedAsButton: boolean;
  styleRoot?: React.CSSProperties;
  disabled: boolean;
}

export class NumberPickerButton extends React.PureComponent<NumberPickerButtonProps, NumberPickerButtonState> {
  private idToFocusOnClose = getId('numberPickerButton');

  constructor(props: NumberPickerButtonProps) {
    super(props);
    
    this.state = {
      isPickerVisible: false
    };
  }

  public static defaultProps: NumberPickerButtonProps = {
    showUndefinedAsButton: true,
    allowUndefined: false,
    disabled: false,
    numDecimals: 0
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
      {value === undefined && this.props.showUndefinedAsButton && (
        <IconButton
          id={this.idToFocusOnClose}
          iconName='plus-squared-alt'
          title='Open number picker'
          disabled={disabled}
          onClick={disabled ? undefined : this.doOpenPicker}
        />
      ) || (
          <TextButton
            id={this.idToFocusOnClose}
            onClick={disabled ? undefined : this.doOpenPicker}
            text={valToShow}
            disabled={disabled}
          />)}

      {this.state.isPickerVisible && <NumberPicker
        {...pickerProps}
        value={value}
        onClosePicker={this.onClosePicker}
      />}
    </div>);
  }
}