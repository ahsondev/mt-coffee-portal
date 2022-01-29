import React from 'react';
import { connect } from 'react-redux';
import { Page } from '@pages/page';
import { Product, ProductCategory, ProductOption } from '../../../models/product';
import { LineItemTable } from './lineItemTable';
import { OrderSummary } from './orderSummary';
import { LineItem, OrderItem } from './sharedModels';
import { AppState } from '@root/store';
import { DEFAULT_DISCOUNT_SORT_ORDER, Discount } from '@root/models/discount';
import { Logger } from '@root/utils/logger';
import { MessageBarAPI } from '@root/components/messageBarAPI';
import { ProductContainer } from './productContainer';
import { TabList, TabSection } from '@root/components/common/navigation/tabList';
import { LineItemCustomizer } from './lineItemCustomizer';

import './orderPage.scss';
import { DiscountHelper } from '@root/managers/discountHelper';

interface OrderPageProps {
}

interface PropsFromStore {
  products: Product[];
  discounts: Discount[];
  productCategories: ProductCategory[];
  productOptions: ProductOption[];
  productsMap: Record<number, Product>;
  productOptionsMap: Record<number, ProductOption>;
  discountsMap: Record<number, Discount>;
  innerWidth: number;
}

type LineOrderItem = OrderItem & {
  uniqueId: string;
}

type OrderPageAllProps = OrderPageProps & PropsFromStore;

interface OrderPageState {
  orderItems: LineOrderItem[];
  currentOrderItemUniqueId?: string;
  isProductContainerExpanded: boolean;
}

class OrderPageComponent extends React.PureComponent<OrderPageAllProps, OrderPageState> {
  constructor(props: OrderPageAllProps) {
    super(props);

    this.onClickProduct = this.onClickProduct.bind(this);

    this.state = {
      orderItems: [],
      isProductContainerExpanded: true
    };
  }

  private getLineItem = (oi: LineOrderItem): LineItem => {
    const product = this.props.productsMap[oi.productId];
    if (!product) {
      Logger.error('No product found for product ID.', oi);
      MessageBarAPI.sendError('Failed to load product ID=' + oi.productId);
      throw new Error('Invalid product ID');
    }

    const variant = product && product.variants.find(v => v.id === oi.variantId);
    if (!variant && !!oi.variantId) {
      Logger.error('No product variant found for product variant ID.', oi);
      MessageBarAPI.sendError('Failed to load product variant ID=' + oi.variantId);
      throw new Error('Invalid product variant ID');
    }

    const optNames: string[] = [];
    let unitPrice = variant && variant.priceOverride || product.price;

    Object.keys(oi.options).forEach(optId => {
      const optionId = parseInt(optId, 10);
      const foundOpt = this.props.productOptionsMap[optionId];
      const quantity = oi.options[optionId];
      if (quantity < 1) return; // Skip this. Quantity is zero.

      if (!foundOpt) {
        Logger.warn('Product Option ' + optId + ' not found!');
        return;
      }

      if (quantity > 1) {
        optNames.push(`${foundOpt.name} (x${quantity})`);
      } else {
        optNames.push(foundOpt.name);
      }

      const priceOfOpt = (foundOpt.price || 0) * oi.options[optionId];
      unitPrice += priceOfOpt;
    });

    let descParts = [];
    if (variant && variant.name) descParts.push(variant.name);
    descParts = descParts.concat(optNames);
    const desc = descParts.join(', ');

    const uniqueId = `${Date.now()}_${this.state.orderItems.length}`;
    const discount = this.props.discounts.find(x => x.id === oi.discountId);
    
    const discountAmount = DiscountHelper.calcDiscountAmount({
      discountType: discount?.type,
      isOpenDiscount: discount?.isOpen,
      customDiscountEquation: discount?.customEquation,
      discountAmount: discount?.amount,
      unitPrice: unitPrice,
      quantity: oi.quantity,
      discountCustomAmount: oi.discountCustomAmount
    });

    return {
      descTitle: product.name,
      quantity: oi.quantity,
      unitPrice,
      discountId: oi.discountId,
      discountCustomAmount: oi.discountCustomAmount,
      descSubtitle: desc,
      uniqueId: oi.uniqueId || uniqueId,
      total: ((unitPrice * oi.quantity) - discountAmount)
    };
  }

  private onClickProduct = (productId: number) => {
    const uniqueId = `${Date.now()}_${this.state.orderItems.length}`;
    const product = this.props.productsMap[productId];
    const variantId = product.variants.filter(v => v.isDefaultVariant).map(v => v.id)[0] || undefined;

    this.setState({
      currentOrderItemUniqueId: uniqueId,
      orderItems: this.state.orderItems.concat({
        productId: productId,
        uniqueId: uniqueId,
        variantId: variantId,
        quantity: 1,
        options: {}
      })
    });
  }

  private onToggleExpand = (expand: boolean) => {
    this.setState({ isProductContainerExpanded: expand });
  }

