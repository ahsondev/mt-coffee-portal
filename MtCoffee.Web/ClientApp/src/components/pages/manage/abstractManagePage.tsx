import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Page } from '@pages/page';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { AppRouteParameters } from '@root/routes';
import { appHistory } from '@root/routes';
import { Column, ColumnProps, Header, Table, TableItem, TextCell } from '@root/components/common/cardTable2';
import { TextField } from '@root/components/common/form/textField';
import { SidePanel } from '@root/components/common/panel/sidePanel';
import { IconButton } from '@root/components/common/icons/iconButton';
import './abstractManagePage.scss';

export interface ManagePagePropsFromStore<T> {
    entities: T[];
}

export type AbstractManagePageProps<T> = RouteComponentProps<AppRouteParameters> & ManagePagePropsFromStore<T> & {
}

interface AbstractManagePageState<T> {
    isLoading: boolean;
    filterText: string;
    dataRowIdToEdit?: number;
    editForm: Partial<T>;
}

export interface AbstractManagePageStrings {
    editPanelTitle: string;
    addNew: string;
    title: string;
}

export abstract class AbstractManagePage<T> extends React.PureComponent<AbstractManagePageProps<T>, AbstractManagePageState<T>> {
    protected setStateAsync = setStateAsyncFactory(this);

    constructor(props: AbstractManagePageProps<T>) {
        super(props);
        const rowId = parseInt(props.match.params.id, 10);
        const entityRowId = !isNaN(rowId) && rowId || undefined;

        this.state = {
            dataRowIdToEdit: entityRowId,
            filterText: '',
            editForm: {},
            isLoading: false
        };
    }

    abstract getRowId: (entity: Partial<T>) => number | undefined;
    abstract pageStrings: AbstractManagePageStrings;
    abstract pagePath: string; // "/manage/${pagePath}/edit/0"
    abstract onConfirmDeleteEntityAPI: (primaryKey: number) => Promise<boolean>;
    abstract onClickSaveFormAPI: (entity: Partial<T>) => Promise<boolean>;
    abstract onFilterBySearchText: (ents: T[], text: string) => T[];
    abstract renderEditForm(rootClassName: string): React.ReactNode;

    public componentDidMount() {
        const editForm: Partial<T> = this.props.entities.filter(d => {
            const pk = this.getRowId(d);
            return pk === this.state.dataRowIdToEdit;
        })[0] || {};

        this.setStateAsync({ editForm });
    }


    private onClickSaveForm = async () => {
        const df = this.state.editForm;
        await this.setStateAsync({ isLoading: true });
        const isSuccess = await this.onClickSaveFormAPI(df);
        if (isSuccess) {
            await this.setStateAsync({ isLoading: false, dataRowIdToEdit: undefined });
            appHistory.push(`/manage/${this.pagePath}`);
        } else {
            await this.setStateAsync({ isLoading: false });
        }
    }

    private onClickCancelEntityEdit = () => {
        appHistory.push(`/manage/${this.pagePath}`);
        this.setState({ dataRowIdToEdit: undefined, editForm: {} });
    }

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

        this.setStateAsync({
            dataRowIdToEdit: id,
            editForm: { ...this.props.entities.filter(d => this.getRowId(d) === id)[0], id }
        });
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


    protected onChangeForm<K extends keyof T>(key: K, val: T[K]) {
        this.setStateAsync({
            editForm: {
                ...this.state.editForm,
                [key]: val
            }
        });
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
                        <Table data={rows} selection='none' headerStyle='sticky'>
                            {tableColumns.map((x, xi) => <Column key={xi} {...x} />)}
                        </Table>
                    </div>
                </div>
                <SidePanel
                    className='mt-abstractManagePageSidePanel'
                    open={this.state.dataRowIdToEdit !== undefined} onClose={() => {
                        this.setState({ dataRowIdToEdit: undefined });
                        appHistory.push(`/manage/${this.pagePath}`);
                    }}>
                    <form
                        className='cc-sidePanelForm'
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.onClickSaveForm();
                        }}>
                        <div data-grid='container pad-12x' className='cc-sidePanelHeader'>
                            <div data-grid='col-12'>
                                <h2 className='c-heading-2'>{this.pageStrings.editPanelTitle}</h2>
                            </div>
                        </div>
                        {this.renderEditForm('cc-sidePanelContent')}
                        <div data-grid='container pad-12x' className='cc-sidePanelButtonsBelow'>
                            <div data-grid='col-6'>
                                <button className='c-button f-gray f-flex' onClick={this.onClickCancelEntityEdit} type='button'>Cancel</button>
                            </div>
                            <div data-grid='col-6'>
                                <button className='c-button f-teal f-flex' type='submit'>Save</button>
                            </div>
                            <div data-grid='col-12'><br />
                                TODO: Make this footer stick to the bottom.
                            </div>
                        </div>
                    </form>
                </SidePanel>
            </Page >
        );
    }
}