import * as React from 'react';
import { getId } from '@utils/getId';
import { FontIconName } from '../icons/iconNames';

export interface TextFieldActionProps {
    id?: string;
    name?: string;
    ariaLabel?: string;
    ariaLabelActionButton?: string;
    label?: string;
    placeholder?: string;
    readOnly?: boolean;
    type?: string;
    value: string;
    iconName: FontIconName;
    classNameTextFieldAction?: string;
    classNameLabel?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClickButton?: () => void;
    onClickTextField?: () => void;
    onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
}

export class TextFieldAction extends React.PureComponent<TextFieldActionProps> {
    private tbxId: string;

    constructor(props: TextFieldActionProps) {
        super(props);
        this.tbxId = props.id || getId('c-text-field');
    }

    private onActionProxy<T>(action: T): T | undefined {
        if (action !== undefined) {
            return action;
        } else {
            return undefined;
        }
    };

    public render(): React.ReactNode {
        const {
            readOnly,
            type = 'text',
            classNameTextFieldAction,
            classNameLabel,
            name,
            label,
            ariaLabel,
            placeholder,
            iconName,
            value = '',
            ariaLabelActionButton
        } = this.props;

        return <>
            <div className={`c-text-field-action f-flex ${classNameTextFieldAction}`}>
                {label && (<label className={`c-label ${classNameLabel}`} htmlFor={this.tbxId}>{label!}</label>)}
                <input
                    className='cc-textbox'
                    aria-label={ariaLabel}
                    id={this.tbxId} name={name}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    type={type}
                    value={value}
                    onClick={this.onActionProxy(this.props.onClickTextField)}
                    onChange={this.onActionProxy(this.props.onChange)}
                    onKeyPress={this.onActionProxy(this.props.onKeyPress)}
                />
                <button
                    className={`cc-button icon-x-before icon-right-open icon-${iconName}`}
                    type='button'
                    onClick={this.onActionProxy(this.props.onClickButton)}
                >
                    <span className="x-screen-reader">{ariaLabelActionButton}</span>
                </button>
            </div>
        </>;
    }
}