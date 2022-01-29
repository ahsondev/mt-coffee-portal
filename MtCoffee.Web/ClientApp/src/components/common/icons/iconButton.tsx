import React, { CSSProperties } from 'react';
import { IconName } from './svgIconNames';
import './iconButton.scss';

type IconButtonProps = React.AriaAttributes & {
  id?: string;
  title: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: CSSProperties;
  iconName: IconName;
  onClick?: () => void;
}

export const IconButton: React.FunctionComponent<IconButtonProps> = (props: IconButtonProps) => {
  const {
    id,
    title,
    className,
    iconName,
    autoFocus,
    onClick,
    disabled = false,
    ...others
  } = props;

  // Prevent a whole bunch of speed clicks when navving via keyboard.
  const refPressed = { isPressed: false };
  const iconClass = `icon-${iconName}`;

  return (
    <button
      {...others}
      id={id}
      type='button'
      className={`c-icon-button icon-x-before ${iconClass} ${className} `}
      title={title}
      aria-label={title}
      tabIndex={!disabled ? 0 : -1}
      autoFocus={autoFocus}
      onClick={(!disabled && onClick) ? (e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      } : undefined}
      aria-disabled={disabled || undefined}
      onBlur={() => {
        refPressed.isPressed = false;
      }}
      onKeyDown={(!disabled && !!onClick && ((event: React.KeyboardEvent<HTMLElement>) => {
        switch (event.key) {
          case ' ':
          case 'Enter':
            event.preventDefault();
            event.stopPropagation();
            refPressed.isPressed = true;
            break;
          default:
            refPressed.isPressed = false;
            break;
        }
      })) || undefined}
      onKeyUp={(!disabled && !!onClick && ((event: React.KeyboardEvent<HTMLElement>) => {
        // Prevent a whole bunch of speed clicks when navving via keyboard.
        if (!refPressed.isPressed) {
          return;
        }

        switch (event.key) {
          case ' ':
          case 'Enter':
            event.preventDefault();
            event.stopPropagation();
            onClick();
            break;
          default:
            break;
        }

        refPressed.isPressed = false;
      })) || undefined}
    >
    </button>
  );
}

type IconProps = React.AriaAttributes & {
  title?: string;
  className?: string;
  iconName: IconName;
}

export const Icon: React.FunctionComponent<IconProps> = (props: IconProps) => {
  const {
    title,
    className,
    iconName,
    ...others
  } = props;

  if (!iconName.startsWith('svg-')) {
    const iconClass = `icon-${iconName}`;

    return (
      <i
        {...others}
        className={`icon-x-before ${iconClass} ${className} `}
        title={title}
        aria-label={title}
      />
    );
  } else {
    return (
      <div className='icon-svg'>
        <img
          {...others}
          className={`icon-x-before ${className} `}
          src={`/assets/icons/${iconName.substr(4)}.svg`}
          title={title}
          aria-label={title}
          alt={title}
        />
      </div>
    );
  }
}
