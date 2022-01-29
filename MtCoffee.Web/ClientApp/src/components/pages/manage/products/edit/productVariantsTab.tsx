import { Column, Header, Table, TableItem, TextCell } from '@root/components/common/cardTable2';
import { Checkbox } from '@root/components/common/form/checkbox';
import { TextField } from '@root/components/common/form/textField';
import { IconButton } from '@root/components/common/icons/iconButton';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { NumberPickerButton } from '@components/common/form/numberPicker';
import { ProductVariantManager } from '@root/managers/productVariantManager';
import { Product, ProductVariant } from '@root/models/product';
import { actions, store } from '@root/store';
import { Logger } from '@root/utils/logger';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import React from 'react';

interface ProductVariantsTabProps {
    productId: number;
    existingProduct: Product;
}

type SaveState = 'saved' | 'delete-pending' | 'modified' | 'added';
interface ProductVariantRow extends TableItem {
    variant: ProductVariant;
    saveState: SaveState;
}

interface ProductVariantsTabState {
    entities: ProductVariantRow[];
    isLoading: boolean;
    isModified: boolean;
}

export class ProductVariantsTab extends React.PureComponent<ProductVariantsTabProps, ProductVariantsTabState> {
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: ProductVariantsTabProps) {
        super(props);

        this.state = {
            isLoading: false,
            isModified: false,
            entities: (props.existingProduct.variants || []).map<ProductVariantRow>((v, vi) => ({
                variant: v,
                saveState: 'saved',
                itemId: `row-${Date.now()}-${vi}`
            }))
        };
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

        const toDelete = this.state.entities.filter(x => x.saveState === 'delete-pending');
        const toAdd = this.state.entities.filter(x => x.saveState === 'added');
        const toModify = this.state.entities.filter(x => x.saveState === 'modified');
        const defSelected = this.state.entities.filter(x => x.variant.isDefaultVariant).filter(x => x.saveState !== 'delete-pending');
        const nonDeleted = this.state.entities.filter(x => x.saveState !== 'delete-pending');

        if (defSelected.length > 1) {
            MessageBarAPI.sendWarn('Only one variant can be selected as the default.', 2000);
            return;
        }

        if (defSelected.length < 1 && nonDeleted.length > 0) {
            MessageBarAPI.sendWarn('At least one default variant must be selected.', 2000);
            return;
        }

        if (nonDeleted.some(x => !x.variant.name.trim())) {
            MessageBarAPI.sendWarn('Names must be specified for the variants.', 2000);
            return;
        }

        const api = new ProductVariantManager();
        await this.setStateAsync({ isLoading: true });

        if (toDelete.length > 0) {
            const rsOp = await api.deleteBulk(toDelete.map(x => x.variant.id || 0));
            if (rsOp.isSuccess) {
                MessageBarAPI.sendSuccess(`Deleted ${toDelete.length} variants.`, 2000);
            } else {
                MessageBarAPI.sendErrorPayload(rsOp);
            }
        }

        if (toAdd.length > 0) {
            const rsOp = await Promise.all(toAdd.map(async x => {
                const rsAdd = await api.create(x.variant);
                x.variant.id = rsAdd.payload;
                return rsAdd;
            }));

            if (rsOp.filter(rs => rs.isSuccess).length > 0) {
                MessageBarAPI.sendSuccess(`Added ${toAdd.length} variants.`, 2000);
            }

            rsOp.filter(rs => rs.isSuccess === false).forEach(rs => MessageBarAPI.sendErrorPayload(rs));
        }

        if (toModify.length > 0) {
            const rsOps = await Promise.all(toModify.map(async x => {
                const rsUpdate = await api.update(x.variant);
                return rsUpdate;
            }));

            if (rsOps.filter(rs => rs.isSuccess).length > 0) {
                MessageBarAPI.sendSuccess(`Updated ${toModify.length} variants.`, 2000);
            }

            rsOps.filter(rs => rs.isSuccess === false).forEach(rs => MessageBarAPI.sendErrorPayload(rs));
        }

        const nProducts = store.getState().products.map(p => {
            if (p.id === this.props.productId) {
                const nP = { ...p };
                nP.variants = nonDeleted.map(x => x.variant);
                nP.hasVariants = nP.variants.length > 0;
                return nP;
            }

            return p;
        });

        actions.setProducts(nProducts);

        await this.setStateAsync({
            isLoading: false,
            isModified: false,
            entities: nonDeleted.map(x => ({ ...x, saveState: 'saved' }))
        });

        MessageBarAPI.sendSuccess(`Saved product variants to local storage.`, 1500);
    }

    private onClickCancelEntityEdit = () => {
        this.setState({
            isModified: false,
            entities: (this.props.existingProduct.variants || []).map<ProductVariantRow>((v, vi) => ({
                variant: v,
                saveState: 'saved',
                itemId: `row-${Date.now()}-${vi}`
            }))
        });
    }

    private onChangeProductVariant = async <K extends keyof ProductVariant>(itemId: string, key: K, val: ProductVariant[K]) => {
        const nVariants: ProductVariantRow[] = (this.state.entities || []).map(nv => {
            if (nv.itemId === itemId) {
                let nST: SaveState = nv.saveState;
                if (nST === 'saved') {
                    nST = 'modified';
                }

                return {
                    ...nv,
                    saveState: nST,
                    variant: {
                        ...nv.variant,
                        [key]: val
                    }
                };
            }

            return nv;
        });

        await this.setStateAsync({ entities: nVariants, isModified: true });
    };

    private onClickDeleteProductVariant = (uniqueId: string): void => {
        const existing: ProductVariantRow | undefined = this.state.entities.find(x => x.itemId === uniqueId);
        if (!existing) return;
        if (existing.saveState === 'added') {
            const entities = this.state.entities.filter(x => x.itemId !== uniqueId);
            this.setStateAsync({ entities });
        } else {
            const entities = this.state.entities
                .map<ProductVariantRow>(x => x.itemId !== uniqueId ? x : { ...x, saveState: 'delete-pending' });
            this.setStateAsync({ entities, isModified: true });
        }
    }

    private onClickAddProductVariant = () => {
        const entities = this.state.entities;
        this.setState({
            entities: entities.concat({
                itemId: `row-${Date.now()}-${entities.length}`,
                saveState: 'added',
                variant: {
                    id: 0,
                    name: '',
                    productId: this.props.productId,
                    priceOverride: undefined,
                    isDefaultVariant: entities.length === 0
                }
            })
        })
    }

    public render(): React.ReactNode {
        const entities = this.state.entities;
        const isSaveDisabled = this.state.isModified === false || this.state.isLoading;
        const isAddEnabled = this.state.isLoading === false;

        return <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onClickSaveForm();
            }}>
            <div data-grid='container pad-12x'>
                <div data-grid='col-12 pad-12x'>
                    <div data-grid='col-12'>
                        <h1 className='c-heading-2'>Product variants <IconButton
                            onClick={this.onClickAddProductVariant}
                            iconName='plus-squared-alt'
                            title='Add variant'
                            disabled={!isAddEnabled}
                            style={{
                                maxHeight: 'unset',
                                maxWidth: 'unset',
                                fontSize: '24px',
                                verticalAlign: 'middle'
                            }}
                        /></h1>
                    </div>
                    <div data-grid='col-12'>
                        <br />
                        <hr className='c-divider' style={{ margin: '24px 0' }} />
                    </div>
                    <div data-grid='col-12'>
                        <Table data={entities} borders={true}
                            isHeaderVisible={true}
                            selection='none'
                            headerStyle='sticky'
                            collapseBreakpoint='extra-small'
                            className='f-editTable'
                        >
                            <Column dataKey='variant.name' onRenderContent={(v: ProductVariantRow) => {
                                return <TextField
                                    value={v.variant.name}
                                    onChange={(val) => this.onChangeProductVariant(v.itemId, 'name', val)}
                                />
                            }}>
                                <Header>Name</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='variant.isDefaultVariant' sortable={false} onRenderContent={(v: ProductVariantRow) => {
                                return <Checkbox checked={v.variant.isDefaultVariant}
                                    onChange={(val) => this.onChangeProductVariant(v.itemId, 'isDefaultVariant', val)}
                                />
                            }}>
                                <Header>Is default?</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='variant.priceOverride' onRenderContent={(v: ProductVariantRow) => {
                                return <NumberPickerButton
                                    value={v.variant.priceOverride}
                                    numDecimals={2}
                                    allowUndefined={true}
                                    showUndefinedAsButton={true}
                                    onChange={(val) => this.onChangeProductVariant(v.itemId, 'priceOverride', val)}
                                />
                            }}>
                                <Header>Price override</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='variant.id' sortable={false} onRenderContent={(v: ProductVariantRow) => {
                                return <IconButton iconName='trash-empty' title='Delete'
                                    onClick={() => this.onClickDeleteProductVariant(v.itemId)}
                                />
                            }}>
                                <Header>Delete</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='saveState' sortable={false}>
                                <Header>Save state</Header>
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