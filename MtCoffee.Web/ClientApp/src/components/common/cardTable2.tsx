import * as React from 'react';
import './cardTable2.scss';
import { Icon } from './icons/iconButton';

type TextAlignment = 'center' | 'end' | 'start';
type TextOverflow = 'clip' | 'wrap';

const asComponent = <T extends unknown>(component: React.ReactElement<T>): T => {
  return component as unknown as T;
};

//#region Cells
type CellChildFunction = (value: unknown, dataItem: unknown) => JSX.Element;
type CellChild = React.ReactNode | CellChildFunction;
export interface CellProps {
  className?: string;
  children: CellChild;
}

export class Cell extends React.PureComponent<CellProps> {
  public render(): React.ReactNode {
    const { className, children } = this.props;
    const cssClasses = `c-cardTable-cell${className ? ` ${className}` : ''}`;
    return <div className={cssClasses}>{children}</div>;
  }
}

interface TextCellProps {
  children?: string | number | boolean;
  className?: string;
  tooltip?: string;
  textAlign?: TextAlignment;
  textOverflow?: TextOverflow;
}

export class TextCell extends React.PureComponent<TextCellProps> {
  public render(): React.ReactNode {
    const { children, className, textAlign, textOverflow, tooltip } = this.props;
    if (children === undefined || children === '' || children === null) {
      return null;
    }

    const textAlignClass = textAlign ? ` c-cardTable-textalign-${textAlign}` : '';
    const textWrapClass = textOverflow === 'clip' ? ' c-cardTable-text-clip' : '';
    const cssClasses = `${className || ''}${textAlignClass}${textWrapClass}`;
    const childrenAdapted = (children === true || children === false) && children.toString() || children;

    const content = <span title={tooltip}>{childrenAdapted}</span>;
    return <Cell className={cssClasses}>{content}</Cell>;
  }
}


interface BooleanCellProps {
  children?: boolean;
  className?: string;
  tooltip?: string;
  textAlign?: TextAlignment;
  textOverflow?: TextOverflow;
  onTrue?: string;
  onFalse?: string;
  onUndefined?: string;
}

export class BooleanCell extends React.PureComponent<BooleanCellProps> {
  public render(): React.ReactNode {
    const { children, className, textAlign, textOverflow, tooltip,
      onFalse = 'No',
      onTrue = 'Yes',
      onUndefined = null
    } = this.props;

    if (children === undefined || children === null) {
      return onUndefined;
    }

    const textAlignClass = textAlign ? ` c-cardTable-textalign-${textAlign}` : '';
    const textWrapClass = textOverflow === 'clip' ? ' c-cardTable-text-clip' : '';
    const cssClasses = `${className || ''}${textAlignClass}${textWrapClass}`;

    const resolvedText = (children === undefined && onUndefined)
      || (children === true && onTrue)
      || (children === false && onFalse)
      || onUndefined;

    const content = <span title={tooltip}>{resolvedText}</span>;
    return <Cell className={cssClasses}>{content}</Cell>;
  }
}

interface FunctionCellProps<TData> {
  children?: TData;
  className?: string;
  tooltip?: string;
  textAlign?: TextAlignment;
  textOverflow?: TextOverflow;
  onResolveText: (obj: TData) => React.ReactNode;
}

export class FunctionCell<TData> extends React.PureComponent<FunctionCellProps<TData>> {
  public render(): React.ReactNode {
    const { children, className, textAlign, textOverflow, tooltip, onResolveText } = this.props;
    if (children === undefined || children === '' || children === null) {
      return null;
    }

    const textAlignClass = textAlign ? ` c-cardTable-textalign-${textAlign}` : '';
    const textWrapClass = textOverflow === 'clip' ? ' c-cardTable-text-clip' : '';
    const cssClasses = `${className || ''}${textAlignClass}${textWrapClass}`;
    const resolvedText = onResolveText(children);

    const content = <span title={tooltip}>{resolvedText}</span>;
    return <Cell className={cssClasses}>{content}</Cell>;
  }
}
//#endregion Cells

//#region Header
type HeaderChildFunction = (sortable: boolean, sorted: boolean, sortOrder?: SortOrder) => JSX.Element;
type HeaderChild = string | JSX.Element | HeaderChildFunction;
interface HeaderProps {
  children: HeaderChild;
  className?: string;
  /**
   * Label for screen readers and responsive views
   */
  label?: string;
  textAlign?: TextAlignment;
  textOverflow?: TextOverflow;
}

