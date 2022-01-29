import React from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { setStateAsyncFactory } from '@root/utils/stateSetter';
import { getId } from '@root/utils/getId';

import './sidePanel.scss';
import { IconButton } from '../icons/iconButton';

// onClickClose => 
// 1. onTryClose: () => Promise<bool>
// 2. isClosing = true
// 3. Wait 300ms
// 4. set isRendered=false/iOpen = false, and isClosing = false.


// onInit (open=false)=> 
// isClosing = false
// isRendered = false
// open = false;

// onInit (open = true)=> isRendered=true
// open = true

// onChange(open -> close) 
// 1. isClosing = true
// 2. delay 300ms
// 3. isRendered = false

// onChange (close -> open) 
// 1. isOpening = true, isRendered = true
// 2. delay 300ms
// 3. isOpening = false


export type DidCloseFunction = (data?: unknown) => void;
export type TryCloseFunction = () => Promise<boolean>;
interface SidePanelProps {
    sidePanelKey: string;
    closeButtonAriaLabel: string; // close button labels must be unique for accessibility reasons
    className?: string;
    isScrollVisible: boolean;

    open: boolean;
    isbackgroundShaded: boolean;
    navigateOnUnsavedChanges?: boolean; // bypass default close - react router prompt handles unsaved changes when navigating
    size: 'small' | 'medium' | 'large' | 'xl';

    onTryClose?: TryCloseFunction;
    onClose?: DidCloseFunction;
}

interface SidePanelState {
    isRendered: boolean;
}

export class SidePanel extends React.PureComponent<SidePanelProps, SidePanelState> {
    private setStateAsync = setStateAsyncFactory(this);

    static defaultProps: SidePanelProps = {
        open: false,
        closeButtonAriaLabel: 'Close',
        isbackgroundShaded: true,
        isScrollVisible: true,
        sidePanelKey: getId('side-panel'),
        size: 'large'
    };

    constructor(props: SidePanelProps) {
        super(props);

        this.state = {
            isRendered: props.open
        };
    }

    private doClose = async () => {
        if (this.props.onTryClose) {
            const isClosable = await this.props.onTryClose();
            if (!isClosable) return;
        }

        await this.setStateAsync({ isRendered: false });

        if (this.props.onClose) {
            await this.props.onClose();
        }
    }

    public componentDidUpdate = async (prevProps: Readonly<SidePanelProps>) => {
        if (this.props.open !== prevProps.open) {
            if (this.props.open === false && this.state.isRendered !== false) {
                this.doClose();
            } else if (this.props.open === true && this.state.isRendered === false) {
                // This path might be glitchy due to the delay in isRendered updating for the animations.
                this.setState({
                    isRendered: true
                })
            }
        }
    }

    public render(): React.ReactNode {
        const { className } = this.props;
        const classes = ['c-sidePanel'];

        if (this.props.isbackgroundShaded) {
            classes.push('c-sidePanel-shaded');
        }

        if (this.state.isRendered
            //  && (this.state.isClosing === false || this.state.isOpening === false)
        ) {
            classes.push('c-sidePanel-open');
        }

        if (this.props.isScrollVisible && this.props.isScrollVisible === true) {
            classes.push('c-sidePanel-scroll');
        }

        switch (this.props.size) {
            case 'xl':
                classes.push('c-sidePanel-extra-large');
                break;
            case 'large':
                classes.push('c-sidePanel-large');
                break;
            case 'medium':
                classes.push('c-sidePanel-medium');
                break;
            default:
                break;
        }

        if (className) {
            classes.push(className);
        }
        const cssClasses = classes.join(' ');
        // TODO: Add focus trap
        return this.state.isRendered && ReactDOM.createPortal(
            <>
                {this.props.isbackgroundShaded && this.state.isRendered && (
                    <div className='c-sidePanel-shade' onClick={() => this.doClose()} aria-hidden={true} style={{ top: '50px' }}></div>
                )}
                <FocusTrap focusTrapOptions={{
                    allowOutsideClick: true,
                    escapeDeactivates: true,
                    clickOutsideDeactivates: true
                }}>
                    <section role='dialog' className={cssClasses}>
                        <div data-grid='col-12'>
                            <IconButton
                                autoFocus={true}
                                iconName='cancel'
                                className='c-sidePanel-close'
                                title={this.props.closeButtonAriaLabel}
                                onClick={() => this.doClose()}
                            />
                        </div>
                        <div data-grid='col-12'>
                            {this.props.children}
                        </div>
                    </section>
                </FocusTrap>
            </>, document.body, this.props.sidePanelKey) || null;
    }
}