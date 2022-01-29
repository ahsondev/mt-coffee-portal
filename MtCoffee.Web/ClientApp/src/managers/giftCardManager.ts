import { GiftCardInfo } from '@root/models/giftcard';
import { JsonPayload } from '@root/models/jsonPayload';
import { HttpClient, getHttpClient } from '@root/utils/httpClient';

export class GiftCardManager {
    protected httpClient: HttpClient;
    protected controllerName: string;

    constructor() {
        this.controllerName = 'giftcard';
        this.httpClient = getHttpClient();
        (window as any)['mgr'] = { ...(window as any)['mgr'], giftcard: this };
    }

    /**
     * Activate the card and set a monetary value on it.
     * @param scan the card ID
     * @param amount Number of CENTS
     */
    public async activateCard(scan: string, amount?: number): Promise<JsonPayload<number>> {
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        body.append('amount', (amount || 0).toString());
        const rs = await this.httpClient.post(`${this.controllerName}/ActivateCard`, body) as JsonPayload<number>;
        return rs;
    }

    /**
     * Add points to the card
     * @param scan the card ID
     * @param amount Number of POINTS
     */
    public async addPoints(scan: string, amount?: number): Promise<JsonPayload<number>> {
        amount = amount || 0;
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        body.append('amount', Math.abs(amount).toString());

        if ((amount!) >= 0) {
            const rs = await this.httpClient.post(`${this.controllerName}/AddPoints`, body) as JsonPayload<number>;
            return rs;
        } else {
            const rs = await this.httpClient.post(`${this.controllerName}/RemovePoints`, body) as JsonPayload<number>;
            return rs;
        }
    }

    /**
     * Remove points from card.
     * @param scan the card ID
     * @param amount Number of POINTS
     */
    public async removePoints(scan: string, amount?: number): Promise<JsonPayload<number>> {
        return await this.addPoints(scan, 0 - (amount || 0));
    }

    /**
     * Add points to the card
     * @param scan the card ID
     * @param amount Number of CENTS
     */
    public async addValue(scan: string, amount?: number): Promise<JsonPayload<number>> {
        amount = amount || 0;
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        body.append('amount', Math.abs(amount).toString());

        if ((amount!) >= 0) {
            const rs = await this.httpClient.post(`${this.controllerName}/AddValue`, body) as JsonPayload<number>;
            return rs;
        } else {
            const rs = await this.httpClient.post(`${this.controllerName}/RemoveValue`, body) as JsonPayload<number>;
            return rs;
        }
    }

     public async setValue(scan: string, amount?: number): Promise<JsonPayload<number>> {
        amount = amount || 0;
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        body.append('amount', Math.abs(amount).toString());

        const rs = await this.httpClient.post(`${this.controllerName}/SetValue`, body) as JsonPayload<number>;
        return rs;
    }

    /**
     * Remove value from card.
     * @param scan
     * @param amount amount in CENTS
     */
    public async removeValue(scan: string, amount?: number): Promise<JsonPayload<number>> {
        return await this.addValue(scan, 0 - (amount || 0));
    }


    /**
     * Get the MONEY balance in CENTS
     * @param scan the card ID
     */
    public async getMoneyBalance(scan: string): Promise<JsonPayload<number>> {
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        const rs = await this.httpClient.post(`${this.controllerName}/BalanceMoney`, body) as JsonPayload<number>;
        return rs;
    }

    /**
     * Set points for the card
     * @param scan the card ID
     * @param amount Number of CENTS
     */
     public async setPoints(scan: string, amount?: number): Promise<JsonPayload<number>> {
        amount = amount || 0;
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        body.append('amount', Math.abs(amount).toString());

        const rs = await this.httpClient.post(`${this.controllerName}/SetPoints`, body) as JsonPayload<number>;
        return rs;
    }

    /**
     * Get the balance in POINTS
     * @param scan the card ID
     */
    public async getPointBalance(scan: string): Promise<JsonPayload<number>> {
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        const rs = await this.httpClient.post(`${this.controllerName}/BalancePoints`, body) as JsonPayload<number>;
        return rs;
    }
     public async getInfo(scan: string): Promise<JsonPayload<GiftCardInfo>> {
        const body: BodyInit = new FormData();
        body.append('scan', scan);
        const rs = await this.httpClient.post(`${this.controllerName}/GetInfo`, body) as JsonPayload<GiftCardInfo>;
        return rs;
    }  
      
   public async setInfo(scan: GiftCardInfo): Promise<JsonPayload<boolean>> {
       const rs = await this.httpClient.post(`${this.controllerName}/SetInfo`, JSON.stringify(scan)) as JsonPayload<boolean>;
       return rs;
   }
}