/*
 * The Header component doesn't have a render method because it's not directly displayed in the UI.
 * It serves as a container of elements used to render header cells.
 * It's written this way to provide consumers a JSX syntax that feels idiomatic.
 */
export class Header extends React.PureComponent<HeaderProps> {
  public static defaultProps = { textAlign: 'start' };
}
//#endregion Header

//#region Column
type ColumnChild = Cell | Header | TextCell | BooleanCell;
type FilterFunction = (value: unknown) => boolean;
export type CompareFunction<T> = (a: T, b: T) => number;
export type SortFunction<T> = (sortOrder: SortOrder) => CompareFunction<T>;
export type SortOrder = 'asc' | 'desc';

export interface ColumnProps<TDataItem> {
  /**
   * Header and Cell components.
   */
  children: React.ReactElement<ColumnChild>[];
  /**
   * Class name to apply to all cells in the column (including the header).
   * Useful for defining common styles or constraints around dimentions (e.g. min and max width).
   */
  className?: string;
  /**
   * The name of a property from table's data objects, used to get the value
   * for the column cells (i.e. ```dataItem[dataKey]```).
   * Data keys must match a single property in the data objects.
   * Duplicates CAN be used, though it is only recommended when custom rendering.
   */
  dataKey: string;
  /**
   * If the values of the column cells are taken into account when the table is being filtered.
   * The default is true for tables with filtering enabled.
   * This flag can be used to exculde individual columns from a filterable table.
   */
  filterable?: boolean;
  /**
   * Custom filter function to use instead of the table's default.
   */
  filterFunction?: FilterFunction;
  onRenderContent?: (data: TDataItem) => React.ReactNode;
  /**
   * If the column can be sorted. The default is true for tables with sorting enabled.
   * This flag can be used to exclude individual columns from a sortable table.
   */
  sortable?: boolean;
  /**
   * If the table should be sorted by this column by default.
   * Until multi-sort is supported, if more than one columns have this flag enabled,
   * only the first one is used.
   */
  sortByDefault?: boolean;
  /**
   * If sortByDefault is defined, sortByDefaultOrder indicates its order.
   */
  sortByDefaultOrder?: SortOrder;
  /**
   * Custom sort function to use instead of the default string and number comparison.
   */
  sortFunction?: SortFunction<TDataItem>;

  /**
   * Used for accessibility. If true, then the current column's contents will help to
   * identify the row as a screen reader user navigates through the table's contents.
   * false by default.
   */
  isRowHeader: boolean;
}

/*
 * The Column component doesn't have a render method because it's not displayed in the UI.
 * It's used as both a collection of settings defining a table column, and a container
 * of elements used to render table cells.
 * It's written this way to provide consumers a JSX syntax that feels idiomatic.
 */
export class Column<TDataItem> extends React.PureComponent<ColumnProps<TDataItem>> {
  public static defaultProps = {
    filterable: true,
    isRowHeader: false,
    sortable: true,
  };
}
//#endregion Column

//#region Table
interface ColumnCell<TDataItem> {
  child?: Cell;
  headerLabel: string;
  props: ColumnProps<TDataItem>;
}

export interface TableItem {
  itemId: string;
  [key: string]: unknown;
}

export type HeaderStyleType = 'sticky' | 'none';
export type CollapseBreakpoint = 'never' | 'extra-small' | 'small' | 'medium' | 'large';
type RowStyleFunction<TDataItem extends TableItem> = (item: TDataItem) => void;
interface TableProps<TDataItem extends TableItem> {
  borders?: boolean;
  caption: string;
  children: React.ReactElement<Column<TDataItem>> | (React.ReactElement<Column<TDataItem>> | false)[];
  className?: string;
  data: TDataItem[];
  defaultSelectedItemId?: string;
  filterable?: boolean;
  isHeaderVisible: boolean;
  headerStyle?: HeaderStyleType;
  headerClassName?: string;
  collapseBreakpoint: CollapseBreakpoint;
  onItemSelected?: (item: TDataItem) => void;
  onSelectionChanged?: (items: TDataItem[]) => void;
  rowClassName?: string | RowStyleFunction<TDataItem>;
  selection?: 'none' | 'single' | 'multiple';
  sortable?: boolean;
  title?: string;
  selectAllAriaLabel?: string;
}

