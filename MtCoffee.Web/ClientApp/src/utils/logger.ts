/* eslint-disable */
export class Logger {

    public static debug = (message?: string, ...optionalParams: any[]): void => {
        const css = 'color: #BBB';
        if (optionalParams.length === 0) console.debug(`%c ${message}`, css);
        else if (optionalParams.length === 1) console.debug(`%c ${message}`, css, optionalParams[0]);
        else console.debug(`%c ${message}`, css, optionalParams);
    }

    public static log = (message?: any, ...optionalParams: any[]): void => {
        const css = 'color: #000';
        if (optionalParams.length === 0) console.log(`%c ${message}`, css);
        else if (optionalParams.length === 1) console.log(`%c ${message}`, css, optionalParams[0]);
        else console.log(`%c ${message}`, css, optionalParams);
    }

    public static info = (message?: any, ...optionalParams: any[]): void => {
        const css = 'color: #0078d4';
        if (optionalParams.length === 0) console.info(`%c ${message}`, css);
        else if (optionalParams.length === 1) console.info(`%c ${message}`, css, optionalParams[0]);
        else console.info(`%c ${message}`, css, optionalParams);
    }

    public static error = console.error;
    public static warn = console.warn;
}

(window as any)['logger'] = Logger;
/* eslint-enable */