  public renderLineItemCustomizer = () => {
    if (this.state.currentOrderItemUniqueId === undefined) return null;
    const uniqueId = this.state.currentOrderItemUniqueId;
    const orderItem = this.state.orderItems.find(oi => oi.uniqueId === this.state.currentOrderItemUniqueId);
    const product = orderItem && this.props.productsMap[orderItem.productId];
    const options = (product && product.productOptionIds || []).map(poid => this.props.productOptionsMap[poid]);
    const variants = (product && product.variants || []);

    if (!product || !orderItem) return null;

    return <LineItemCustomizer
      options={options}
      variants={variants}
      orderItem={orderItem}
      onChangeOrderItem={(oi) => {
        const updatedItems = this.state.orderItems.map(loi => loi.uniqueId === uniqueId ? { ...oi, uniqueId } : loi);
        this.setState({ orderItems: updatedItems });
      }}
      defaultPrice={product && product.price || 0}
      onClickFinish={() => this.setState({ currentOrderItemUniqueId: undefined })}
    />
  }

  public render(): React.ReactNode {
    const { orderItems, currentOrderItemUniqueId, isProductContainerExpanded } = this.state;
    const { products, productCategories, discounts } = this.props;
    const lineItems: LineItem[] = orderItems.map<LineItem>(oi => this.getLineItem(oi));
    const isMobile = this.props.innerWidth < ((window as any)['tsi'] || 670);
    const isEditingLineItem = currentOrderItemUniqueId !== undefined;
    const lineItemDiscounts = discounts.filter(x => x.isAppliedToItems)
      .sort((a, b) => (a.sortOrder || DEFAULT_DISCOUNT_SORT_ORDER)
        - (b.sortOrder || DEFAULT_DISCOUNT_SORT_ORDER));

        const lineItemSumSubtotal = lineItems.reduce((prev, li) => li.total + prev, 0);

    const lineItemTable = <LineItemTable
      lineItems={lineItems}
      discounts={lineItemDiscounts}
      onClickEdit={(li) => this.setState({ currentOrderItemUniqueId: li.uniqueId })}
      onChangeDiscount={(li, discount, openEntryAmount) => {
        let updated: LineOrderItem[] = this.state.orderItems.map<LineOrderItem>((lineItem) => {
          if (lineItem.uniqueId === li.uniqueId) {
            return {
              ...lineItem,
              discountId: discount && discount.id || undefined,
              discountCustomAmount: openEntryAmount
            } as LineOrderItem;
          }

          return lineItem;
        });

        console.log('onChangeDisc', { openEntryAmount, discId: discount && discount.id , updated })
        this.setState({ orderItems: updated });
      }}
      onChangeQuantity={(li, val) => {
        let updated: LineOrderItem[];

        if (val > 0) {
          updated = this.state.orderItems.map((lineItem) => {
            if (lineItem.uniqueId === li.uniqueId) {
              return { ...lineItem, quantity: val };
            }

            return lineItem;
          });
        } else {
          updated = (this.state.orderItems.filter(lineItem => lineItem.uniqueId !== li.uniqueId));
        }

        if (this.state.currentOrderItemUniqueId === li.uniqueId && val < 1) {
          this.setState({ currentOrderItemUniqueId: undefined });
        }

        this.setState({ orderItems: updated });
      }}
    />;

    // lineItems.reduce((prev, cur) => prev + cur.quantity * cur.unitPrice, 0)}
    const orderSummary = <OrderSummary
      subtotal={lineItemSumSubtotal}
    />;

    const pxHeightTopHalf = isProductContainerExpanded ? '350px' : `calc((100 * var(--vh)) - 50px - 30px)`;
    const pxHeightBottomHalf = isProductContainerExpanded ? `calc((100 * var(--vh)) - 50px - 350px)` : '30px';

    return (
      <Page>
        <div className='create-orders-page'>
          <section title='order details' id='fy-order-details-section'
            style={{ height: pxHeightTopHalf }}>
            {isMobile && (
              <TabList tabLocation='left' className=''>
                <TabSection title='Line items' iconName='list-bullet'>
                  {lineItemTable}
                </TabSection>
                <TabSection title='Order summary' iconName='clipboard'>
                  {orderSummary}
                </TabSection>
              </TabList>
            ) || (
                <div data-grid='col-12 f-fill-v' style={{ height: 'inherit' }}>
                  <div className='f-line-item-section'>
                    {lineItemTable}
                  </div>
                  <div className='f-order-summary-section'>
                    {orderSummary}
                  </div>
                </div>
              )}
          </section>
          <section title='product catalog' id='fy-product-catalog-section'
            style={{ height: pxHeightBottomHalf }}>
            <ProductContainer
              isVisible={!isEditingLineItem}
              products={products}
              categories={productCategories}
              onClickProduct={this.onClickProduct}
              onSetExpand={this.onToggleExpand}
              isExpanded={this.state.isProductContainerExpanded}
            />
            {isEditingLineItem && this.renderLineItemCustomizer()}
          </section>
        </div>
      </Page>
    );
  }
}

function arrayToMap<T extends { id?: number }>(arr: T[]): Record<number, T> {
  return arr.reduce<Record<number, T>>((accum, cur) => {
    accum[cur.id || -1] = cur;
    return accum;
  }, {});
}

const stateToProps = (state: AppState, ownProps: OrderPageProps): PropsFromStore => {
  return {
    productCategories: state.productCategories,
    innerWidth: state.innerWidth,
    discounts: state.discounts.filter(p => p.isActive),
    productOptions: state.productOptions.filter(p => p.isActive),
    products: state.products.filter(p => p.isActive),
    discountsMap: arrayToMap(state.discounts.filter(p => p.isActive)),
    productOptionsMap: arrayToMap(state.productOptions.filter(p => p.isActive)),
    productsMap: arrayToMap(state.products.filter(p => p.isActive))
  };
};

export const OrderPage = connect(stateToProps)(OrderPageComponent);