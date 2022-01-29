import { JsonPayload } from '@root/models/jsonPayload';
import { Product } from '../models/product';
import { BaseCrudManager } from './baseCrudManager';

export class ProductManager extends BaseCrudManager<Product> {
    constructor() {
        super('product');
        (window as any)['mgr'] = { ...(window as any)['mgr'], product: this };
    }


    public linkToProductOptions = async (productId: number, productOptionIds: number[]): Promise<JsonPayload<boolean | undefined>> => {
        const body: FormData = new FormData();
        body.append('productId', productId.toString());
        productOptionIds.forEach(pid => body.append('productOptionIds', pid.toString()));

        const rs = await this.httpClient.post(`${this.controllerName}/linkToProductOptions/`, body) as JsonPayload<boolean | undefined>;

        return rs;
    }

    public unlinkFromProductOptions = async (productId: number, productOptionIds: number[]): Promise<JsonPayload<boolean | undefined>> => {
        const body: FormData = new FormData();
        body.append('productId', productId.toString());
        productOptionIds.forEach(pid => body.append('productOptionIds', pid.toString()));

        const rs = await this.httpClient.delete(`${this.controllerName}/unlinkFromProductOptions/`, body) as JsonPayload<boolean | undefined>;

        return rs;
    }
    
    /*
    '8oz	12oz	16oz	20oz	24oz	32oz'.split('\t');
   
    // 'White Chocolate Mocha:		$3.75	$4.25	$5.00	$5.25	$5.75	$7.25'
    function toJson(cat, subcat, strLines) {
        const sizes =  '8oz	12oz	16oz	20oz	24oz	32oz'.split('\t');
        const rs = strLines.split('\n').map(str => {
            const prices = str.split('\t').map(cell => cell.replace(':','').replace('$',''));
            '8oz	12oz	16oz	20oz	24oz	32oz'.split('\t');
            let obj = {
                title: prices[0],
                category: cat || 'Drinks',
                subcategory: subcat,
                prices: prices.reduce((accum, curCell, idx) => {
                    if (idx > 1 && !!curCell) {
                        accum[sizes[idx-2]] = parseFloat(curCell);
                    }  
                    
                    return accum; 
                }, {})
            };
            return obj;
        })

        return JSON.stringify(rs).replace(/"([^"]+)":/g, '$1:').replace(/},{/gm,'},\n{').replace(/([0-9]+)oz/gm, "'$1oz'");
    }
    
    */
    public getAllProducts(): any[] {
        const result = [
            { name: "Mocha", category: "Drinks", subcategory: "Hot/Iced", prices: { '8oz': 3.25, '12oz': 4, '16oz': 4.75, '20oz': 5, '24oz': 5.5, '32oz': 7 } },
            { name: "White Chocolate Mocha", category: "Drinks", subcategory: "Hot/Iced", prices: { '8oz': 3.75, '12oz': 4.25, '16oz': 5, '20oz': 5.25, '24oz': 5.75, '32oz': 7.25 } },
            { name: "Caramel Macchiato", category: "Drinks", subcategory: "Hot/Iced", prices: { '8oz': 3.75, '12oz': 4.25, '16oz': 5, '20oz': 5.25, '24oz': 5.75, '32oz': 7.25 } },
            { name: "Cappuccino", category: "Drinks", subcategory: "Hot/Iced", prices: { '8oz': 3, '12oz': 3.25, '16oz': 4.5, '20oz': 4.75, '24oz': 5 } },
            { name: "Americano", category: "Drinks", subcategory: "Hot/Iced", prices: { '8oz': 2.35, '12oz': 2.6, '16oz': 3.1, '20oz': 3.6, '24oz': 4.1, '32oz': 5.6 } },

            { name: "Chai tea Latte", category: "Drinks", subcategory: "Tea and Other", prices: { '8oz': 3.5, '12oz': 4, '16oz': 4.5, '20oz': 5, '24oz': 5.5, '32oz': 7 } },
            { name: "Thai tea", category: "Drinks", subcategory: "Tea and Other", prices: { '16oz': 4.75, '20oz': 5, '24oz': 5.5, '32oz': 7 } },
            { name: "London Fog", category: "Drinks", subcategory: "Tea and Other", prices: { '8oz': 3, '12oz': 3.25, '16oz': 3.75, '20oz': 4, '24oz': 4.25 } },
            { name: "Hot Chocolate", category: "Drinks", subcategory: "Tea and Other", prices: { '8oz': 2.25, '12oz': 2.75, '16oz': 3.25, '20oz': 3.75, '24oz': 4.25, '32oz': 5.5 } },
            { name: "Apple Cider", category: "Drinks", subcategory: "Tea and Other", prices: { '8oz': 2, '12oz': 2.25, '16oz': 2.75, '20oz': 3.25, '24oz': 3.75 } },
            { name: "Tea", category: "Drinks", subcategory: "Tea and Other", prices: { '8oz': 2, '12oz': 2.25, '16oz': 2.75, '20oz': 3.25, '24oz': 3.5, '32oz': 5 } },
            { name: "Steamer", category: "Drinks", subcategory: "Tea and Other", prices: { '8oz': 2.25, '12oz': 2.75, '16oz': 3.25, '20oz': 3.75, '24oz': 4.25 } },

            { name: "Italian Soda", category: "Drinks", subcategory: "Energy", prices: { '12oz': 3.5, '16oz': 4, '20oz': 4.5, '24oz': 5, '32oz': 6.5 } },
            { name: "Energy Drink Spritzer", category: "Drinks", subcategory: "Energy", prices: { '20oz': 5.1, '32oz': 7.85 } },
            { name: "MT Spritzer", category: "Drinks", subcategory: "Energy", prices: { '32oz': 6.5 } },
            { name: "Lotus Energy drink", category: "Drinks", subcategory: "Energy", prices: { '12oz': 3.85, '16oz': 4.6, '20oz': 5.1, '24oz': 6.1, '32oz': 7.6 } },

            { name: "Espresso Shake", category: "Drinks", subcategory: "Blended", prices: { '8oz': 5, '12oz': 5.25, '16oz': 6, '20oz': 6.5, '24oz': 8 } },
            { name: "Bubble Tea", category: "Drinks", subcategory: "Blended", prices: { '12oz': 5.5, '20oz': 6.5, '24oz': 7.25 } },
            { name: "Frap", category: "Drinks", subcategory: "Blended", prices: { '8oz': 4.75, '12oz': 5.25, '16oz': 5.75, '20oz': 6.25, '24oz': 7.75 } },
            { name: "Blended Chai", category: "Drinks", subcategory: "Blended", prices: { '8oz': 4.75, '12oz': 5.25, '16oz': 5.75, '20oz': 6.25, '24oz': 7.75 } },
            { name: "Fruit Smoothie", category: "Drinks", subcategory: "Blended", prices: { '8oz': 5, '12oz': 5.25, '16oz': 5.75, '20oz': 6.25, '24oz': 7.75 } },
            { name: "Protein smoothie", category: "Drinks", subcategory: "Blended", prices: { '20oz': 8 } },
            { name: "Redbull smoothie", category: "Drinks", subcategory: "Blended", prices: { '20oz': 7, '24oz': 9 } },

            // { name: "Bubble Tea", category: "Drinks", subcategory: "Bubble Tea", prices: { '12oz': 5.5, '20oz': 6.5, '24oz': 7.25 } }
        ].reduce((accum, p) => {
            for (let a = 0; a < Object.keys(p.prices).length; a++) {
                const key = Object.keys(p.prices)[a];
                const price = (p.prices as Record<string, number>)[key];
                accum.push("INSERT INTO `product_variants` (`name`, `productId`, `priceOverride`) VALUES ('" + key + "', " +
                    "(SELECT id FROM products WHERE name = '" + p.name + "' limit 1)," + price + ");");
            }

            return accum;
        }, [] as string[]);

        return result;
    }


}