interface TableState<TDataItem extends TableItem> {
  selectedItems: TDataItem[];
  sortByDataKey: string;
  sortOrder: SortOrder;
}

const getIconChecked = (checked: boolean, key: string, itemName: string, tabIndex: 0 | -1): JSX.Element => {
  const rowCheckedClass = checked ? ' c-cardTable-row-checked' : '';
  const circleIcon = <i className='c-cardTable-circle-no-checked icon-x-before icon-circle-empty' />;
  const checkedIcon = <i className='c-cardTable-checked icon-x-before icon-ok-circled' />;
  return (
    <div key={key} className={`c-cardTable-selection${rowCheckedClass}`} role='checkbox'
      aria-label={itemName} aria-checked={checked} tabIndex={tabIndex}>
      {checked && checkedIcon}
      {!checked && circleIcon}
      {/* {!checked && markIcon} */}
    </div>
  );
};

export class Table<TDataItem extends TableItem> extends React.PureComponent<TableProps<TDataItem>, TableState<TDataItem>> {
  public static defaultProps: TableProps<any> = {
    borders: true,
    data: [],
    caption: '',
    children: [],
    headerStyle: 'none',
    isHeaderVisible: true,
    selection: 'single',
    collapseBreakpoint: 'small',
    sortable: true,
  };

  constructor(props: TableProps<TDataItem>) {
    super(props);
    const { children, data, defaultSelectedItemId, selection } = props;
    const selectedItem = (defaultSelectedItemId && selection !== 'none') && data.find(item => item.itemId === defaultSelectedItemId);
    const selectedItems = selectedItem ? [selectedItem] : [];
    let sortOrder: SortOrder = 'asc';
    let sortByDataKey = 'itemId';

    if (children) {
      const sortColumn = (Array.isArray(children)) ?
        children.find(child => child && asComponent(child).props.sortByDefault) || children[0] : children;
      sortByDataKey = (sortColumn && asComponent(sortColumn).props.dataKey) || 'itemId';
      const sortByDefault = sortColumn ? asComponent(sortColumn).props.sortByDefaultOrder : undefined;
      sortOrder = sortByDefault || sortOrder;
    }

    this.state = { selectedItems, sortByDataKey, sortOrder };
    this.onAllCheckBoxClick = this.onAllCheckBoxClick.bind(this);
  }

  private defaultSort(sortOrder: SortOrder): CompareFunction<TDataItem> {
    const { sortByDataKey } = this.state;

    return (a: TDataItem, b: TDataItem): number => {
      const aString = (this.getDataValueFromItem(a, sortByDataKey) as Object || '').toString();
      const bString = (this.getDataValueFromItem(b, sortByDataKey) as Object || '').toString();
      // Stick with en-us as the system's locale for sorting (i.e. don't change to the user's locale)
      // for consistent sorting. The table contains user content which can be in any language,
      // or combination of languages, without a way for the app to know which ones.
      // TODO A decision can be made later if we want the search logic to follow the user's choice in language.
      const collator = new Intl.Collator('en-us', { numeric: true });

      if (sortOrder === 'asc') {
        return collator.compare(aString, bString);
      } else {
        return collator.compare(bString, aString);
      }
    };
  }

  private getHeaderCell(columnProps: ColumnProps<TDataItem>, header: Header, columnIndex: number): JSX.Element {
    const { sortable: isTableSortable } = this.props;
    const { sortByDataKey, sortOrder } = this.state;
    const { className, dataKey, sortable: isColumnSortable } = columnProps;

    const sortable = !!(isTableSortable && isColumnSortable);
    const sorted = dataKey === sortByDataKey;
    const clickHandler = !sortable ? undefined :
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggleSort(dataKey);
      };

    const sortableClass = sortable ? ' c-cardTable-header-sortable' : '';
    const sortedClass = !sorted ? ' hidden' : '';
    const columnClass = className ? ` ${className}` : '';
    const cssClasses = `c-cardTable-header${sortableClass}${sortedClass}${columnClass}`;
    const ariaSorted = !sorted ? undefined : (sortOrder === 'asc' ? 'ascending' : 'descending');

