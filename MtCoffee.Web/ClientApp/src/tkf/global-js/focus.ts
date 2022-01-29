// -------  Focus Listeners  ----------------------------------------------------------------------
// For when regular focus checkers fail, and you need to track it.
let prevFocus: Element | undefined = undefined;
let curFocus: Element | undefined = undefined;

window.addEventListener('focusin', (ev: FocusEvent) => {
    const ncur = document.activeElement ? document.querySelector(':focus') : document.activeElement;
    if (!!ncur) {
        prevFocus = curFocus;
        curFocus = ncur;
    }
});

window.addEventListener('blur', (ev: FocusEvent) => {
    const elem = ev.target as Element;
    if (!!elem && elem.classList) {
        elem.classList.remove('x-hidden-focus');
    }
});

export const getPrevFocus = () => prevFocus;
export const getCurFocus = () => prevFocus;

// -------  Focus Visibility  ---------------------------------------------------------------------
// Add/Remove classes to body to mark when keyboard navigation is in progress.
let isFocusVisible = false;
window.addEventListener('mousedown', (ev: MouseEvent) => {
    if (isFocusVisible){
        isFocusVisible = false;
        const body: HTMLBodyElement = document.getElementsByTagName('body')[0];
        body.classList.add('x-focus-hidden');
        body.classList.remove('x-focus-visible');
    }

    const elem = ev.target as Element;
    if (!!elem && elem.classList) {
        elem.classList.add('x-hidden-focus');
    }
});

window.addEventListener('keyup', (ev: KeyboardEvent) => {
    if (!isFocusVisible) {
        isFocusVisible = true;
        const body: HTMLBodyElement = document.getElementsByTagName('body')[0];
        body.classList.add('x-focus-visible');
        body.classList.remove('x-focus-hidden');

        document.querySelectorAll('.x-hidden-focus').forEach((elem) => elem.classList.remove('x-hidden-focus'));
    }
});

if (true) {
    const body: HTMLBodyElement = document.getElementsByTagName('body')[0];
    body.classList.add('x-focus-hidden');
}