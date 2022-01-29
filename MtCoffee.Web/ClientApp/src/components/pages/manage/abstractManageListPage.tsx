import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Page } from '@pages/page';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { AppRouteParameters } from '@root/routes';
import { appHistory } from '@root/routes';
import { Column, ColumnProps, Header, Table, TableItem, TextCell } from '@root/components/common/cardTable2';
import { TextField } from '@root/components/common/form/textField';
import { IconButton } from '@root/components/common/icons/iconButton';
import './abstractManagePage.scss';
import { ProductCategory } from '@root/models/product';

export interface ManageListPagePropsFromStore<T> {
    entities: T[];
    categories?: ProductCategory[];
}

export type AbstractManageListPageProps<T> = RouteComponentProps<AppRouteParameters> & ManageListPagePropsFromStore<T> & {
}

interface AbstractManageListPageState {
    isLoading: boolean;
    filterText: string;
}

export interface AbstractManageListPageStrings {
    addNew: string;
    title: string;
}

export abstract class AbstractManageListPage<T> extends React.PureComponent<AbstractManageListPageProps<T>, AbstractManageListPageState> {
    protected setStateAsync = setStateAsyncFactory(this);

    constructor(props: AbstractManageListPageProps<T>) {
        super(props);

        this.state = {
            filterText: '',
            isLoading: false
        };
    }

    abstract getRowId: (entity: Partial<T>) => number | undefined;
    abstract pageStrings: AbstractManageListPageStrings;
    abstract pagePath: string; // "/manage/${pagePath}/edit/0"
    abstract onConfirmDeleteEntityAPI: (primaryKey: number) => Promise<boolean>;
    abstract onFilterBySearchText: (ents: T[], text: string) => T[];

    protected onClickDelete = async (id: number): Promise<void> => {
        const isConfirmed = window.confirm('Are you sure you want to delete this discount?');
        if (isConfirmed) {
            if (this.onConfirmDeleteEntityAPI) {
                this.setStateAsync({ isLoading: true });
                await this.onConfirmDeleteEntityAPI(id);
                this.setStateAsync({ isLoading: false });
            }
        }
    }

    protected onClickEdit = (id: number) => {
        appHistory.push(`/manage/${this.pagePath}/edit/${id}`);
    }

    private onChangeEntityFilterText = (nVal: string) => {
        this.setStateAsync({ filterText: nVal });
    };

    abstract getCustomTableColumnProps(colsBefore: ColumnProps<T & TableItem>[], colsAfter: ColumnProps<T & TableItem>[]): ColumnProps<T & TableItem>[];

    private getTableColumnProps = () => {
        const colsBefore: ColumnProps<T & TableItem>[] = [
            { dataKey: 'id', isRowHeader: true, children: [<Header key='h'>ID</Header>, <TextCell key='c' />] }
        ];

        const colsAfter: ColumnProps<T & TableItem>[] = [
            {
                dataKey: 'id', isRowHeader: false, sortable: false,
                className: 'cc-iconButtonHeader',
                children: [<Header key='h'>Edit</Header>, <TextCell key='c' />],
                onRenderContent: (item: T) => <IconButton iconName='pencil' title='Edit' onClick={() => this.onClickEdit(this.getRowId(item) || 0)} />
            },
            {
                dataKey: 'id', isRowHeader: false, sortable: false,
                className: 'cc-iconButtonHeader',
                children: [<Header key='h'>Delete</Header>, <TextCell key='c' />],
                onRenderContent: (item: T) => <IconButton iconName='trash-empty' title='Delete' onClick={() => this.onClickDelete(this.getRowId(item) || 0)} />
            }
        ];

        const colsCustom = this.getCustomTableColumnProps(colsBefore, colsAfter);
        const tableColumns: ColumnProps<T & TableItem>[] = colsBefore.concat(colsCustom).concat(colsAfter);
        return tableColumns;
    }

    public render(): React.ReactNode {
        // const dForm = this.state.editForm;
        const filterText = this.state.filterText.toLocaleLowerCase();
        const filteredEntities = this.onFilterBySearchText(this.props.entities, filterText);
        const rows = filteredEntities.map<T & TableItem>((d) => ({ ...d, itemId: `${this.getRowId(d)!}` }));
        const tableColumns = this.getTableColumnProps();

        return (
            <Page className='mt-abstractManagePage'>
                <div data-grid='container pad-6x'>
                    <div data-grid='col-12'>
                        <h1 className='c-heading-3'>{this.pageStrings.title}</h1>
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
                        <button className='c-button f-flex f-blue m-t-label' type='button' onClick={() => this.onClickEdit(0)}>{this.pageStrings.addNew}</button>
                    </div>
                    <div data-grid='col-12'>
                        <br /><hr /><br />
                        <Table data={rows}
                            selection='none'
                            headerStyle='sticky'
                            borders={true}
                            selectAllAriaLabel='Select all'>
                            {tableColumns.map((x, xi) => <Column key={xi} {...x} />)}
                        </Table>
                    </div>
                </div>
            </Page >
        );
    }
}