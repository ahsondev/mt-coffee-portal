import { TabButton, TabList, TabSection } from '@root/components/common/navigation/tabList';
import React from 'react';
import { Product, ProductCategory } from '../../../models/product';
import { TileButton } from '../../common/tileButton';
import './productContainer.scss';

interface ProductContainerProps {
  products: Product[];
  onClickProduct: (productId: number) => void;
  categories: ProductCategory[];
  isExpanded: boolean;
  isVisible: boolean;
  onSetExpand?: (expand: boolean) => void;
}

interface ProductContainerState {
}

export class ProductContainer extends React.PureComponent<ProductContainerProps, ProductContainerState> {
  constructor(props: ProductContainerProps) {
    super(props);

    this.state = {
      orderItems: []
    };
  }

  private onToggleExpanded = () => {
    if (!!this.props.onSetExpand) {
      this.props.onSetExpand(!this.props.isExpanded);

      // Force repaint. This is hacky, but it works. Not sure WHY it works.
      // Fixes a bug where after resizing, and then "hiding" the container,
      // it is 100% hidden and unable to be retrieved.
      document.body.style.display = 'flex';
      setTimeout(() => (document.body.style.display = ''), 0);
    }
  }

  private renderProductTileContainer = (products: Product[]) => {
    const { categories } = this.props;

    return (
      <div className='mt-tile-container'>
        {products.length > 0 && products.map((p, i) => {
          const onClickTile = !!this.props.onClickProduct
            ? () => this.props.onClickProduct!(p.id!)
            : undefined;
          const category = categories.find(c => c.id === p.categoryId);
          const colorCls = category && category.tileColor || '';

          return <TileButton key={i}
            className={colorCls}
            title={p.name}
            description={undefined} // `$${price}`
            onClick={onClickTile}
          />
        })}
      </div>
    );
  }

  private onClickProductListTab = () => {
    if (!!this.props.onSetExpand && !this.props.isExpanded) {
      this.props.onSetExpand(true);
    }
  }

  public render(): React.ReactNode {
    let { products } = this.props;
    const {
      categories,
      isVisible,
      isExpanded
    } = this.props;

    products = products.sort((a, b) => {
      const aCat = categories.find(c => c.id === a.categoryId);
      const bCat = categories.find(c => c.id === b.categoryId);
      const aCatSort = (aCat && aCat.sortOrder || -1);
      const bCatSort = (bCat && bCat.sortOrder || -1);
      return aCatSort > bCatSort ? -1 : 1;
    });

    return (
      <div id='mt-productContainer' style={isVisible ? {} : { display: 'none' }}>
        <TabList tabLocation='bottom' className='' isScrollVisible={true} defaultSectionId='pdct-container-tab-drinks'> 
          <TabButton
            title={isExpanded ? 'Visible' : 'Hidden'}
            iconName={!isExpanded ? 'eye-off' : 'eye'}
            onClickTab={this.onToggleExpanded}
            children={undefined}
          />
          <TabSection title='Drinks' iconName='svg-coffee-cup' onClickTab={this.onClickProductListTab} sectionId='pdct-container-tab-drinks'>
            {isExpanded && this.renderProductTileContainer(products.filter(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              return (!!cat && cat.categoryGroupName === 'Drinks');
            }))}
          </TabSection>
          <TabSection title='Restaurant' iconName='svg-sushi' onClickTab={this.onClickProductListTab}>
          </TabSection>
          <TabSection title='Bakery' iconName='svg-bread' onClickTab={this.onClickProductListTab}>
            {isExpanded && this.renderProductTileContainer(products.filter(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              return (!!cat && cat.categoryGroupName === 'Food');
            }))}
          </TabSection>
        </TabList>
      </div>
    );
  }
}