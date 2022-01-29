import React from 'react';
import { GiftCardInput } from './form/giftCardInput';
import { GiftCardManager } from '@root/managers/giftCardManager';
import './giftCardEditPanel.scss';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { Logger } from '@root/utils/logger';
import { NumberPickerTextBox } from '@components/common/form/numberPicker';
import { TextButton } from './form/textButton';
import { GiftCardInfo } from '@root/models/giftcard';

interface GiftCardEditPanelProps {
}

interface GiftCardEditPanelState {
    giftcardDisplay: string;
    giftcardActual: string;
    isLoading: boolean;
    gcMoney?: number;
    gcPoints?: number;
    gcId?: number;
}

export class GiftCardEditPanel extends React.PureComponent<GiftCardEditPanelProps, GiftCardEditPanelState> {
    private gcm = new GiftCardManager();
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: GiftCardEditPanelProps) {
        super(props);

        this.state = {
            giftcardDisplay: '',
            giftcardActual: '',
            isLoading: false,
            gcMoney: undefined,
            gcPoints: undefined,
        };
    }

    private onGiftcardValueChange = async (val: string, displayText: string) => {
        Logger.debug('Scanning giftcard', { val, displayText });
        await this.setStateAsync({ isLoading: true });
        this.setState({ giftcardActual: val, giftcardDisplay: displayText });
        const cardToLookupInApi = val;
        // if (val !== displayText) {
        //     // fetch info from DB instead.
        // }

        const info = await this.gcm.getInfo(cardToLookupInApi);

        Logger.debug('Money and points have been fetched.', { info });

        if (info.isSuccess && !!info.payload) {
            this.setState({ 
                gcMoney: info.payload.balance,
                gcId: info.payload.id,
                gcPoints: info.payload.points,
            });
        }  else {
            this.setState({ 
                gcMoney: 0,
                gcId: 0,
                gcPoints: 0,
            });
        }

        await this.setStateAsync({ isLoading: false });
    }

    private onChangeRewardPoints = (val?: number) => {
        this.setState({ gcPoints: val });
    }

    private onChangeMoney = (val?: number) => {
        this.setState({ gcMoney: val });
    }

    private onClickSave = async () => {
        await this.setStateAsync({ isLoading: true });

        let rs = await this.gcm.setInfo({
            balance: this.state.gcMoney || 0,
            points: this.state.gcPoints || 0,
            cardSwipe: this.state.giftcardActual,
            primaryAccountNumber: this.state.giftcardDisplay,
            isActive: true,
            id: this.state.gcId,
        } as GiftCardInfo);

        await this.setStateAsync({ isLoading: false });
    }

    public render(): React.ReactNode {
        const isVisible = true;
        const isEditEnabled = !!this.state.giftcardActual && this.state.isLoading === false;

        return (
            <div className='mt-GiftCardEditPanel' style={isVisible ? {} : { display: 'none' }}>
                {/* <SidePanel
                    isScrollVisible={true}
                    isbackgroundShaded={true}
                    open={true}
                >

                </SidePanel> */}
                <div data-grid='container pad-12x'>
                    <div data-grid='col-12'>
                        <GiftCardInput
                            label='Scan card'
                            value={this.state.giftcardActual}
                            onChange={this.onGiftcardValueChange}
                        />
                    </div>
                    <div data-grid='col-6'>
                        <NumberPickerTextBox
                            styleRoot={{ width: '100%' }}
                            label='Money Balance'
                            onChange={this.onChangeMoney}
                            disabled={!isEditEnabled}
                            numDecimals={2}
                            value={this.state.gcMoney}
                            size='f-flex'
                        />
                    </div>
                    <div data-grid='col-6'>
                        <NumberPickerTextBox
                            allowUndefined={true}
                            styleRoot={{ width: '100%' }}
                            label='Reward points'
                            onChange={this.onChangeRewardPoints}
                            numDecimals={0}
                            disabled={!isEditEnabled}
                            value={this.state.gcPoints}
                            size='f-flex'
                        />
                    </div>
                    <div data-grid='col-8'></div>
                    <div data-grid='col-4'>
                        <br />
                        <TextButton
                            text='Save'
                            iconName='right-open'
                            className='f-flex c-button f-green'
                            style={{ float: 'right' }}
                            onClick={this.onClickSave}
                            disabled={!isEditEnabled}
                        />
                    </div>
                </div>
            </div>
        );
    }
}