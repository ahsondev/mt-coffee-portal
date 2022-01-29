import * as React from 'react';
import { getId } from '@utils/getId';
import './textArea.scss';

export interface TextAreaProps {
  id?: string;
  name?: string;
  ariaLabel?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  rows?: number;
  classNameTextArea?: string;
  classNameLabel?: string;
  onChange?: (val: string) => void;
}

export class TextArea extends React.PureComponent<TextAreaProps> {
  private tbxId: string;

  constructor(props: TextAreaProps) {
    super(props);
    this.tbxId = props.id || getId('c-text-field');
  }

  private onChangeActual = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (this.props.onChange) {
      const nVal = e.target.value;
      this.props.onChange!(nVal);
    }
  };

  public render(): React.ReactNode {
    const {
      readOnly,
      classNameTextArea,
      classNameLabel,
      name,
      label,
      ariaLabel,
      placeholder,
      value = '',
    } = this.props;

    return <>

      {label && (<label className={`c-label ${classNameLabel}`} htmlFor={this.tbxId}>{label!}</label>)}

      <textarea
        className={`c-text-area f-flex ${classNameTextArea}`}
        aria-label={ariaLabel}
        rows={this.props.rows || 3}
        id={this.tbxId} name={name}
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        onChange={this.onChangeActual}
      />
    </>;
  }
}