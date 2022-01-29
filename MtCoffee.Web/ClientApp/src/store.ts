import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import { configureStore, createSlice, PayloadAction, CaseReducer, SliceCaseReducers } from '@reduxjs/toolkit';
import { UserProfile } from './models/userProfile';
import { PermissionSet } from './models/permissions';
import { Discount } from './models/discount';
import { Product, ProductCategory, ProductOption } from './models/product';
import { Logger } from './utils/logger';

export interface AppState {
  discounts: Discount[];
  products: Product[];
  productOptions: ProductOption[];
  productCategories: ProductCategory[];
  userProfile?: UserProfile;
  userPermissions?: PermissionSet;
  innerWidth: number;
}

const initialState: AppState = {
  discounts: [],
  products: [],
  productOptions: [],
  productCategories: [],
  userProfile: undefined,
  userPermissions: undefined,
  innerWidth: window.innerWidth
};

interface AppStateReducers extends SliceCaseReducers<AppState> {
  setUserProfile: CaseReducer<AppState, PayloadAction<UserProfile>>;
  setUserPermissions: CaseReducer<AppState, PayloadAction<PermissionSet>>;
  setDiscounts: CaseReducer<AppState, PayloadAction<Discount[]>>;
  setProducts: CaseReducer<AppState, PayloadAction<Product[]>>;
  setProductOptions: CaseReducer<AppState, PayloadAction<ProductOption[]>>;
  setProductCategories: CaseReducer<AppState, PayloadAction<ProductCategory[]>>;
  setInnerWidth: CaseReducer<AppState, PayloadAction<number>>;
}

const storeSlice = createSlice<AppState, AppStateReducers>({
  name: 'appStore',
  initialState,
  reducers: {
    setInnerWidth: (state, action) => {
      state.innerWidth = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setUserPermissions: (state, action) => {
      state.userPermissions = action.payload;
    },
    setDiscounts: (state, action) => {
      state.discounts = action.payload;
    },
    setProductCategories: (state, action) => {
      state.productCategories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setProductOptions: (state, action) => {
      state.productOptions = action.payload;
    }
  }
});

const storeLogger = () => {
  return (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    Logger.debug(`Dispatching action ${action.type}`);
    return next(action);
  };
};

export class Auth {
  public static isAuthenticated = () => {
    const perms = store.getState().userPermissions;
    return perms && perms.isAuthenticated;
  }

  public static getUserProfile = () => {
    return store.getState().userProfile;
  }

  public static getPermissions = () => {
    return store.getState().userPermissions;
  }
}

export const store = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false }).concat(storeLogger),
  reducer: storeSlice.reducer,
});

export const actions = bindActionCreators(storeSlice.actions, store.dispatch);
