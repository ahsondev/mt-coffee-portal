import * as React from 'react';
import { getId } from '@utils/getId';

export interface TextFieldProps {
    id?: string;
    name?: string;
    ariaLabel?: string;
    label?: string;
    placeholder?: string;
    readOnly?: boolean;
    type?: string;
    value: string;
    classNameTextField?: string;
    classNameLabel?: string;
    onChange?: (val: string) => void;
}

export class TextField extends React.PureComponent<TextFieldProps> {
    private tbxId: string;

    constructor(props: TextFieldProps) {
        super(props);
        this.tbxId = props.id || getId('c-text-field');
    }

    private onChangeActual = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (this.props.onChange){
            const nVal = e.target.value;
            this.props.onChange!(nVal);
        }
    };

    public render(): React.ReactNode {
        const {
            readOnly,
            type = 'text',
            classNameTextField,
            classNameLabel,
            name,
            label,
            ariaLabel,
            placeholder,
            value = '',
        } = this.props;

        return <>

            {label && (<label className={`c-label ${classNameLabel}`} htmlFor={this.tbxId}>{label!}</label>)}

            <input
                className={`c-text-field f-flex ${classNameTextField}`}
                aria-label={ariaLabel}
                id={this.tbxId} name={name}
                readOnly={readOnly}
                placeholder={placeholder}
                type={type}
                value={value}
                onChange={this.onChangeActual}
            />
        </>;
    }
}