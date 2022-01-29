import { JsonPayload } from '@root/models/jsonPayload';
import React from 'react';
import { Icon, IconButton } from '../components/common/icons/iconButton';
import './messageBarAPI.scss';

// --------------------  M E S S A G E _ B A R _ A P I  -------------------------------------------
// The MessageBarAPI can be used to display messages to users at the top of the page. This class
// should handle accessibility properly for alerts. Provides options to send messages in text form,
// or more advanced sendMessageBar({MessageBar}) functions for more control.
//
// To call this in your own code:
// 1. Ensure <MessageBarSection /> is used ONCE within the UI. Probably in app.tsx already. (never more than once)
// 2. In your TS/JS code just call: MessageBarAPI.sendErrorText('My error text', millisecondsBeforeFading);
//
// That's all you need to do.
type MessageBarType = 'success' | 'warning' | 'error' | 'severeWarning' | 'info';

interface IMessageBarProps {
    messageBarType: MessageBarType
    children: React.ReactNode;
    onDismiss?: () => void;
}

interface IMessageBarState {
    isExpanded: boolean;
    isExpanderVisible: boolean;
}

interface MessageBarSectionNode {
    uniqueId: string;
    messageBarProps: IMessageBarProps;
    ExpireTime?: number;
    TimeoutFunc?: any;
}

class MessageBar extends React.PureComponent<IMessageBarProps, IMessageBarState>{
    private refInnerText = React.createRef<HTMLDivElement>();
    private refText = React.createRef<HTMLDivElement>();

    constructor(props: IMessageBarProps) {
        super(props);
        this.state = { isExpanded: false, isExpanderVisible: false };
    }

    public componentDidMount() {
        if (this.refText.current && this.refInnerText.current) {
            if (this.refText.current.clientWidth < this.refInnerText.current.clientWidth + 32) {
                this.setState({ isExpanderVisible: true });
            }
        }
    }

    public render() {
        const { isExpanded } = this.state;
        let bgColor = '#E6E6E6';
        switch (this.props.messageBarType) {
            case 'success':
                bgColor = '#E3EF9E';
                break;
            case 'error':
                bgColor = '#FACFD3';
                break;
            case 'warning':
                bgColor = '#FFF1CC';
                break;
            case 'severeWarning':
                bgColor = '#FBD9CC';
                break;
            case 'info':
            default:
                break;
        }

        const rtVal = (
            <div className='ms-MessageBar' role="region"
                style={{
                    marginTop: '12px',
                    marginBottom: '12px',
                    backgroundColor: bgColor
                }}
            >
                <div className="ms-MessageBar-content" role='alert' aria-atomic='true'>
                    <div className="ms-MessageBar-icon" aria-hidden="true">
                        <Icon iconName='info-circled-alt' aria-hidden="true" />
                    </div>
                    <div className='ms-MessageBar-text' role="status" aria-live="assertive" ref={this.refText}>
                        <div className={`ms-MessageBar-innerText ${isExpanded && 'f-expanded' || ''}`} ref={this.refInnerText}>
                            {this.props.children}
                        </div>
                    </div>
                    {this.state.isExpanderVisible && (
                        <IconButton iconName={isExpanded ? 'up-open' : 'down-open'}
                            title={isExpanded ? 'See less' : 'See more'} aria-expanded={isExpanded}
                            onClick={() => { this.setState({ isExpanded: !isExpanded }) }}
                        />
                    )}
                    <IconButton iconName='cancel' title='Close' onClick={() => this.props.onDismiss && this.props.onDismiss()} />
                </div>
            </div>);
        return rtVal;
    }
}

export class MessageBarAPI {
    static sectionRef?: MessageBarSection;

    public static sendSuccess(messageText: React.ReactNode, msTimeout?: number, msgKey?: string): string | undefined {
        const msg: IMessageBarProps = {
            messageBarType: 'success',
            children: messageText
        };

        return MessageBarAPI._sendMessageHelper(msg, msTimeout, msgKey);
    }

