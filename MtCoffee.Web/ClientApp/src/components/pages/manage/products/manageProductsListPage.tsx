import React from 'react';
import { Product } from '@root/models/product';
import { actions, AppState } from '@root/store';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { ProductManager } from '@root/managers/productManager';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { BooleanCell, ColumnProps, Header, TableItem, TextCell } from '@root/components/common/cardTable2';
import { AbstractManageListPage, AbstractManageListPageProps, AbstractManageListPageStrings, ManageListPagePropsFromStore } from '../abstractManageListPage';

class ManageProductsListPageComponent extends AbstractManageListPage<Product> {

    public pageStrings: AbstractManageListPageStrings = {
        addNew: 'New product',
        title: 'Manage products'
    };

    public pagePath = 'products';
    public getRowId = (entity: Partial<Product>) => entity.id;
    public onFilterBySearchText = (entities: Product[], searchText: string) => entities.filter(e => e.name.toLowerCase().indexOf(searchText) > -1);
    public onConfirmDeleteEntityAPI = async (id: number) => {
        const api = new ProductManager();
        const rs = await api.delete(id);
        if (rs.isSuccess) {
            MessageBarAPI.sendSuccess("Deleted entity successfully.", 2000);
            actions.setProducts(this.props.entities.filter(e => e.id !== id));
            return true;
        } else {
            MessageBarAPI.sendErrorPayload(rs);
            return false;
        }
    }

    // public onClickSaveFormAPI = async (entity: Partial<Product>) => {
    //     const api = new ProductManager();
    //     const rs = await api.save({
    //         id: entity.id || 0,
    //         discountIds: [],
    //         isActive: entity.isActive !== false,
    //         name: entity.name || '',
    //         price: entity.price || 0,
    //         productOptionIds: [],
    //         variants: [],
    //         description: entity.description,
    //         hasVariants: entity.hasVariants || false
    //     });

    //     if (!rs.isSuccess) {
    //         MessageBarAPI.sendErrorPayload(rs);
    //         return false;
    //     }

    //     const list = await api.list();
    //     if (!list.isSuccess) {
    //         MessageBarAPI.sendErrorPayload(list);
    //         return false;
    //     }

    //     actions.setProducts(list.payload || []);
    //     MessageBarAPI.sendSuccess("Saved entity successfully.", 2000);
    //     return true;
    // }

    public getCustomTableColumnProps(colsBefore: ColumnProps<Product & TableItem>[], colsAfter: ColumnProps<Product & TableItem>[]): ColumnProps<Product & TableItem>[] {
        return [
            { isRowHeader: false, dataKey: 'name', children: [<Header key='h'>Name</Header>, <TextCell key='c' />] },
            { isRowHeader: false, dataKey: 'price', children: [<Header key='h'>Price</Header>, <TextCell key='c' />], onRenderContent: (item: Product) => item.price.toFixed(2) },
            { isRowHeader: false, dataKey: 'categoryId', children: [<Header key='h'>Category</Header>, <TextCell key='c' />],
             onRenderContent: (item: Product) => {
                const cat = this.props.categories && this.props.categories.filter(c => c.id === item.categoryId)[0];
                if (!cat) return 'Unknown';
                return `${cat.categoryGroupName} (${cat.name})`;
             }},
            {
                isRowHeader: false, dataKey: 'isActive', children: [<Header key='h'>Enabled</Header>, <BooleanCell key='c' />]
            }
        ]
    }


    // private onChangeProductVariant = async <K extends keyof ProductVariant>(dForm: Partial<Product>, d: ProductVariant, key: K, val: ProductVariant[K]) => {
    //     const nVariants: ProductVariant[] = (dForm.variants || []).map(nv => {
    //         if (nv.id === d.id) {
    //             return { ...nv, [key]: val };
    //         }

    //         return nv;
    //     });

    //     const nForm: Partial<Product> = { ...dForm, variants: nVariants };
    //     await this.setStateAsync({ editForm: nForm });
    // };

