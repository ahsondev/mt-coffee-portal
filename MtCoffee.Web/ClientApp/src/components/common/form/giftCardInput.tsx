import * as React from 'react';
import { getId } from '@utils/getId';
import { TextFieldAction } from './textFieldAction';
import { FontIconName } from '../icons/iconNames';
import { setStateAsyncFactory } from '@root/utils/stateSetter';

export interface GiftCardInputProps {
    id?: string;
    name?: string;
    ariaLabel?: string;
    label?: string;
    readOnly?: boolean;
    value: string;
    onChange?: (val: string, displayText: string) => void;
}

export interface GiftCardInputState {
    displayText: string;
    isLocked: boolean;
}

/**
 * If SLOW typing, assume manual entry.
 * If FAST typing, assume automatic entry.
 * 
 * Show results inside text box, but show as formatted.
 * OnChange, evaluate...
 */
export class GiftCardInput extends React.PureComponent<GiftCardInputProps, GiftCardInputState> {
    private tbxId: string;
    private actualText: string = '';
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: GiftCardInputProps) {
        super(props);
        this.tbxId = props.id || getId('c-text-field');

        this.state = {
            displayText: '',
            isLocked: false
        };
    }

    private onKeyPress = async (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === 'Enter') {
            await this.onSubmitValue();
            await this.setStateAsync({ isLocked: !this.state.isLocked });
        } else if (ev.key && ev.key.length === 1) {
            if (this.state.isLocked) {

                 // Allow onChangeInput to populate actual value. Set blank to avoid duplicate char entries.
                await this.setStateAsync({ isLocked: false, displayText: '' });
                this.actualText = '';
            }
        }
    };

    private onSubmitValue = async () => {
        if (this.actualText.startsWith('%B')) {
            const scrubbed = this.actualText.substring('%B'.length, this.actualText.indexOf('^'));
            await this.setStateAsync({ displayText: scrubbed });
        }

        if (this.props.onChange) {
            this.props.onChange(this.actualText, this.state.displayText);
        }
    };

    private onChangeTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nVal = e.target.value;
        this.actualText = nVal;
        this.setState({ displayText: nVal });
    };

    private onClickButton = async () => {
        await this.setStateAsync({ isLocked: !this.state.isLocked });
        await this.onSubmitValue();
    }

    public render(): React.ReactNode {
        const {
            readOnly,
            name,
            label,
            ariaLabel,
        } = this.props;

        const { displayText, isLocked } = this.state;

        const iconName: FontIconName = isLocked ? 'lock' : 'right-open';

        return <>
            <TextFieldAction
                label={label}
                id={this.tbxId} name={name}
                placeholder='Scan card'
                value={displayText}
                aria-label={ariaLabel}
                ariaLabelActionButton={'Confirm gift card entry'}
                readOnly={readOnly}
                iconName={iconName}
                onChange={this.onChangeTextInput}
                onKeyPress={this.onKeyPress}
                onClickButton={this.onClickButton}
            />
        </>;
    }
}