    let content: JSX.Element;
    const headerChild = header.props.children as HeaderChild;
    if (typeof headerChild === 'function') {
      content = headerChild(sortable, sorted, sortOrder);
    } else {
      const textAlign = header.props.textAlign;
      const textOverflow = header.props.textOverflow;

      const cellAlignClass = textAlign ? ` c-cardTable-cellalign-${textAlign}` : '';
      const textWrapClass = textOverflow === 'clip' ? ' c-cardTable-text-clip' : '';
      const cellClasses = `c-cardTable-header-sortable-cell${cellAlignClass}${textWrapClass}`;

      if (sortable) {
        const name = sorted ? `Sort${sortOrder === 'asc' ? 'Up' : 'Down'}` : 'Sort';

        let text: string | undefined = undefined;
        let headerContent: JSX.Element | undefined = undefined;
        if (typeof headerChild === 'string') {
          text = headerChild;
        } else {
          headerContent = headerChild;
        }

        content = (
          <Cell className={cellClasses}>
            {headerContent}
            {text}
            {sortable && <Icon
              className={`c-cardTable-header-sorticon${sortedClass}`}
              iconName={sortOrder === 'asc' ? 'up' : 'down'}
              title={name}
            />}
            {/* <Label text={text} content={headerContent} icon={icon} /> */}
          </Cell>
        );
      } else {
        content = (
          <Cell className={cellClasses}>
            {headerChild}
          </Cell>
        );
      }
    }

