import React from 'react';
import { Page } from '@pages/page';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { TextField } from '@root/components/common/form/textField';
import { connect } from 'react-redux';
import { actions, AppState } from '@root/store';
import { Column, Header, Table, TableItem, TextCell } from '@root/components/common/cardTable2';
import { IconButton } from '@root/components/common/icons/iconButton';
import { appHistory, AppRouteParameters } from '@root/routes';
import { SidePanel } from '@components/common/panel/sidePanel';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ProductOptionManager } from '@root/managers/productOptionManager';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { ProductOption } from '@root/models/product';
import { NumberPickerTextBox } from '@components/common/form/numberPicker';
import { Checkbox } from '@root/components/common/form/checkbox';

interface PropsFromStore {
    entities: ProductOption[];
}

type ManageProductOptionsPageProps = RouteComponentProps<AppRouteParameters> & PropsFromStore & {

}

interface ManageProductOptionsPageState {
    isLoading: boolean;
    filterText: string;
    dataRowIdToEdit?: number;
    editForm: Partial<ProductOption>;
}

class ManageProductOptionsPageComponent extends React.PureComponent<ManageProductOptionsPageProps, ManageProductOptionsPageState> {
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: ManageProductOptionsPageProps) {
        super(props);
        const rowId = parseInt(props.match.params.id, 10);
        const discountRowId = !isNaN(rowId) && rowId || undefined;

        this.state = {
            dataRowIdToEdit: discountRowId,
            filterText: '',
            editForm: props.entities.filter(d => d.id === discountRowId)[0] || { id: 0 },
            isLoading: false
        };
    }

    private onClickSaveForm = async () => {
        const dm = new ProductOptionManager();
        const df = this.state.editForm;
        await this.setStateAsync({ isLoading: true });
        const jsResult = await dm.save({
            isActive: df.isActive !== false,
            isQuantityEnabled: df.isQuantityEnabled === true,
            optionGroupKey: df.optionGroupKey,
            price: df.price,
            name: df.name!,
            id: df.id
        });

        if (!jsResult.isSuccess) {
            MessageBarAPI.sendErrorPayload(jsResult);
            await this.setStateAsync({ isLoading: false });
            return;
        }

        const discs = await dm.list();
        actions.setProductOptions(discs.payload || []);
        await this.setStateAsync({ isLoading: false, dataRowIdToEdit: undefined });
        appHistory.push('/manage/productOptions');

    }

    private onClickCancelEntityEdit = () => {
        this.setState({ dataRowIdToEdit: undefined, editForm: {} });
        appHistory.push('/manage/productOptions');
    }

    private onClickDelete = async (id: number): Promise<void> => {
        const isConfirmed = window.confirm('Are you sure you want to delete this discount?');
        if (isConfirmed) {
            const dm = new ProductOptionManager();
            await dm.delete(id);
            const nDiscs = await dm.list();
            if (nDiscs.isSuccess) {
                actions.setProductOptions(nDiscs.payload || []);
            }
        }
    }

    private onClickEdit = (id: number) => {
        appHistory.push(`/manage/productOptions/edit/${id}`);

        this.setStateAsync({
            dataRowIdToEdit: id,
            editForm: { ...this.props.entities.filter(d => d.id === id)[0], id }
        });
    }

    private onChangeEntityFilterText = (nVal: string) => {
        this.setStateAsync({ filterText: nVal });
    };

    public render(): React.ReactNode {
        const dForm = this.state.editForm;
        const filterText = this.state.filterText.toLocaleLowerCase();
        const filteredEntities = this.props.entities.filter(d => !filterText
            || d.name.toLowerCase().startsWith(filterText)
            // || (d.description && d.description.toLowerCase().includes(filterText))
        );
        const rows = filteredEntities.map<TableItem & ProductOption>((d, i) => ({ ...d, itemId: `${d.id!}` }));

        return (
            <Page>
                <div data-grid='container pad-6x'>
                    <div data-grid='col-12'>
                        <h1 className='c-heading-3'>Manage Product Options</h1>
                    </div>
                    <div data-grid='col-8'>
                        <TextField
                            value={this.state.filterText}
                            classNameTextField='f-flex'
                            label='Search for existing discounts'
                            placeholder='Enter your search...'
                            onChange={this.onChangeEntityFilterText}
                        />
                    </div>
                    <div data-grid='col-4'>
                        <button className='c-button f-flex f-blue m-t-label' type='button' onClick={() => this.onClickEdit(0)}>Add Option</button>
                    </div>
                    <div data-grid='col-12'>
                        <br /><hr /><br />
                        <Table data={rows} selection='none' headerStyle='sticky'>
                            <Column dataKey='id'>
                                <Header>ID</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='name'>
                                <Header>Name</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='price'>
                                <Header>Price</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='optionGroupKey'>
                                <Header>GROUP KEY</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='isQuantityEnabled' onRenderContent={(item: ProductOption) => {
                                return item.isQuantityEnabled ? 'Yes' : 'No';
                            }}>
                                <Header>Enable Quantity</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='isActive' onRenderContent={(item: ProductOption) => {
                                return item.isActive ? 'Yes' : 'No';
                            }}>
                                <Header>Enabled</Header>
                                <TextCell />
                                {/* <FunctionCell onResolveText={(v: boolean) => v ? 'Y' : 'N'} /> */}
                            </Column>
                            <Column dataKey='id'
                                sortable={false} onRenderContent={(item: ProductOption) => (<IconButton
                                    iconName='pencil'
                                    title='Edit'
                                    onClick={() => this.onClickEdit(item.id || 0)}
                                />)}>
                                <Header>Edit</Header>
                                <TextCell />
                            </Column>
                            <Column dataKey='id'
                                sortable={false}
                                onRenderContent={(item: ProductOption) => (<IconButton
                                    title='Delete'
                                    iconName='trash-empty'
                                    onClick={() => this.onClickDelete(item.id || 0)}
                                />)}>
                                <Header>Delete</Header>
                                <TextCell />
                            </Column>
                        </Table>
                    </div>
                </div>
                <SidePanel open={this.state.dataRowIdToEdit !== undefined} onClose={() => {
                    this.setState({ dataRowIdToEdit: undefined });
                    appHistory.push('/manage/productOptions');
                }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.onClickSaveForm();
                    }}>
                        <div data-grid='container pad-12x'>
                            <div data-grid='col-12'>
                                <TextField
                                    label='Name' type='text'
                                    placeholder='Name of discount'
                                    value={dForm.name || ''}
                                    onChange={(val) => this.setState({
                                        editForm: {
                                            ...dForm,
                                            name: val
                                        }
                                    })}
                                />
                            </div>
                            <div data-grid='col-12'>
                                <NumberPickerTextBox
                                    size='f-flex'
                                    label='Price'
                                    styleFlyout={{ zIndex: 910 }}
                                    value={dForm.price || 0}
                                    numDecimals={2}
                                    onChange={(val) => {
                                        this.setState({
                                            editForm: {
                                                ...dForm,
                                                price: val
                                            }
                                        })
                                    }}
                                />
                            </div>
                            <div data-grid='col-12'>
                                <TextField
                                    label='Group Key' type='text'
                                    placeholder='GROUP_KEY'
                                    value={dForm.optionGroupKey || ''}
                                    onChange={(val) => this.setState({
                                        editForm: {
                                            ...dForm,
                                            optionGroupKey: val.toUpperCase().replace(' ', '_')
                                        }
                                    })}
                                />
                            </div>
                            <div data-grid='col-12'>
                                <Checkbox
                                    label='Enable quantity'
                                    checked={dForm.isQuantityEnabled === true}
                                    onChange={(val) => this.setState({
                                        editForm: {
                                            ...dForm,
                                            isQuantityEnabled: val
                                        }
                                    })}
                                />
                            </div>
                            
                            <div data-grid='col-6'>
                                <Checkbox
                                    label='Enabled'
                                    checked={dForm.isActive !== false}
                                    onChange={(val) => this.setState({
                                        editForm: {
                                            ...dForm,
                                            isActive: val
                                        }
                                    })}
                                />
                            </div>
                        </div>
                        <div data-grid='container pad-12x'>
                            <div data-grid='col-6'>
                                <button className='c-button f-gray f-flex' onClick={this.onClickCancelEntityEdit} type='button'>Cancel</button>
                            </div>
                            <div data-grid='col-6'>
                                <button className='c-button f-teal f-flex' type='submit'>Save</button>
                            </div>
                        </div>
                    </form>
                </SidePanel>
            </Page >
        );
    }
}

const stateToProps = (state: AppState, ownProps: Omit<ManageProductOptionsPageProps, keyof PropsFromStore>): PropsFromStore => {
    return ({
        entities: state.productOptions
    });
};

export const ManageProductOptionsPage = withRouter(connect(stateToProps)(ManageProductOptionsPageComponent));