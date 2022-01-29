import React from 'react';
import { AppState } from '@root/store';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { TabList, TabSection } from '@root/components/common/navigation/tabList';
import { Page } from '../../../page';
import { ProductFormTab } from './productFormTab';
import { appHistory, AppRouteParameters } from '@root/routes';
import { Product, ProductCategory, ProductOption } from '@root/models/product';
import { ProductVariantsTab } from './productVariantsTab';
import { ProductOptionsTab } from './productOptionsTab';

type ManageProductsEditPageProps = RouteComponentProps<AppRouteParameters> & ManageProductsEditPagePropsFromStore & {
}

interface ManageProductsEditPageState {
    productId: number;
    defaultTab: string;
}

interface ManageProductsEditPagePropsFromStore {
    productMap: Record<number, Product>;
    productOptions: ProductOption[];
    productCategories: ProductCategory[];
}

class ManageProductsEditPageComponent extends React.PureComponent<ManageProductsEditPageProps, ManageProductsEditPageState> {

    constructor(props: ManageProductsEditPageProps) {
        super(props);
        const rowId = parseInt(props.match.params.id, 10);
        const entityRowId = !isNaN(rowId) && rowId || 0;
        const qs = new URLSearchParams(window.location.search);
        const defaultTab = `${qs.has('tab') && qs.get('tab') || 'details'}-tab`;

        this.state = {
            productId: entityRowId,
            defaultTab
        }
    }

    private onClickSectionTab = (tabId: string) => {
        appHistory.push(window.location.pathname + '?tab=' + tabId.replace('-tab', ''));
        this.setState({ defaultTab: tabId });
    }

    public componentDidUpdate(prevProps: Readonly<ManageProductsEditPageProps>) {
        if (parseInt(this.props.match.params.id, 10) !== this.state.productId) {
            this.setState({ productId: parseInt(this.props.match.params.id, 10) });
        }
    }

    public render(): React.ReactNode {
        const existingProduct = this.props.productMap[this.state.productId];

        return (
            <Page>
                <TabList
                    tabLocation='top'
                    defaultSectionId={this.state.defaultTab}
                >
                    <TabSection title='Product list' iconName='left' onClickTab={() => appHistory.push('/manage/products')}>
                        Switching to product list page...
                    </TabSection>
                    <TabSection title='Product details' iconName='pencil' sectionId='details-tab'
                        onClickTab={() => this.onClickSectionTab('details-tab')}>
                        <ProductFormTab
                            productId={this.state.productId}
                            existingProduct={existingProduct}
                            categories={this.props.productCategories}
                        />
                    </TabSection>
                    {this.state.productId > 0 && (
                        <TabSection title='Variants' iconName='flow-split' sectionId='variants-tab'
                            onClickTab={() => this.onClickSectionTab('variants-tab')} disabled={this.state.productId === 0}>
                            <ProductVariantsTab
                                productId={this.state.productId}
                                existingProduct={existingProduct}
                            />
                        </TabSection>
                    )}
                    {this.state.productId > 0 && (
                        <TabSection title='Options' iconName='cog-alt' sectionId='productOptions-tab'
                            onClickTab={() => this.onClickSectionTab('productOptions-tab')}>
                            <ProductOptionsTab
                                linkedEntityIds={existingProduct && existingProduct.productOptionIds || []}
                                entities={this.props.productOptions}
                                productId={this.state.productId}
                            />
                        </TabSection>
                    )}
                </TabList>
            </Page >
        );
    }
}

const stateToProps = (state: AppState, ownProps: Omit<ManageProductsEditPageProps, keyof ManageProductsEditPagePropsFromStore>): ManageProductsEditPagePropsFromStore => {
    return ({
        productCategories: state.productCategories,
        productOptions: state.productOptions,
        productMap: state.products.reduce((accum, prod) => {
            accum[prod.id!] = prod;
            return accum;
        }, {} as Record<number, Product>)
    });
};

export const ManageProductsEditPage = withRouter(connect(stateToProps)(ManageProductsEditPageComponent));