    public static sendErrorPayload(rs: JsonPayload<unknown>, msTimeout?: number, msgKey?: string) {
        return MessageBarAPI._sendMessageHelper({
            messageBarType: 'error',
            children: (<div>
                <strong>Something went wrong! ({rs.statusCode}) Details:</strong>
                <ul>
                    {rs.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
            </div>
            )
        }, msTimeout, msgKey);
    }

    public static sendWarn(messageText: React.ReactNode, msTimeout?: number, msgKey?: string): string | undefined {
        const msg: IMessageBarProps = {
            messageBarType: 'warning',
            children: messageText
        };
        return MessageBarAPI._sendMessageHelper(msg, msTimeout, msgKey);
    }

    public static sendError(messageText: React.ReactNode, msTimeout?: number, msgKey?: string): string | undefined {
        const msg: IMessageBarProps = {
            messageBarType: 'error',
            children: messageText
        };
        return MessageBarAPI._sendMessageHelper(msg, msTimeout, msgKey);
    }

    public static sendInfo(messageText: React.ReactNode, msTimeout?: number, msgKey?: string): string | undefined {
        const msg: IMessageBarProps = {
            messageBarType: 'info',
            children: messageText
        };
        return MessageBarAPI._sendMessageHelper(msg, msTimeout, msgKey);
    }

    public static sendMessageBar(message: IMessageBarProps, msTimeout?: number, msgKey?: string): string | undefined {
        return MessageBarAPI._sendMessageHelper(message, msTimeout, msgKey);
    }

    private static _sendMessageHelper(message: IMessageBarProps, msTimeout?: number, msgKey?: string): string | undefined {
        if (!MessageBarAPI.sectionRef) {
            return undefined;
        }

        const curTime = new Date().getTime();
        const container = document.getElementsByClassName('message-bar-section')[0];

        if (!container) {
            return undefined;
        }

        if (!msgKey) {
            msgKey = curTime + '_' + MessageBarAPI.sectionRef.state.messages.length;
        }

        const msgNode: MessageBarSectionNode = {
            uniqueId: msgKey,
            messageBarProps: message
        };

        const hasTimeout = !!msTimeout && msTimeout > 0;
        if (hasTimeout) {
            // Start the timeout and also set a handle to this function so we can remove it on a dismiss event.
            msgNode.TimeoutFunc = window.setTimeout(() => {
                MessageBarAPI.removeMessageByKey(msgKey || 'thisDefaultValueWillNeverBeNeeded');
            }, msTimeout);
            msgNode.ExpireTime = curTime + (msTimeout || 0);
        }

        MessageBarAPI.removeExpiredMessages().then(() => {
            if (!!MessageBarAPI.sectionRef) {
                MessageBarAPI.sectionRef.setState((prevState: Readonly<MessageBarSectionState>) => {
                    return { ...prevState, messages: prevState.messages.concat(msgNode) };
                });
            }
        });

        return msgKey;
    }

    /**
     * @returns {Promise<void>} The callback after setting state
     */
    private static removeExpiredMessages(): Promise<void> {

        return new Promise(resolve => {
            if (!MessageBarAPI.sectionRef) {
                resolve();
                return;
            }

            MessageBarAPI.sectionRef.setState((prevState: Readonly<MessageBarSectionState>) => {
                const curTime = new Date().getTime();

                // Clear old timeouts for messages we will remove
                prevState.messages
                    .filter((v) => v.ExpireTime && v.ExpireTime <= curTime)
                    .forEach((v) => {
                        if (v.TimeoutFunc) {
                            window.clearTimeout(v.TimeoutFunc);
                        }
                    });

                // messages to keep
                const filteredMessages = prevState.messages.filter((v) => {
                    return !v.ExpireTime || v.ExpireTime > curTime;
                });

                return { ...prevState, messages: filteredMessages };
            }, resolve);
        });
    }

    /**
     * May as well filter out the expired ones while we are here as well.
     */
    public static removeMessageByKey(key: string): Promise<void> {
        return new Promise(resolve => {
            MessageBarAPI.removeExpiredMessages().then(() => {
                if (!MessageBarAPI.sectionRef) {
                    resolve();
                    return;
                }

                MessageBarAPI.sectionRef.setState((prevState: Readonly<MessageBarSectionState>) => {
                    prevState.messages.filter((v) => v.uniqueId === key)
                        .forEach((v) => {
                            if (v.TimeoutFunc) {
                                window.clearTimeout(v.TimeoutFunc);
                            }
                        });

                    const filteredMessages = prevState.messages.filter((v) => {
                        return v.uniqueId !== key;
                    });

                    return { ...prevState, messages: filteredMessages };
                }, resolve);
            });
        });
    }
}

interface MessageBarSectionState {
    messages: MessageBarSectionNode[];
}

export class MessageBarSection extends React.Component<any, MessageBarSectionState> {
    constructor(props: any) {
        super(props);
        MessageBarAPI.sectionRef = this;
        (window as any)['messageBarAPI'] = MessageBarAPI;
        this.state = {
            messages: []
        };
    }

    public render(): JSX.Element {
        const messagesToShow = this.state.messages.map(
            (v: MessageBarSectionNode, i: number) => {
                return (
                    <MessageBar
                        key={'message-bar-' + i}
                        messageBarType={v.messageBarProps.messageBarType}
                        onDismiss={() => {
                            MessageBarAPI.removeMessageByKey(v.uniqueId).then(() => {
                                if (v.messageBarProps.onDismiss) {
                                    v.messageBarProps.onDismiss();
                                }
                            });
                        }}
                    >
                        {v.messageBarProps.children}
                    </MessageBar>
                );
            },
            []
        );

        return (
            <div
                dir='ltr'
                className='message-bar-section'
                style={{ zIndex: messagesToShow.length > 0 ? 10000 : -100 }}
            >{messagesToShow}</div>
        );
    }
}