    return (
      <th
        key={`header.${dataKey}.${columnIndex}`}
        className={cssClasses}
        scope='col'
        tabIndex={0}
        onClick={clickHandler}
        aria-sort={ariaSorted}
        onKeyUp={(event: React.KeyboardEvent) => {
          switch (event.key) {
            case 'Enter': {
              const current = event.currentTarget as HTMLElement;
              current.click();
              break;
            }
            case 'Left': // IE/Edge specific
            case 'ArrowLeft': {
              const currentNode = event.currentTarget.previousElementSibling as HTMLElement;
              currentNode.focus();
              break;
            }
            case 'Right': // IE/Edge specific
            case 'ArrowRight': {
              const nextNode = event.currentTarget.nextElementSibling as HTMLElement;
              nextNode.focus();
              break;
            }
          }
        }}
      >
        {content}
      </th>
    );
  }

  private onCheckBoxClick(event: React.BaseSyntheticEvent, item: TDataItem): void {
    const { onSelectionChanged } = this.props;
    const { selectedItems } = this.state;

    event.stopPropagation();
    let newSelectedItems: TDataItem[];

    if (selectedItems.some(x => x.itemId === item.itemId)) {
      newSelectedItems = selectedItems.filter(dataItem => dataItem.itemId !== item.itemId);
    } else {
      newSelectedItems = [...selectedItems, item];
    }

    this.setState({ selectedItems: newSelectedItems });
    if (onSelectionChanged) {
      onSelectionChanged(newSelectedItems);
    }
  }

  private getCheckBoxCell(item: TDataItem): JSX.Element | undefined {
    const { selection } = this.props;
    const { selectedItems } = this.state;
    if (selection !== 'multiple') { return; }

    const checked = !!selectedItems.find(x => x.itemId === item.itemId);
    // Required for aria-label on checkbox
    const itemName = typeof item === 'object' && item[Object.keys(item)[1]] || '';
    const iconChecked = getIconChecked(checked, `checkbox.${item.itemId}`, itemName as string, 0);

    return (
      <td
        key={`${item.itemId}.select`}
        className={`c-cardTable-td cc-checkbox-td`}
        onClick={event => this.onCheckBoxClick(event, item)}
      >
        <div className='c-cardTable-row-header'></div>
        {iconChecked}
      </td>
    );
  }

  private getDataValueFromItem(item: TDataItem, dataKey: string): any {
    if (item[dataKey] !== undefined) return item[dataKey];
    const parts = dataKey.split('.').filter(x => x !== undefined && x !== '');
    let rt: any = item;

    if (dataKey.indexOf('.'))
      for (let i = 0; i < parts.length; i++) {
        const propKey = parts[i];
        rt = rt[propKey] as any;
        if (rt === undefined) break;
      }

    return rt;
  }

  private getRow(item: TDataItem, columns: ColumnCell<TDataItem>[], rowClass: string): JSX.Element {
    const { rowClassName } = this.props;
    const { selectedItems } = this.state;
    const isSelected = !!(selectedItems && selectedItems.find(selected => selected.itemId === item.itemId));
    const activeClass = isSelected ? ' c-cardTable-row-active' : '';

    const checkBoxCell = this.getCheckBoxCell(item);

    const rowCells = columns.map((column, columnIndex) => {
      const { dataKey, className, isRowHeader, onRenderContent } = column.props;
      const itemValue = onRenderContent && onRenderContent(item) || this.getDataValueFromItem(item, dataKey);
      const columnClassName = className ? ` ${className}` : '';
      const cellChild = column.child && column.child.props && column.child.props.children as CellChild;

      let content: React.ReactNode;

      if (typeof cellChild === 'function') {
        // children is of type CellChildFunction
        content = cellChild(itemValue, item);
      } else if (cellChild) {
        // When a cell ignores the item value and defines its own.
        content = column.child;
      } else if (React.isValidElement(column.child)) {
        // When a component expects the item's value as a children prop. For example <TextCell />
        content = React.cloneElement(column.child, {}, itemValue as React.ReactNode);
      }

      return (
        <td
          key={`${item.itemId}.${dataKey}.${columnIndex}`}
          className={`c-cardTable-td${columnClassName}`}
          role={isRowHeader ? 'rowheader' : 'cell'}
        >
          <div className='c-cardTable-row-header'>{column.headerLabel}</div>
          {content}
        </td>
      );
    });

    let customRowClass = '';
    if (rowClassName) {
      if (typeof (rowClassName) === 'string') {
        customRowClass = ` ${rowClassName}`;
      } else {
        customRowClass = ` ${rowClassName(item)}`;
      }
    }

    return (
      <tr
        key={item.itemId}
        className={`${rowClass}${customRowClass}${activeClass}`}
        tabIndex={0}
        onKeyUp={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter') {
            if (this.props.selection !== 'none') {
              this.onCheckBoxClick(event, item);
            }
          }
        }}
        onClick={(event: React.MouseEvent) => {
          if (this.props.selection !== 'none') {
            this.onCheckBoxClick(event, item);
          }
        }}>
        {checkBoxCell}
        {rowCells}
      </tr>
    );
  }

  private toggleItemSelection(item: TDataItem): void {
    const { onItemSelected, onSelectionChanged, selection } = this.props;

    switch (selection) {
      case 'none':
        return;
      case 'single':
        this.setState({ selectedItems: [item] });
        if (onItemSelected) {
          onItemSelected(item);
        }
        break;
      case 'multiple':
        this.setState({ selectedItems: [item] });
        if (onSelectionChanged) {
          onSelectionChanged([item]);
        }
        break;
      default:
        return;
    }
  }

  private toggleSort(dataKey: string): void {
    const { sortByDataKey, sortOrder } = this.state;
    const newSortOrder = (dataKey !== sortByDataKey) ? sortOrder : (sortOrder === 'asc') ? 'desc' : 'asc';
    this.setState({ sortByDataKey: dataKey, sortOrder: newSortOrder });
  }

  private onAllCheckBoxClick(): void {
    const { data, onSelectionChanged } = this.props;
    const { selectedItems } = this.state;

    let newSelectedItems: TDataItem[];

    if (data.length !== selectedItems.length) {
      newSelectedItems = data;
    } else {
      newSelectedItems = [];
    }

    this.setState({ selectedItems: newSelectedItems });

    if (onSelectionChanged) {
      onSelectionChanged(newSelectedItems);
    }
  }

  private getMultipleCheckboxHeader(): JSX.Element | undefined {
    const { selection, data, selectAllAriaLabel } = this.props;
    const { selectedItems } = this.state;
    if (selection !== 'multiple') { return; }

    const checked = data.length === selectedItems.length && data.length !== 0;
    const iconChecked = getIconChecked(checked, 'checkbox.selectAll', selectAllAriaLabel || '', -1);

    return (
      <th
        key='header.selectAll'
        aria-label={selectAllAriaLabel}
        className='c-cardTable-header cc-checkbox-td'
        scope='col'
        tabIndex={0}
        onClick={this.onAllCheckBoxClick}
        onKeyUp={(event: React.KeyboardEvent) => {
          switch (event.key) {
            case 'Left': // IE/Edge specific
            case 'ArrowLeft': {
              const currentNode = event.currentTarget.previousElementSibling as HTMLElement;
              currentNode.focus();
              break;
            }
            case 'Right': // IE/Edge specific
            case 'ArrowRight': {
              const nextNode = event.currentTarget.nextElementSibling as HTMLElement;
              nextNode.focus();
              break;
            }
            case 'Enter': {
              this.onAllCheckBoxClick();
              break;
            }
          }
        }}
      >
        {iconChecked}
      </th>
    );
  }

  private getColumnChildren(): { columnCells: ColumnCell<TDataItem>[], headerCells: JSX.Element[], sortColumn: Column<TDataItem> | undefined } {
    const { children } = this.props;
    const { sortByDataKey } = this.state;
    const headerCells: JSX.Element[] = [];
    const columnCells: ColumnCell<TDataItem>[] = [];
    let sortColumn: Column<TDataItem> | undefined;

    const multipleCheckBox = this.getMultipleCheckboxHeader();
    if (multipleCheckBox) {
      headerCells.push(multipleCheckBox);
    }

    let childrenArray = children as unknown as Column<TDataItem>[];
    if (!childrenArray.length) {
      childrenArray = [children as unknown as Column<TDataItem>];
    }

    for (let childIndex = 0; childIndex < childrenArray.length; childIndex++) {
      const child = childrenArray[childIndex];
      // When columns are hidden (e.g. switching roles), child will be falsy
      if (!child || !child.props) {
        continue;
      }

      const columnProps = child.props;

      let headerLabel = '';
      let headerCell: Header | undefined;
      let columnCell: Cell | undefined;

      if ((columnProps.dataKey === sortByDataKey) && columnProps.sortable) {
        sortColumn = child;
      }


      for (const columnProp of (columnProps.children as React.ReactElement<ColumnChild>[])) {
        if (columnProp.type === Header) {
          headerCell = asComponent(columnProp) as Header;
        } else {
          columnCell = asComponent(columnProp) as Cell;
        }
      }

      if (headerCell) {
        const headerChild = headerCell && headerCell.props.children;
        const label = (headerCell && headerCell.props.label) || ((typeof headerChild === 'string') && headerChild);
        if (label) {
          headerLabel = `${label}:`;
        }
        headerCells.push(this.getHeaderCell(columnProps, headerCell, childIndex));
      }

      columnCells.push({
        child: columnCell,
        headerLabel,
        props: columnProps,
      });
    }

    return { columnCells, headerCells, sortColumn };
  }

  public componentDidUpdate(prevProps: TableProps<TDataItem>): void {
    const { data, defaultSelectedItemId, selection } = this.props;

    if (selection === 'single' && defaultSelectedItemId !== prevProps.defaultSelectedItemId) {
      const selectedItem = defaultSelectedItemId && data.find(item => item.itemId === defaultSelectedItemId);
      const selectedItems = selectedItem ? [selectedItem] : [];
      this.setState({ selectedItems });
    }
  }

  public render(): React.ReactNode {
    const { borders, caption, className, data, headerStyle, isHeaderVisible, headerClassName,
      selection, sortable: isTableSortable, collapseBreakpoint } = this.props;
    const { sortOrder } = this.state;
    const { columnCells, headerCells, sortColumn } = this.getColumnChildren();

    // CSS Classes
    const containerClass = `${className || ''}`;
    const tableClass = `c-cardTable x-break-${collapseBreakpoint}`;
    const bordersClass = borders ? ' c-cardTable-borders' : '';
    const selectableClass = (selection !== 'none') ? ' c-cardTable-row-selectable' : '';
    const rowClass = `c-cardTable-row${selectableClass}${bordersClass}`;

    if (isTableSortable && sortColumn) {
      const sortFunction = sortColumn.props.sortFunction || this.defaultSort.bind(this);
      data.sort(sortFunction(sortOrder));
    }

    const rows = data.map(item => this.getRow(item, columnCells, rowClass));
    const body = <tbody>{rows}</tbody>;

    let theadClass = `c-cardTable-thead ${headerClassName || ''}`.trim();
    if (headerStyle === 'sticky') {
      theadClass += ' cc-sticky-table-header';
    }

    const header = isHeaderVisible && (
      <thead className={theadClass}>
        <tr className={rowClass}>
          {headerCells}
        </tr>
      </thead>
    );

    return (
      <div className={containerClass}>
        <table className={tableClass}>
          <caption className='x-screen-reader'>{caption}</caption>
          {header}
          {body}
        </table>
      </div>
    );
  }
}
//#endregion Table
