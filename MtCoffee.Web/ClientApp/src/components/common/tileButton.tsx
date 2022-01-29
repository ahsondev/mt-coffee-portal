import React from 'react';
import './tileButton.scss';

interface TileButtonProps {
  title: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface TileButtonState {
}

export class TileButton extends React.PureComponent<TileButtonProps, TileButtonState> {
  constructor(props: TileButtonProps) {
    super(props);

    this.state = {
    };
  }

  public render(): React.ReactNode {
    const { title, description, className, onClick, disabled } = this.props;
    const refPressed = { isPressed: false };
    return (
      <div className={`mt-tile-button f-s96 ${className}`.trim()}
        tabIndex={0} role='button'
        aria-disabled={disabled}
        onClick={onClick}
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
        <span className='f-title'>{title}</span>
        <span className='f-description'>{description}</span>
      </div>
    );
  }
}