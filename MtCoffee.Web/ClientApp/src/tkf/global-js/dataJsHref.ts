import { appHistory } from '../../routes';
import { ready } from './eventHelper';
// ------------  [data-js-href]  ------------------------------------------------------------------
// On some context placement items we want a user to be able to click anywhere within a section to
// have it function like a hyperlink. That means ctrl + click or middle click should open link in
// new window, and regular click should open link in same window. Ensures no scrolling behavior
// starts in the event of a middle click. 

// If the user clicks a hyperlink directly, this behavior does nothing. The actual hyperlink takes
// higher priority, and none of this functionality should be used. This ensures you can have
// multiple links within a section.
// ------------------------------------------------------------------------------------------------

export class DataJsHref {
    private static isInitiated: boolean = false;
    private static origX: number = -1;
    private static origY: number = -1;
    private static target?: Element = undefined;

    public static doAssignHrefTargets() {
        document.querySelectorAll('[data-js-href]').forEach((hrefElem: Element) => {
            const attrHref = hrefElem.getAttribute('data-js-href');
            const matchingAnchors = hrefElem.querySelectorAll('[href="' + attrHref + '"]');
            matchingAnchors.forEach(function (anchorHref) {
                if (!anchorHref.classList.contains('f-href-target')) {
                    anchorHref.classList.add('f-href-target');
                }
            });
        });
    }

    public static onEnable = () => {
        if (DataJsHref.isInitiated) {
            return;
        }

        DataJsHref.isInitiated = true;
        ready(DataJsHref.doAssignHrefTargets);

        // When user middle clicks with mouse button, we want to prevent scroll behavior. Also,
        // we want to track where they started their click so we can tell if they clicked or did
        // some other operation on mouseup.
        document.addEventListener('mousedown', (e: MouseEvent) => {
            const targetElem = (e.target || undefined) as Element | undefined;
            DataJsHref.origX = e.clientX;
            DataJsHref.origY = e.clientY;
            DataJsHref.target = targetElem;

            if (!targetElem || targetElem.tagName === 'A' || targetElem.tagName === 'BUTTON') {
                return;
            }

            let hrefParent = e.target as Element | undefined;
            while (!!hrefParent && !hrefParent.hasAttribute('data-js-href')) {
                hrefParent = hrefParent.parentElement || undefined;
            }

            if (!!hrefParent && !!targetElem) {
                if (e.button === 1 || e.button === 2) {
                    const isMiddleClick = e.button === 1 || e.ctrlKey === true;
                    const isRightClick = e.button === 2;
                    if (isMiddleClick || isRightClick) {
                        e.stopPropagation();
                    }

                    e.preventDefault();
                    return; // false
                }
            }
        });

        // Enable middle click + click behavior for items within the data-js-href box.
        document.addEventListener('mouseup', (e: MouseEvent) => {
            const targetElem = (e.target || undefined) as Element | undefined;
            if (!targetElem || targetElem.tagName === 'A' || targetElem.tagName === 'BUTTON') {
                return;
            }

            let hrefParent = e.target as Element | undefined;
            while (!!hrefParent && !hrefParent.hasAttribute('data-js-href')) {
                hrefParent = hrefParent.parentElement || undefined;
            }

            // $(document).on('mouseup', '*[data-js-href]', function (e) {
            if (targetElem === DataJsHref.target) {
                if ((Math.max(e.clientX, DataJsHref.origX) - Math.min(e.clientX, DataJsHref.origX)) < 3) {
                    if ((Math.max(e.clientY, DataJsHref.origY) - Math.min(e.clientY, DataJsHref.origY)) < 3) {
                        if (hrefParent !== undefined) {
                            const isMiddleClick = e.button === 1 || e.ctrlKey === true;
                            const isRightClick = e.button === 2;

                            const href = hrefParent.getAttribute('data-js-href')!;
                            if (isMiddleClick) {
                                window.open(href);
                                e.stopPropagation();
                                return; // false
                            } else if (isRightClick) {
                                e.stopPropagation();
                                return; // false
                            } else {
                                appHistory.push(href);
                                // window.location.href = href;
                                e.stopPropagation();
                            }
                        }
                    }
                }
            }
        });
    }
}