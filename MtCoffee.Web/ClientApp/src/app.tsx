import React from 'react';
import ReactDOM from 'react-dom';

import './app.css'
import { AuthManager } from './managers/authManager';
import { LoginPage } from '@pages/account/loginPage';
import { connect } from 'react-redux';
import { UserProfile } from './models/userProfile';
import { PermissionSet } from './models/permissions';
import { actions, AppState } from './store';
import { setStateAsyncFactory } from './utils/stateSetter';
import { DiscountManager } from './managers/discountManager';
import { ProductManager } from './managers/productManager';
import { ProductOptionManager } from './managers/productOptionManager';
import { ProductCategoryManager } from './managers/productCategoryManager';
import { RateLimiter } from './utils/rateLimiter';
import { isDiffPrimitiveProps } from './utils/diffChecker';

interface PropsFromStore {
  userProfile?: UserProfile;
  userPermissions?: PermissionSet;
}

type AppComponentProps = PropsFromStore & {
}

interface AppComponentState {
  isLoading: boolean;
  loadingMessage?: string;
}

class AppComponent extends React.Component<AppComponentProps, AppComponentState> {
  private setStateAsync = setStateAsyncFactory(this);
  private resizeLimiter = new RateLimiter(50);
  private isAuthAttempted = false;

  constructor(props: AppComponentProps) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  static displayName = AppComponent.name;

  // -------  onResize()  -----------------------------------------------------------------------
  // Handles setting of IsMobile, handles any changes between mobile and desktop that are needed.
  private onResize = () => {
    this.resizeLimiter.tryAction(this.onResizeActual);
  }

  private onResizeActual = (): void => {
    const vh = (window.innerHeight - 0.5) * 0.01;
    const vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    actions.setInnerWidth(window.innerWidth);
  }

  public shouldComponentUpdate(nextProps: Readonly<AppComponentProps>, nextState: Readonly<AppComponentState>): boolean {
    if (this.state.isLoading && nextState.isLoading) {
      return this.state.loadingMessage !== nextState.loadingMessage;
    }

    if (isDiffPrimitiveProps(this.state, nextState)) {
      return true;
    }

    if (isDiffPrimitiveProps(this.props.userPermissions, nextProps.userPermissions)) {
      return true;
    }

    if (isDiffPrimitiveProps(this.props.userProfile, nextProps.userProfile)) {
      return true;
    }

    return false;
  }

  public componentDidUpdate = async (prevProps: Readonly<AppComponentProps>) => {
    if (prevProps.userPermissions !== this.props.userPermissions) {
      if (this.props.userPermissions && this.props.userPermissions.isAuthenticated) {
        if (!this.isAuthAttempted) {
          this.isAuthAttempted = true;
          await this.onAuthenticated();
        }
      }
    }
  }

  public async componentDidMount(): Promise<void> {
    window.addEventListener('resize', this.onResize);
    this.onResize();

    try {
      const am = new AuthManager();
      const isAuthResult = await am.isAuthenticated();

      if (isAuthResult.payload === true) {
        await this.onAuthenticated();
      }

      this.setState({
        isLoading: false
      });
    } catch {
      this.setState({ loadingMessage: 'Internet is required!' });
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    this.resizeLimiter.cancel();
  }

  private async onAuthenticated(): Promise<void> {
    await this.setStateAsync({ isLoading: true });
    const am = new AuthManager();
    const dm = new DiscountManager();
    const pm = new ProductManager();
    const pom = new ProductOptionManager();
    const pcm = new ProductCategoryManager();

    try {
      const [jsonUp, jsonPerms, jsonDiscounts, jsonProducts, jsonProductOptions, jsonProductCategory]
        = await Promise.all([
          am.getUserProfile(),
          am.getPermissions(),
          dm.list(),
          pm.list(),
          pom.list(),
          pcm.list()
        ]);

      if (!!jsonUp.payload && jsonUp.isSuccess) {
        actions.setUserProfile(jsonUp.payload!);
      }

      if (!!jsonPerms.payload && jsonPerms.isSuccess) {
        actions.setUserPermissions(jsonPerms.payload!);
      }

      if (jsonDiscounts.isSuccess && !!jsonDiscounts.payload) {
        actions.setDiscounts(jsonDiscounts.payload || []);
      }

      if (jsonProducts.isSuccess && !!jsonProducts.payload) {
        actions.setProducts(jsonProducts.payload || []);
      }

      if (jsonProductOptions.isSuccess && !!jsonProductOptions.payload) {
        actions.setProductOptions(jsonProductOptions.payload || []);
      }

      if (jsonProductCategory.isSuccess && !!jsonProductCategory.payload) {
        actions.setProductCategories(jsonProductCategory.payload || []);
      }

    } catch (e) {
      // Logger.error(e);

      {
        await this.setStateAsync({ loadingMessage: 'profile' });
        const json = await am.getUserProfile();
        if (!!json.payload && json.isSuccess) {
          actions.setUserProfile(json.payload!);
        }
      }

      {
        await this.setStateAsync({ loadingMessage: 'permissions' });
        const json = await am.getPermissions();
        if (json.isSuccess && !!json.payload) {
          actions.setUserPermissions(json.payload!);
        }
      }

      {
        await this.setStateAsync({ loadingMessage: 'discounts' });
        const json = await dm.list();
        if (json.isSuccess && !!json.payload) {
          actions.setDiscounts(json.payload || []);
        }
      }

      {
        await this.setStateAsync({ loadingMessage: 'product categories' });
        const json = await pcm.list();
        if (json.isSuccess && !!json.payload) {
          actions.setProductCategories(json.payload || []);
        }
      }

      {
        await this.setStateAsync({ loadingMessage: 'products' });
        const json = await pm.list();
        if (json.isSuccess && !!json.payload) {
          actions.setProducts(json.payload || []);
        }
      }

      {
        await this.setStateAsync({ loadingMessage: 'product options' });
        const json = await pom.list();
        if (json.isSuccess && !!json.payload) {
          actions.setProductOptions(json.payload || []);
        }
      }
    }

    await this.setStateAsync({ isLoading: false });
  }

  public render(): React.ReactNode {
    /* TODO: show loading screen if loading core data */
    if (this.state.isLoading) {
      return ReactDOM.createPortal((<div className='mt-loading-panel'>
        <div className='mt-loading-text'>
          <div className='f-title'>
            Coffee P.O.S.
            </div>
          <div className='f-subtitle'>
            Loading...
            </div>
          <div className='f-details' aria-hidden={true}>{this.state.loadingMessage}</div>
        </div>
      </div>
      ), document.body, 'loading-screen');
    }

    if (!!this.props.userProfile && !!this.props.userPermissions &&
      this.props.userPermissions!.isAuthenticated === true) {
      return this.props.children;
    }

    return <LoginPage />;
  }
}

const stateToProps = (state: AppState, ownProps: Omit<AppComponentProps, keyof PropsFromStore>): PropsFromStore => {
  return ({
    userPermissions: state.userPermissions,
    userProfile: state.userProfile
  });
};

export const App = connect(stateToProps)(AppComponent);