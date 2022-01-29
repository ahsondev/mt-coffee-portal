import React from 'react';
import { Page } from '@pages/page';
import { GiftCardManager } from '@root/managers/giftCardManager';
import { GiftCardInput } from '@root/components/common/form/giftCardInput';

interface GiftCardIndexProps {
}

interface GiftCardIndexState {
    giftcardNumber: string;
}

export class GiftCardIndexPage extends React.PureComponent<GiftCardIndexProps, GiftCardIndexState> {
    private gcm = new GiftCardManager();
    constructor(props: GiftCardIndexProps) {
        super(props);

        this.state = {
            giftcardNumber: ''
        };
    }

    public render(): React.ReactNode {
        return (
            <Page>
                <div data-grid='container' id='gift-card-page'>
                    Scan your giftcard to check balance.
                </div>
                <GiftCardInput value={this.state.giftcardNumber}
                label='Card ID'
                onChange={(val) =>
                {
                    this.setState({giftcardNumber: val});
                }}
                />
            </Page>
        );
    }
}