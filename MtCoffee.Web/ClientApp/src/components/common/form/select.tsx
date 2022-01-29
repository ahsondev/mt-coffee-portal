import { getId } from '@root/utils/getId';
import * as React from 'react';

export interface SelectOption {
    text: string;
    value: string;
}

export interface SelectProps {
    id: string;
    name?: string;
    label: string;
    value?: string;
    readOnly?: boolean;
    options: SelectOption[];
    onChange?: (nVal: string) => void;
}

export class Select extends React.PureComponent<SelectProps> {
    private selectId: string;
    constructor(props: SelectProps) {
        super(props);
        this.selectId = props.id || getId('select-');
    }

    public static defaultProps: SelectProps = {
        id: '',
        options: [],
        label: ''
    };

    public render(): React.ReactNode {
        const { label, options, readOnly, name, value } = this.props;
        const onChange = !this.props.onChange ? undefined : (ev: React.ChangeEvent<HTMLSelectElement>) => {
            if (!!this.props.onChange) {
                const nVal = ev.target.value;
                this.props.onChange(nVal);
            }
        }
        return <>
            {label && <label className='c-label' htmlFor={this.selectId}>{label}</label>}
            <select
                id={this.selectId}
                className='c-select'
                name={name} disabled={readOnly}
                value={value || options.map(a => a.value)[0]}
                onChange={onChange}>
                {options.map((opt,i) => (<option key={i} value={opt.value}>{opt.text}</option>))}
            </select>
        </>;
    }
}