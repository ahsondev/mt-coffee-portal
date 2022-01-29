import React from 'react';
import { Discount, DiscountType } from '@root/models/discount';
import { TextField } from '@components/common/form/textField';
import { connect } from 'react-redux';
import { actions, AppState } from '@root/store';
import { BooleanCell, ColumnProps, Header, TableItem, TextCell } from '@components/common/cardTable2';
import { Select } from '@components/common/form/select';
import { withRouter } from 'react-router-dom';
import { Checkbox } from '@components/common/form/checkbox';
import { NumberPickerTextBox } from '@components/common/form/numberPicker';
import { DiscountManager } from '@root/managers/discountManager';
import { MessageBarAPI } from '@components/messageBarAPI';
import { AbstractManagePage, AbstractManagePageProps, AbstractManagePageStrings, ManagePagePropsFromStore } from '../abstractManagePage';
import { TextArea } from '@components/common/form/textArea';

class ManageDiscountsPageComponent extends AbstractManagePage<Discount> {
    public pagePath = 'discounts';
    public pageStrings: AbstractManagePageStrings = {
        addNew: 'New discount',
        editPanelTitle: 'Edit discount',
        title: 'Manage discounts'
    };

    public getRowId = (entity: Partial<Discount>) => entity.id;
    public onFilterBySearchText = (ents: Discount[], text: string) => ents.filter(e => e.name.toLowerCase().indexOf(text) > -1);
    public onConfirmDeleteEntityAPI = async (id: number) => {
        const api = new DiscountManager();
        const rs = await api.delete(id);

        if (rs.isSuccess !== true) {
            MessageBarAPI.sendErrorPayload(rs);
            return false;
        }

        MessageBarAPI.sendSuccess("Deleted entity successfully.", 2000);
        actions.setDiscounts(this.props.entities.filter(e => e.id !== id));
        return true;
    }

