import React from 'react';
import { appHistory, AppRoute, appRoutes } from '../../../routes';
import { TileButton } from '../../common/tileButton';
import { Page } from '@pages/page';

interface HomeIndexProps {
}

interface HomeIndexState {
}

export class HomeIndex extends React.PureComponent<HomeIndexProps, HomeIndexState> {
    constructor(props: HomeIndexProps) {
        super(props);

        this.state = {

        };
    }

    private getTileClass = (r: AppRoute): string | undefined => {
        if (r.label && r.label.indexOf('Edit') > -1) {
            return 'f-red-muted';
        }

        return undefined;
    }

    public render(): React.ReactNode {
        return (
            <Page>
                <div className='mt-tile-container'>
                    <TileButton key={-2} title='Swagger' className='f-purple' onClick={() => { window.location.href = '/swagger'; }} />
                    <TileButton key={-1} title='Fonts' className='f-purple' onClick={() => { window.location.href = '/assets/demo.html'; }} />
                    {appRoutes.filter(r => r.label).map((r, i) =>
                        <TileButton key={i} title={r.label!}
                            onClick={() => appHistory.push(r.defaultPathOnClick)}
                            className={this.getTileClass(r)}
                        />
                    )}
                </div>
            </Page>
        );
    }
}