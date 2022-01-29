import React from 'react';

interface ICardTableHeaderCellProps {
  text: string;
}

interface ICardTableCellProps {
  content?: React.ReactNode;
}

export interface ICardTableRowProps {
  cells: ICardTableCellProps[];
  rowClassName?: string;
}

interface CardTableProps {
  headerCells: ICardTableHeaderCellProps[];
  rows: ICardTableRowProps[];
  isFixedHeader: boolean;
  isBordered: boolean;
  className?: string;
}

interface CardTableState {
}

export interface CardTableHeaderProps {

}

export class CardTable extends React.PureComponent<CardTableProps, CardTableState> {

  constructor(props: CardTableProps) {
    super(props);

    this.state = {
    };
  }

  public static defaultProps: CardTableProps = {
    headerCells: [],
    isBordered: true,
    isFixedHeader: true,
    rows: []
  }

  public render(): React.ReactNode {
    const { headerCells, rows, children } = this.props;
    return (
      <div className='c-cardTable f-fixed-header f-border'>
        {children}
        <div className='cc-thead'>
          <div className='cc-tr'>
            {headerCells.map((c, i) => <div key={i} className='cc-th'><div className='cc-tableCell'>{c.text}</div></div>)}
          </div>
        </div>
        <div className='cc-tbody'>
          {rows.map((r, ri) => <div className='cc-tr' key={ri}>
            {r.cells.map((c, ci) => (
              <div key={ci} className='cc-td'>
                <div className='cc-row-header'>
                  {headerCells[ci].text}
                </div>
                <div className='cc-row-cell'>
                  {c.content}
                </div>
              </div>
            ))}
          </div>)}
        </div>
      </div>
    );
  }
}