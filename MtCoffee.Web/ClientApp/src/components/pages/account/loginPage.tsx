import React from 'react';
import { Page } from '@pages/page';
import { Checkbox } from '@components/common/form/checkbox';
import { AuthManager } from '@root/managers/authManager';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { actions } from '@root/store';

interface LoginPageProps {
}

interface LoginPageState {
    isRememberMe: boolean;
    email?: string;
    password?: string;
    errors: string[];
    isLoading: boolean;
}

export class LoginPage extends React.PureComponent<LoginPageProps, LoginPageState> {
    private setStateAsync = setStateAsyncFactory(this);

    constructor(props: LoginPageProps) {
        super(props);

        this.state = {
            isRememberMe: true,
            errors: [],
            isLoading: false
        };
    }

    private onSubmit = async () => {
        await this.setStateAsync({ isLoading: true });
        const am = new AuthManager();

        const json = await am.login({
            email: this.state.email || '',
            password: this.state.password || '',
            rememberMe: this.state.isRememberMe
        });

        if (!json.isSuccess) {
            await this.setStateAsync({ errors: json.errors, isLoading: false });
            return;
        }

        const userJson = await am.getUserProfile();
        const perms = await am.getPermissions();

        await this.setStateAsync({ errors: json.errors, isLoading: false });
        
        if (!!userJson.payload && userJson.isSuccess) {
            actions.setUserProfile(userJson.payload!);
        }

        if (perms.isSuccess && !!perms.payload) {
            actions.setUserPermissions(perms.payload!);
        }

    }

    public render(): React.ReactNode {
        const {
            isRememberMe,
            isLoading,
            errors,
            email,
            password
        } = this.state;
        return (
            <Page>
                <div data-grid='container'>
                    <div style={{ maxWidth: '300px', margin: 'auto', marginTop: '10%' }} >
                        {errors.length > 0 && (
                            <div data-grid='col-12'>
                                {errors.map((e, i) => <p key={i} className='c-error-text c-paragraph-4'>{e}</p>)}
                            </div>
                        )}
                        <div data-grid='col-12'>
                            <label className='c-label' htmlFor='tbxEmail'>Email</label>
                            <input
                                id='tbxEmail'
                                type='email'
                                className='c-text-field f-flex'
                                autoComplete='email'
                                value={email || ''}
                                disabled={isLoading}
                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                    ev.persist();
                                    const nVal = ev.target && ev.target.value || undefined;
                                    this.setState({ email: nVal })

                                }}
                            />
                        </div>
                        <div data-grid='col-12'>
                            <label className='c-label' htmlFor='tbxPassword'>Password</label>
                            <input
                                id='tbxPassword'
                                type='password'
                                className='c-text-field f-flex'
                                autoComplete='current-password'
                                value={password || ''}
                                disabled={isLoading}
                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                    ev.persist();
                                    const nVal = ev.target && ev.target.value || undefined;
                                    this.setState({ password: nVal })
                                }}
                            />
                        </div>
                        <div data-grid='col-12'>
                            <Checkbox id='cbxRememberMe'
                                checked={isRememberMe}
                                label='Remember me'
                                name='rememberMe'
                                onChange={(isChecked) => this.setState({ isRememberMe: isChecked })}
                            />
                        </div>
                        <div data-grid='col-12'>
                            <button className='c-button f-teal'
                                style={{ float: 'right' }}
                                disabled={isLoading}
                                type='submit'
                                onClick={this.onSubmit}
                            >Submit</button>
                        </div>
                    </div>
                </div>
            </Page >
        );
    }
}