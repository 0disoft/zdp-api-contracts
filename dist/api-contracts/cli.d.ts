export interface ApiContractCheckCliRuntime {
    readonly cwd: string;
    readonly writeStdout: (text: string) => void;
    readonly writeStderr: (text: string) => void;
}
export declare function runApiContractCheckCli(argv: readonly string[], runtime?: ApiContractCheckCliRuntime): Promise<number>;
//# sourceMappingURL=cli.d.ts.map