import React from 'react';
import { Icon } from '../icons/iconButton';
import { IconName } from '../icons/svgIconNames';
import './textButton.scss';

type TextButtonProps = {
  id?: string;
  text: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onClick?: () => void;
  iconName?: IconName;
  aria?: React.AriaAttributes;
  style?: React.CSSProperties;
}

export const TextButton: React.FunctionComponent<TextButtonProps> = (props: TextButtonProps) => {
  const {
    id,
    text,
    className,
    autoFocus,
    onClick,
    style,
    disabled = false,
    iconName,
    ...others
  } = props;

  // Prevent a whole bunch of speed clicks when navving via keyboard.
  const refPressed = { isPressed: false };
  let icon: React.ReactNode = undefined;
  if (!!iconName) {
    icon = <Icon iconName={iconName} />;
  }

  return (
    <button
      id={id}
      {...others}
      type='button'
      style={style}
      className={`c-text-button ${className || ''} ${!!iconName ? 'f-hasIcon' : ''}`}
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
      {text}
      {icon}
    </button>
  );
}