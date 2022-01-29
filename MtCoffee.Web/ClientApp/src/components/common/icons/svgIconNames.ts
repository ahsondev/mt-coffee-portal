import { FontIconName } from "./iconNames";

type SvgIconNamesRaw =
    | 'bread'
    | 'coffee-cup'
    | 'coffee-pot'
    | 'sushi'
    | 'sushi-outlined'
    ;

type SvgIconName =  `svg-${SvgIconNamesRaw}`;
export type IconName = SvgIconName | FontIconName;