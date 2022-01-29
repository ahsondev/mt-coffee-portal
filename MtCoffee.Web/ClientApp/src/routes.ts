import { createBrowserHistory } from 'history';
import { HomeIndex } from './components/pages/home';
import { OrderPage } from './components/pages/order/orderPage';
import { Counter } from './components/pages/examples/counter';
import { FetchData } from './components/pages/examples/fetchData';
import { TimesheetPage } from './components/pages/timesheet/timesheetPage';
import { ManageProductOptionsPage } from './components/pages/manage/products/manageProductOptionsPage';
import { ManageDiscountsPage } from './components/pages/manage/discounts/manageDiscountsPage';
import { ManageProductsListPage } from './components/pages/manage/products/manageProductsListPage';
import { ManageProductsEditPage } from './components/pages/manage/products/edit/manageProductsEditPage';
import { GiftCardIndexPage } from './components/pages/giftcard';

export interface AppRoute {
  component: React.ComponentType<any>;
  path: string | string[];
  defaultPathOnClick: string;
  exact?: boolean;
  icon?: string;
  label?: string;
}

export interface AppRouteParameters {
  /**
   * <EXAMPLE> Room Id. Short version (without the organization ID)
   */
  id: string;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export const appHistory = createBrowserHistory();
export const appRoutes: AppRoute[] = [
  { path: '/', label: 'Home', component: HomeIndex, exact: true },
  { path: '/order', label: 'Create Order', component: OrderPage, exact: true },
  { path: '/timesheet', label: 'Timesheet', component: TimesheetPage, exact: true },
  { path: '/example/counter', label: 'Counter', component: Counter, exact: true },
  { path: '/example/fetch-data', label: 'Fetch Data', component: FetchData, exact: true },
  { path: ['/manage/discounts', '/manage/discounts/edit/:id'], label: 'Edit discounts', component: ManageDiscountsPage, exact: true },
  { path: ['/manage/productOptions', '/manage/productOptions/edit/:id'],  label: 'Edit product options', component: ManageProductOptionsPage, exact: true },
  { path: '/manage/products',  label: 'Edit products', component: ManageProductsListPage, exact: true },
  // { path: '/manage/products/edit/:id',  label: 'Edit products', component: ManageProductsEditPage, exact: true },
  { path: '/manage/products/edit/:id', component: ManageProductsEditPage, exact: true },
  { path: '/manage/giftcards', label: 'Giftcards', component: GiftCardIndexPage, exact: true },
].map<AppRoute>((r: PartialBy<AppRoute, 'defaultPathOnClick'>) => {
  if (r.defaultPathOnClick === undefined) {
    if (!Array.isArray(r.path)) { 
      r.defaultPathOnClick = r.path as string;
    } else {
      r.defaultPathOnClick = (r.path as string[])[0];
    }
  }

  return r as AppRoute;
});

// .map(r => {r.});
