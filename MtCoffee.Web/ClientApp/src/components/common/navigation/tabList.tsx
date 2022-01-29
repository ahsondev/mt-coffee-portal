import React from 'react';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { getId } from '@root/utils/getId';

import './tabList.scss';
import { Icon } from '../icons/iconButton';
import { IconName } from '../icons/svgIconNames';

type TabPanelTabLocation = 'left' | 'top' | 'bottom';
type TabPanelTabType = 'button' | 'section';

interface TabSectionProps {
    className?: string;
    disabled: boolean;
    title: string;
    iconName?: IconName;
    sectionId?: string;
    children: (React.ReactElement | false)[] | React.ReactElement[] | React.ReactNode;
    onClickTab?: () => void;
    tabType: TabPanelTabType;
}

/*
 * The Column component doesn't have a render method because it's not displayed in the UI.
 * It's used as both a collection of settings defining a table column, and a container
 * of elements used to render table cells.
 * It's written this way to provide consumers a JSX syntax that feels idiomatic.
 */
export class TabSection extends React.PureComponent<TabSectionProps> {
    public static defaultProps = {
        disabled: false,
        title: 'Tab',
        tabType: 'section',
    };
}

/*
 * The Column component doesn't have a render method because it's not displayed in the UI.
 * It's used as both a collection of settings defining a table column, and a container
 * of elements used to render table cells.
 * It's written this way to provide consumers a JSX syntax that feels idiomatic.
 */
export class TabButton extends React.PureComponent<TabSectionProps> {
    public static defaultProps = {
        disabled: false,
        title: 'Tab',
        tabType: 'button',
    };
}

interface TabListProps {
    defaultSectionId?: string;
    children: React.ReactElement<TabSection | TabButton> | (React.ReactElement<TabSection | TabButton> | false)[];
    tabLocation: TabPanelTabLocation;
    className?: string;
    isScrollVisible: boolean;
    navigateOnUnsavedChanges?: boolean; // bypass default close - react router prompt handles unsaved changes when navigating
}

interface TabListState {
    currentSectionId?: string;
    isExpanded: boolean;
}

export class TabList extends React.PureComponent<TabListProps, TabListState> {
    private setStateAsync = setStateAsyncFactory(this);
    private tabListId = getId('tabList-');

    static defaultProps: TabListProps = {
        tabLocation: 'left',
        children: [],
        isScrollVisible: true
    };

    constructor(props: TabListProps) {
        super(props);

        const children = props.children;
        let childrenArray = children as unknown as TabSection[];
        if (!childrenArray.length) {
            childrenArray = [children as unknown as TabSection];
        }

        this.state = {
            isExpanded: false,
            currentSectionId: props.defaultSectionId || childrenArray.map((c, i) => this.getTabPanelId(i, c.props.sectionId))[0]
        };
    }

    private getTabPanelId = (index: number, sectionId?: string) => {
        return sectionId || `${this.tabListId}-tab-${index}`;
    }

    private getTabPanelButtonId = (index: number, sectionId?: string) => {
        return sectionId ? `btn-${sectionId}` : `btn-${this.tabListId}-tab-${index}`;
    }

    private renderTabHeaders = () => {
        const { children } = this.props;
        const { isExpanded } = this.state;

        const rootClasses = ['cc-tabHeaderList'];
        if (!isExpanded) rootClasses.push('f-closed');

        let childrenArray = children as unknown as TabSection[];
        if (!childrenArray.length) {
            childrenArray = [children as unknown as TabSection];
        }

        childrenArray = childrenArray.filter(c => !!c);

        return <ul role='tablist' className={rootClasses.join(' ')}>
            <li
                className='cc-tabHeader js-clickOnSpaceOrEnter f-toggle-collapse'
                key='expand-toggle' role='button'
                aria-expanded={isExpanded || undefined}
                onClick={() => this.setState({ isExpanded: !isExpanded })}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                tabIndex={0}
            >
                {isExpanded
                    && (<div className='cc-tabHeaderContent'>
                        <Icon iconName='left-open' title='Collapse' className='cc-titleIcon' />
                        <span className='cc-titleText'>Collapse</span>
                    </div>)
                    || (<div className='cc-tabHeaderContent'>
                        <Icon iconName='right-open' title='Expand' className='cc-titleIcon' />
                        <span className='cc-titleText'>Expand</span>
                    </div>)}
            </li>
            {childrenArray.filter(c => c.props.disabled === false).map((ts, tsi) => {
                const targetId = this.getTabPanelId(tsi, ts.props.sectionId);
                const isSelected = targetId === this.state.currentSectionId;
                const role = (ts.props.tabType === 'section') ? 'tab' : 'button';

                return <li
                    aria-label={ts.props.title}
                    id={this.getTabPanelButtonId(tsi, ts.props.sectionId)}
                    className={`cc-tabHeader js-clickOnSpaceOrEnter ${isSelected ? 'f-selected' : ''}`}
                    aria-selected={isSelected || undefined}
                    aria-disabled={ts.props.disabled}
                    key={tsi} role={role}
                    aria-controls={targetId}
                    tabIndex={0}
                    onClick={ts.props.disabled ? undefined : () => {
                        if (ts.props.onClickTab) { ts.props.onClickTab(); }
                        if (ts.props.tabType === 'section') {
                            this.setState({ currentSectionId: targetId });
                        }
                    }}

                >
                    <div className='cc-tabHeaderContent'>
                        {ts.props.iconName && <Icon iconName={ts.props.iconName}
                            title={ts.props.title} className='cc-titleIcon'
                        />}
                        <span className='cc-titleText'>{ts.props.title}</span>
                    </div>
                </li>
            })}
        </ul>
    }

    private renderTabs = () => {
        const { children } = this.props;

        let childrenArray = children as unknown as TabSection[];
        if (!childrenArray.length) {
            childrenArray = [children as unknown as TabSection];
        }
        childrenArray = childrenArray.filter(c => !!c);

        return <div className='cc-tabPanelContainer'>
            {childrenArray.map((ts, tsi) => {
                const isSelected = this.getTabPanelId(tsi, ts.props.sectionId) === this.state.currentSectionId;
                return <div key={tsi}
                    id={this.getTabPanelId(tsi, ts.props.sectionId)}
                    aria-labelledby={this.getTabPanelButtonId(tsi, ts.props.sectionId)}
                    className={`cc-tabPanel ${isSelected ? 'f-selected' : ''}`}
                    role='tabpanel'
                >
                    {!ts.props.disabled && ts.props.children || undefined}
                </div>
            })}
        </div>

    }
    public render(): React.ReactNode {


        const classArr: string[] = ['c-tabList'];
        if (this.props.isScrollVisible)
            classArr.push('f-scroll');
        if (this.props.tabLocation === 'left')
            classArr.push('f-tabs-left');
        else if (this.props.tabLocation === 'top')
            classArr.push('f-tabs-top');
        else if (this.props.tabLocation === 'bottom')
            classArr.push('f-tabs-bottom');

        const isVertical = (this.props.tabLocation === 'top' || this.props.tabLocation === 'bottom');

        // TODO: Add focus trap`
        return <section role='tablist'
            aria-orientation={isVertical ? 'vertical' : 'horizontal'}
            className={classArr.join(' ')} id={this.tabListId}>
            {this.renderTabHeaders()}
            {this.renderTabs()}
        </section>
    }
}