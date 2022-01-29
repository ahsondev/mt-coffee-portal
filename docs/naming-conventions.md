## Naming conventions

### File naming conventions
|  Target | Style | Example   |
| ------------ | ------------ | ------------ |
| Files  | camelCase  | discountPicker.tsx <br/>discountPicker.scss|
| Folders | camelCase | managePages |
| scss component stylesheets | camelCase | discountPicker.scss |
| scss partials | lowercase with dashes | \_color-functions.scss |


### Typescript project naming conventions
|  Target | Style | Example   |
| ------------ | ------------ | ------------ |
| Classes | PascalCase | class DiscountPicker extends... |
| Types | PascalCase | type DiscountType = ... |
| Interfaces | PascalCase | interface DiscountPickerProps |
| Abstract classes | AbstractFoo | abstract class AbstractFoo |
| boolean variables | | hasFoo<br/>isFoo</br>shouldFoo</br>areFoos<br/>canFoo</br>|
|numeric variables || numFoo<br/> fooPercent</br>fooAmount<br/>quantity</br>|
|quotes| single | Always prefer single quotes over double quotes. |


### Css class naming conventions 
| class prefix  | usage/meaning  |
|---|---|
| .c-  | Component flags. For components that will contain lots of other elements.  |
| .f-  | Function flags or option flags. Use for css that should only affect the parent component.  |
| .x-  | Visibility or typography flags.  |
| .mt-  | Something project specific. Maybe a page class.  |
| .cc-  | sub component items that only have effects when inside of the parent component.  |