    // public renderEditForm(rootClassName: string): React.ReactNode {
    //     const dForm = this.state.editForm;
    //     const entity = dForm;
    //     const data = (entity && entity.variants || []).map<ProductVariant & TableItem>(v => ({
    //         ...v,
    //         itemId: (v.id || 0).toString()
    //     }));

    //     return <div data-grid='container pad-12x' className={rootClassName}>
    //         <div data-grid='col-12'>
    //             <TextField
    //                 label='Name' type='text'
    //                 placeholder='Name of product'
    //                 value={dForm.name || ''}
    //                 onChange={(val) => this.onChangeForm('name', val)}
    //             />
    //         </div>
    //         <div data-grid='col-12'>
    //             <TextField
    //                 label='Description' type='text'
    //                 placeholder='A short description of the entity'
    //                 value={dForm.description || ''}
    //                 onChange={(val) => this.onChangeForm('description', val)}
    //             />
    //         </div>
    //         <div data-grid='col-12'>
    //             <NumberPicker
    //                 pickerButtonSize='f-flex'
    //                 value={dForm.price || 0}
    //                 numDecimals={2}
    //                 onChange={(val) => this.onChangeForm('price', val)}
    //             />
    //         </div>
    //         {/* {new Array(100).fill('Foo', 0, 100).map((d, i) => <div key={i} data-grid='col-12'>{i}<br /></div>)} */}
    //         <div data-grid='col-6'>
    //             <Checkbox
    //                 label='Enabled'
    //                 checked={dForm.isActive !== false}
    //                 onChange={(val) => this.onChangeForm('isActive', val)}
    //             />
    //         </div>
    //         <div data-grid='col-12'>
    //             <br />
    //             <hr className='c-divider' style={{ margin: '24px 0' }} />
    //             <h3 className='c-header-3'>Product Variants:<br /><br /></h3>
    //         </div>
    //         <div data-grid='col-12'>
    //             <Table data={data} borders={true} isHeaderVisible={true} className='f-editTable'>
    //                 <Column dataKey='name' onRenderContent={(d: ProductVariant) => {
    //                     return <TextField
    //                         value={d.name}
    //                         onChange={(val) => this.onChangeProductVariant(dForm, d, 'name', val)}
    //                     />
    //                 }}>
    //                     <Header>Name</Header>
    //                     <TextCell />
    //                 </Column>
    //                 <Column dataKey='isDefaultVariant' onRenderContent={(d: ProductVariant) => {
    //                     return <Checkbox checked={d.isDefaultVariant}
    //                         onChange={(val) => this.onChangeProductVariant(dForm, d, 'isDefaultVariant', val)}
    //                     />
    //                 }}>
    //                     <Header>Is default?</Header>
    //                     <TextCell />
    //                 </Column>
    //                 <Column dataKey='priceOverride' onRenderContent={(d: ProductVariant) => {
    //                     return <NumberPicker value={d.priceOverride} numDecimals={2} onChange={(val) => this.onChangeProductVariant(dForm, d, 'priceOverride', val)} />
    //                 }}>
    //                     <Header>Price override</Header>
    //                     <TextCell />
    //                 </Column>
    //                 <Column dataKey='id' sortable={false} onRenderContent={(d: ProductVariant) => {
    //                     return <IconButton iconName='trash-empty' title='Delete'
    //                         onClick={() => this.onClickDeleteProductVariant(dForm.id, d.id)}
    //                     />
    //                 }}>
    //                     <Header>Delete</Header>
    //                     <TextCell />
    //                 </Column>
    //             </Table>
    //         </div>
    //     </div>
    // }

    // public onClickDeleteProductVariant(productId?: number, variantId?: number): Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
}

const stateToProps = (state: AppState, ownProps: Omit<AbstractManageListPageProps<Product>, keyof ManageListPagePropsFromStore<Product>>): ManageListPagePropsFromStore<Product> => {
    return ({
        entities: state.products,
        categories: state.productCategories
    });
};

export const ManageProductsListPage = withRouter(connect(stateToProps)(ManageProductsListPageComponent));