import { getId } from '@root/utils/getId';
import * as React from 'react';

export interface CheckboxProps {
    id: string;
    name?: string;
    checked: boolean;
    label: string;
    readOnly?: boolean;
    onChange?: (isChecked: boolean) => void;
}

export class Checkbox extends React.PureComponent<CheckboxProps> {
    private cbxId: string;
    constructor(props: CheckboxProps) {
        super(props);
        this.cbxId = props.id || getId('checkbox-');
    }

    public static defaultProps: CheckboxProps = {
        id: '',
        checked: false,
        label: ''
    };

    public render(): React.ReactNode {
        const { label, checked, readOnly, name } = this.props;
        const onChange = !this.props.onChange ? undefined : () => this.props.onChange && this.props.onChange(!checked);

        return <div className='c-checkbox'>
            <label className="c-label js-clickOnSpaceOrEnter" htmlFor={this.cbxId} tabIndex={0} >
                <input aria-label={label} checked={checked}
                    id={this.cbxId} name={name}
                    readOnly={readOnly}
                    type="checkbox" value={checked.toString()} aria-checked={checked || undefined}
                    onChange={onChange}
                />
                <span aria-hidden="true">{label}</span>
            </label>
        </div>;
    }
}