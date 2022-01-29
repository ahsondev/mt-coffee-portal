import { Checkbox } from '@root/components/common/form/checkbox';
import { Select } from '@root/components/common/form/select';
import { TextField } from '@root/components/common/form/textField';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { NumberPickerTextBox } from '@components/common/form/numberPicker';
import { ProductManager } from '@root/managers/productManager';
import { Product, ProductCategory } from '@root/models/product';
import { appHistory } from '@root/routes';
import { actions } from '@root/store';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import React from 'react';

interface ProductFormTabProps {
    productId: number;
    existingProduct?: Product;
    categories: ProductCategory[];
}

interface ProductFormTabState {
    editForm: Partial<Product>;
    isLoading: boolean;
    isModified: boolean;
}

export class ProductFormTab extends React.PureComponent<ProductFormTabProps, ProductFormTabState> {
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: ProductFormTabProps) {
        super(props);

        this.state = {
            isLoading: false,
            isModified: false,
            editForm: { ...props.existingProduct } || {}
        };
    }
    protected onChangeForm(key: keyof Product, val: Product[keyof Product]) {
        this.setStateAsync({
            isModified: true,
            editForm: {
                ...this.state.editForm,
                [key]: val
            }
        })
    }

    public onClickSaveFormAPI = async (entity: Partial<Product>) => {
        const api = new ProductManager();
        const rs = await api.save({
            id: entity.id || 0,
            discountIds: [],
            categoryId: entity.categoryId,
            isActive: entity.isActive !== false,
            name: entity.name || '',
            price: entity.price || 0,
            productOptionIds: [],
            variants: [],
            description: entity.description,
            hasVariants: entity.hasVariants || false
        });

        if (!rs.isSuccess) {
            MessageBarAPI.sendErrorPayload(rs);
            return false;
        }

        const list = await api.list();
        if (!list.isSuccess) {
            MessageBarAPI.sendErrorPayload(list);
            return false;
        }

        actions.setProducts(list.payload || []);
        MessageBarAPI.sendSuccess("Saved entity successfully.", 2000);
        appHistory.push(`/manage/products/edit/${rs.payload || 0}`)
        return true;
    }

    private onClickSaveForm = async () => {
        const df = this.state.editForm;
        await this.setStateAsync({ isLoading: true });
        await this.onClickSaveFormAPI(df);
        await this.setStateAsync({ isLoading: false });
    }


    private onClickCancelEntityEdit = () => {
        this.setState({ editForm: { ...this.props.existingProduct } });
    }

    public render(): React.ReactNode {
        const dForm = this.state.editForm;
        const isSaveDisabled = this.state.isModified === false || this.state.isLoading;
        // className={rootClassName}

        return <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onClickSaveForm();
            }}>

            <div data-grid='container pad-12x'>
                <div data-grid='col-7 pad-12x'>
                    <div data-grid='col-12'>
                        <h1 className='c-heading-2'>{'Product details'}</h1>
                    </div>
                    <div data-grid='col-12'>
                        <TextField
                            label='Name' type='text'
                            placeholder='Name of product'
                            value={dForm.name || ''}
                            onChange={(val) => this.onChangeForm('name', val)}
                        />
                    </div>
                    <div data-grid='col-12'>
                        <TextField
                            label='Description' type='text'
                            placeholder='A short description of the entity'
                            value={dForm.description || ''}
                            onChange={(val) => this.onChangeForm('description', val)}
                        />
                    </div>
                    <div data-grid='col-12'>
                        <Select
                            name='productCategory'
                            options={this.props.categories.map(c => ({
                                text: `${c.categoryGroupName} (${c.name})`,
                                value: `${c.id || 0}`
                            }))}
                            label='Category'
                            value={`${dForm.categoryId || 0}`}
                            onChange={(val) => this.onChangeForm('categoryId', val)}
                        />
                    </div>
                    <div data-grid='col-12'>
                        <NumberPickerTextBox
                            size='f-flex'
                            label='Price'
                            value={dForm.price || 0}
                            numDecimals={2}
                            onChange={(val) => this.onChangeForm('price', val)}
                        />
                    </div>
                    <div data-grid='col-6'>
                        <Checkbox
                            label='Enabled'
                            checked={dForm.isActive !== false}
                            onChange={(val) => this.onChangeForm('isActive', val)}
                        />
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