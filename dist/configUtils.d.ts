interface ConfigOptions {
    dev: {
        [key: string]: any;
    };
    test: {
        [key: string]: any;
    };
    production: {
        [key: string]: any;
    };
}
export interface ConfigResponse {
    [key: string]: any;
}
export declare function createFromEnv(prefix: string, delimeter?: string): object;
export declare function createExportedModule(config: ConfigOptions): ConfigResponse;
export {};
