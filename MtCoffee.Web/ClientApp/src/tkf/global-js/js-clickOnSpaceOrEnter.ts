// ------------  [js-clickOnSpaceOrEnter]  -----------------------------------------------------------------------
//  Click the "button" when user types SPACE or ENTER while element has focus. This is useful for making our pages
//  accessible by keyboard. Browsers typically allow users to "click" buttons and hyperlinks with SPACE or ENTER
//  as long as the links/buttons have certain attributes. In ome cases, those attributes cannot be applied. This
//  is a work-around to provide expected behavior to buttons and other controls to the user. 
// ---------------------------------------------------------------------------------------------------------------

const className = 'js-clickOnSpaceOrEnter';
let pressedTarget: HTMLElement | null = null;

document.addEventListener('blur', (e: FocusEvent) => {
    if (pressedTarget !== null) {
        pressedTarget = null;
    }
});

document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const jsTarget = e.target as HTMLElement | null;
        if (jsTarget === null) return;
        if (jsTarget.classList === undefined) return;
        if (!jsTarget.classList.contains(className)) return;
        e.preventDefault();
        e.stopPropagation();
        if (jsTarget === pressedTarget) return;
        pressedTarget = jsTarget;
    }
});

document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (!pressedTarget) return;

    if (e.key === 'Enter' || e.key === ' ') {
        const pTarget = pressedTarget;
        pressedTarget = null; // Clear pressed state.

        const jsTarget = e.target as HTMLElement | null;
        if (jsTarget === null) return;
        if (jsTarget.classList === undefined) return;
        if (!jsTarget.classList.contains(className)) return;
        
        if (jsTarget === pTarget) {
            e.preventDefault();
            e.stopPropagation();
            jsTarget.click();
        }
    }
});


export {};