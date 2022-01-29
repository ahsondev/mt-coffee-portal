import { Column, Header, Table, TableItem, TextCell } from '@root/components/common/cardTable2';
import { IconButton } from '@root/components/common/icons/iconButton';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { ProductManager } from '@root/managers/productManager';
import { ProductOption } from '@root/models/product';
import { actions } from '@root/store';
import { Logger } from '@root/utils/logger';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import React from 'react';

interface ProductOptionsTabProps {
    productId: number;
    entities: ProductOption[];
    linkedEntityIds: number[];
}

type LinkState = 'linked' | 'link-pending' | 'unlink-pending' | 'unlinked';

interface EntityRow<T> extends TableItem {
    data: T;
    state: LinkState;
}

interface ProductOptionsTabState {
    entities: EntityRow<ProductOption>[];
    selectedRowIds: string[];
    isLoading: boolean;
    isModified: boolean;
}

export class ProductOptionsTab extends React.PureComponent<ProductOptionsTabProps, ProductOptionsTabState> {
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: ProductOptionsTabProps) {
        super(props);

        this.state = {
            isLoading: false,
            isModified: false,
            selectedRowIds: [],
            entities: (props.entities || []).map<EntityRow<ProductOption>>((v, vi) => ({
                data: v,
                itemId: `row-${Date.now()}-${vi}`,
                state: props.linkedEntityIds.includes(v.id || 0) ? 'linked' : 'unlinked'
            }))
        };
    }

    public componentDidUpdate(prevProps: Readonly<ProductOptionsTabProps>) {
        if (this.props.linkedEntityIds !== prevProps.linkedEntityIds) {
            this.setState({
                entities: (this.props.entities || []).map<EntityRow<ProductOption>>((v, vi) => ({
                    data: v,
                    itemId: `row-${Date.now()}-${vi}`,
                    state: this.props.linkedEntityIds.includes(v.id || 0) ? 'linked' : 'unlinked'
                }))
            });
        }
    }

    private onClickLinkSelected = () => {
        const updated = this.state.entities.map<EntityRow<ProductOption>>(e => {
            if (this.state.selectedRowIds.includes(e.itemId)) {
                if (e.state === 'unlinked') {
                    return { ...e, state: 'link-pending' };
                } else if (e.state === 'unlink-pending') {
                    return { ...e, state: 'linked' };
                }
            }
            return e;
        });

        this.setState({ entities: updated, isModified: true });
    }

    private onClickUnlinkSelected = () => {
        const updated = this.state.entities.map<EntityRow<ProductOption>>(e => {
            if (this.state.selectedRowIds.includes(e.itemId)) {
                if (e.state === 'linked') {
                    return { ...e, state: 'unlink-pending' };
                } else if (e.state === 'link-pending') {
                    return { ...e, state: 'unlinked' };
                }
            }
            return e;
        });

        this.setState({ entities: updated, isModified: true });
    }

    private onClickSaveForm = async () => {
        if (!this.state.isModified) {
            Logger.warn('Save is attempted even though form is not modified. Weird.', 1000);
            return;
        }

        if (this.state.isLoading) {
            Logger.warn('Cannot save form while form is loading.', 1000);
            return;
        }

        await this.setStateAsync({ isLoading: true });
        const api = new ProductManager();

        {
            const ids = this.state.entities.filter(x => x.state === 'link-pending').map(x => x.data.id!);
            if (ids.length > 0) {
                const rsQuery = await api.linkToProductOptions(this.props.productId, ids);
                if (rsQuery.isSuccess) {
                    MessageBarAPI.sendSuccess('Linked products to product options!', 2000);
                } else {
                    MessageBarAPI.sendErrorPayload(rsQuery);
                    await this.setStateAsync({ isLoading: false });
                    return;
                }
            }
        }

        {
            const ids = this.state.entities.filter(x => x.state === 'unlink-pending').map(x => x.data.id!);
            if (ids.length > 0) {
                const rsQuery = await api.unlinkFromProductOptions(this.props.productId, ids);
                if (rsQuery.isSuccess) {
                    MessageBarAPI.sendSuccess('Unlinked products from product options!', 2000);
                } else {
                    MessageBarAPI.sendErrorPayload(rsQuery);
                    await this.setStateAsync({ isLoading: false });
                    return;
                }
            }
        }

        const rsList = await api.list();
        // const upProduct = (rsList.isSuccess && rsList.payload || []).find(p => p.id === this.props.productId);
        // if (!!upProduct) {
        //     upProduct.productOptionIds.map<EntityRow<ProductOption>>((v, vi) => ({
        //         data: this.props.entities.find(x => x.id === v)!,
        //         itemId: `row-${Date.now()}-${vi}`,
        //         state: props.linkedEntityIds.includes(v.id || 0) ? 'linked' : 'unlinked'
        //     }));
        // }

        if (rsList.isSuccess) {
            actions.setProducts(rsList.payload || []);
        } else {
            MessageBarAPI.sendErrorPayload(rsList);
        }

        await this.setStateAsync({ isLoading: false, isModified: false, selectedRowIds: [] });

    }


    private onClickCancelEntityEdit = () => {
        this.setState({
            isModified: false,
            entities: (this.props.entities || []).map<EntityRow<ProductOption>>((v, vi) => ({
                data: v,
                itemId: `row-${Date.now()}-${vi}`,
                state: this.props.linkedEntityIds.includes(v.id || 0) ? 'linked' : 'unlinked'
            }))
        });
    }

    public render(): React.ReactNode {
        const entities = this.state.entities;
        const areCommandMenuBarButtonsDisabled = this.state.selectedRowIds.length === 0 || this.state.isLoading;
        const isSaveDisabled = this.state.isModified === false
            || this.state.isLoading
            || this.state.entities.every(c => c.state === 'linked' || c.state === 'unlinked');

        return <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onClickSaveForm();
            }}>
            <div data-grid='container pad-12x'>
                <div data-grid='col-8 pad-12x'>
                    <div data-grid='col-12'>
                        <h1 className='c-heading-2'>Product options</h1>
                    </div>
                    <div data-grid='col-12'>
                        <br />
                        <hr className='c-divider' style={{ margin: '24px 0' }} />
                    </div>
                    <div data-grid='col-12'>
                        <IconButton
                            title='Link'
                            iconName='link'
                            disabled={areCommandMenuBarButtonsDisabled}
                            onClick={this.onClickLinkSelected}
                        />
                        <IconButton
                            title='Unlink'
                            iconName='unlink'
                            disabled={areCommandMenuBarButtonsDisabled}
                            onClick={this.onClickUnlinkSelected}
                        />
                    </div>
                    <div data-grid='col-12'>
                        <Table data={entities} borders={true}
                            isHeaderVisible={true}
                            selection='multiple'
                            headerStyle='sticky'
                            collapseBreakpoint='extra-small'
                            className='f-editTable'
                            onSelectionChanged={(items) => this.setState({ selectedRowIds: items.map(x => x.itemId) })}
                        >
                            <Column dataKey='data.name'>
                                <Header>Name</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='data.optionGroupKey' sortable={true}>
                                <Header>GROUP_KEY</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='state' sortable={true} onRenderContent={(data: EntityRow<ProductOption>) => {
                                switch (data.state) {
                                    case 'linked': return 'Yes';
                                    case 'unlinked': return 'No';
                                    case 'link-pending': return 'Link pending';
                                    case 'unlink-pending': return 'Unlink pending';
                                }
                            }}>
                                <Header>Is Linked?</Header>
                                <TextCell />
                            </Column>
                        </Table>
                    </div>
                    <div data-grid='col-12'>
                        <br />
                        <hr className='c-divider' style={{ margin: '24px 0' }} />
                    </div>

                    <div data-grid='col-6'>
                        <button className='c-button f-gray f-flex' onClick={this.onClickCancelEntityEdit} type='button'>Cancel</button>
                    </div>
                    <div data-grid='col-6'>
                        <button className='c-button f-teal f-flex' type='submit' disabled={isSaveDisabled}>Save</button>
                    </div>
                </div>
            </div>
        </form>
    }
}