
export class RecordBlocksArray {

    public constructor(recordBlock:string[]) {
        this._indBlockLines = recordBlock;
    }

    protected readonly _indBlockLines: string[];
}