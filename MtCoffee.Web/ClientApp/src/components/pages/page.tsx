import { AuthManager } from '@root/managers/authManager';
import React from 'react';
import { NavMenu } from '../common/navigation/navmenu';
import { MessageBarSection } from '@components/messageBarAPI';
import './page.scss';

interface PageProps {
    className?: string;
}
export class Page extends React.PureComponent<PageProps> {

    //   static displayName = Layout.name;
    public render() {
        const { className } = this.props;
        
        return (
            <div className={`mt-page-container ${className}`}>
                <MessageBarSection />
                {false && <div className='mt-page-header'></div>}
                <NavMenu
                    title={`M&T P.O.S.`}
                    colorTheme='f-black'
                    defaultItems={[
                        { text: 'Home', to: '/' },
                        { text: 'Order', to: '/order' },
                        {
                            text: 'Manage', items: [
                                { text: 'Products', to: '/manage/products' },
                                { text: 'Product Options', to: '/manage/productOptions' },
                                { text: 'Discounts', to: '/manage/discounts' }
                            ]
                        },
                        { text: 'Reload', onClick: async () => window.location.reload() },
                        {
                            text: 'Extra', items: [
                                { text: 'Timesheet', to: '/timesheet' },
                                {
                                    text: 'Example Pages', items: [
                                        { text: 'Fetch Data', to: '/example/fetch-data' },
                                        { text: 'Counter', to: '/example/counter' }
                                    ]
                                },
                                {
                                    text: 'Log out', onClick: async () => {
                                        const am = new AuthManager();
                                        await am.logout();
                                    }
                                },
                                {
                                    text: 'Test', items: [
                                        { text: 'sub item 1', to: '/' },
                                        { text: 'sub item 2', to: '/' },
                                        { text: 'sub item 3', to: '/' },
                                        { text: 'sub item 3', to: '/' },
                                        { text: '0sub item 1', to: '/' },
                                        { text: '0sub item 2', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                        { text: '0sub item 2', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                        { text: '0sub item 3', to: '/' },
                                    ]
                                }
                            ]
                        }
                    ]}
                />
                <div className='mt-page-middle'>
                    {this.props.children}
                </div>
                {/* <div className='mt-page-footer' style={{ display: 'none' }}>
                    Stuff goes here
                </div> */}
            </div>
        );
    }
}