    public onClickSaveFormAPI = async (entity: Partial<Discount>) => {
        const api = new DiscountManager();
        const rs = await api.save({
            id: entity.id || 0,
            isActive: entity.isActive !== false,
            name: entity.name || '',
            sortOrder: entity.sortOrder,
            description: entity.description,
            customEquation: entity.customEquation,
            isAppliedToItems: entity.isAppliedToItems === true,
            isAppliedToTransactions: entity.isAppliedToTransactions === true,
            isManagerRequired: entity.isManagerRequired === true,
            isOpen: entity.isOpen === true,
            type: entity.type!,
            amount: entity.amount
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

        actions.setDiscounts(list.payload || []);
        MessageBarAPI.sendSuccess("Saved entity successfully.", 2000);
        return true;
    }

    public getCustomTableColumnProps(colsBefore: ColumnProps<Discount & TableItem>[], colsAfter: ColumnProps<Discount & TableItem>[]): ColumnProps<Discount & TableItem>[] {
        return [
            {
                dataKey: 'sortOrder', isRowHeader: false,
                children: [<Header key={0} >Sort order</Header>, <TextCell key={1} />],
                onRenderContent: (item: Discount) => {
                    if (item.sortOrder === undefined){
                        return `---`;
                    } 

                    return `${item.sortOrder}`;
                }
            },
            {
                dataKey: 'name', isRowHeader: false,
                children: [<Header key={0}>Name</Header>, <TextCell key={1} />]
            },
            {
                dataKey: 'isManagerRequired', isRowHeader: false,
                children: [<Header key='0'>Manager Required</Header>, <BooleanCell key='1' />]
            },
            {
                dataKey: 'isAppliedToTransactions', isRowHeader: false,
                children: [<Header key='0'>Enabled for Transactions</Header>, <BooleanCell key='1' />]
            },
            {
                dataKey: 'isAppliedToItems', isRowHeader: false,
                children: [<Header key='0'>Enabled for Items</Header>, <BooleanCell key='1' />]
            },
            {
                dataKey: 'amount', isRowHeader: false,
                children: [<Header key={0}>Amount</Header>, <TextCell key={1} />],
                onRenderContent: (item: Discount) => {
                    if (item.isOpen === true)
                        return 'OPEN';

                    if (item.type === 'CUSTOM') 
                      return 'CUSTOM';

                    if (item.amount === undefined)
                        return 'ERROR: No amount set, yet custom amount is not allowed?';

                    if (item.type === 'AMOUNT') {
                        return '$' + item.amount!.toFixed(2);
                    }

                    if (item.type === 'PERCENT')
                        return (item.amount!).toFixed(1) + '%';

                    return '---';
                }
            }
        ]
    }

    public renderEditForm(rootClassName: string): React.ReactNode {
        const dForm = this.state.editForm;
        return <div data-grid='container pad-12x' style={{marginBottom: '24px'}}>
            <div data-grid='col-12'>
                <TextField
                    label='Name' type='text'
                    placeholder='Name of discount'
                    value={dForm.name || ''}
                    onChange={(val) => this.onChangeForm('name', val)}
                />
            </div>
            <div data-grid='col-12'>
                <TextField
                    label='Description' type='text'
                    placeholder='Description'
                    value={dForm.description || ''}
                    onChange={(val) => this.onChangeForm('description', val)}
                />
            </div>
            <div data-grid='col-12'>
                <Select
                    label='Discount type'
                    value={dForm.type || 'PERCENT'}
                    options={[
                        { text: 'Amount', value: 'AMOUNT' },
                        { text: 'Percent', value: 'PERCENT' },
                        { text: 'Custom', value: 'CUSTOM' }
                    ]}
                    onChange={(val) => {
                      if (val === 'CUSTOM'){
                        this.setState({
                          editForm: {
                            ...this.state.editForm,
                            'type': val,
                            isOpen: false,
                            amount: undefined
                          }
                        });
                      } else {
                        this.setState({
                          editForm: {
                            ...this.state.editForm,
                            'type': val as DiscountType,
                            customEquation: undefined
                          }
                        });
                      }
                    }}
                />
            </div>
            <div data-grid='col-12' style={dForm.type === 'CUSTOM' ? {} : { display: 'none' }}>
                <TextArea
                    label='Custom equation'
                    placeholder='Feature is not ready yet.'
                    value={dForm.customEquation || ''}
                    onChange={(val: string) => this.onChangeForm('customEquation', val)}
                />
            </div>
            <div data-grid='col-12'  style={dForm.type !== 'CUSTOM' ? {} : { display: 'none' }}>
                <div data-grid='col-4'>
                    <Checkbox
                        label='Allow custom amount'
                        checked={dForm.isOpen === true}
                        onChange={(val) => this.onChangeForm('isOpen', val)}
                    />
                </div>
                <div data-grid='col-8'>
                    {dForm.isOpen !== true && (
                        <NumberPickerTextBox
                            size='f-flex'
                            styleFlyout={{ zIndex: 910 }}
                            value={dForm.amount || 0}
                            numDecimals={2}
                            onChange={(val) => {
                                this.setState({
                                    editForm: {
                                        ...dForm,
                                        isOpen: false,
                                        amount: val
                                    }
                                })
                            }}
                        />
                    )}
                </div>
            </div>
            <div data-grid='col-12'>
                <NumberPickerTextBox
                    label='Sort order'
                    size='f-flex'
                    styleFlyout={{ zIndex: 910 }}
                    allowUndefined={true}
                    value={dForm.sortOrder}
                    numDecimals={0}
                    onChange={(val) => {
                        this.setState({
                            editForm: {
                                ...dForm,
                                sortOrder: val
                            }
                        })
                    }}
                />
            </div>
            <div data-grid='col-6'>
                <Checkbox
                    label='Enabled'
                    checked={dForm.isActive !== false}
                    onChange={(val) => this.onChangeForm('isActive', val)}
                />
            </div>
            <div data-grid='col-6'>
                <Checkbox
                    label='Is manager required?'
                    checked={dForm.isManagerRequired === true}
                    onChange={(val) => this.onChangeForm('isManagerRequired', val)}
                />
            </div>
            <div data-grid='col-6'>
                <Checkbox
                    label='Enable at transaction level?'
                    checked={dForm.isAppliedToTransactions === true}
                    onChange={(val) => this.onChangeForm('isAppliedToTransactions', val)}
                />
            </div>
            <div data-grid='col-6'>
                <Checkbox
                    label='Enable at item level?'
                    checked={dForm.isAppliedToItems === true}
                    onChange={(val) => this.onChangeForm('isAppliedToItems', val)}
                />
            </div>
        </div>
    }
}

const stateToProps = (state: AppState, ownProps: Omit<AbstractManagePageProps<Discount>, keyof ManagePagePropsFromStore<Discount>>): ManagePagePropsFromStore<Discount> => {
    return ({
        entities: state.discounts
    });
};

export const ManageDiscountsPage = withRouter(connect(stateToProps)(ManageDiscountsPageComponent));