import * as ach from './utils/achCEMs';

import { AchDataTypeUtil } from './utils/achDataTypesUtil';
import { EntryDetailRecord } from './achEntryDetailRecord';

export class RecordBlocksArray {

    public constructor(recordBlock:string[]) {
        this._indBlockLines = recordBlock;
        // now need to validate the text, as it is already done at file level
        this.parseRawText();
    }


    //header fields

    public get headerServiceClassCode():string {

        let retStr: string|undefined = "";
        let scc = this.getRecordHeaderField(1, 4); 
        let sccNum = parseInt(scc);
        if (isNaN(sccNum) || !ach.AchCEMs.serviceClassCodes.has(sccNum)) {
            retStr = 'Undefined Code - Valid codes are 200, 220 and 225.';
        }
        else {
            retStr = ach.AchCEMs.serviceClassCodes.get(sccNum);
        }

        return scc + ' - ' + retStr;
    }

    public get standardEntryClassCode():string { 
        let retStr: string = "";
        let secCode = this.getRecordHeaderField(50, 53);  
        if (ach.AchCEMs.serviceEntryClassDescriptions.has(secCode)) {
            retStr = secCode + ' - ' + ach.AchCEMs.serviceEntryClassDescriptions.get(secCode);
        }
        else {
            retStr = secCode + ' - Description NOT Available';
        }

        return retStr;
    }

    public get companyName() { return this.getRecordHeaderField(4, 20);  }
    public get headerCompanyIdentification() { return this.getRecordHeaderField(40, 50);  }
    public get companyEntryDescrption() { return this.getRecordHeaderField(53, 63);  }
    public get companyDescriptiveDate() { return AchDataTypeUtil.toDate(this.getRecordHeaderField(63, 69));  }
    public get effectiveEntryDate() { return AchDataTypeUtil.toDate(this.getRecordHeaderField(69, 75));  }
    public get originatorStatusCode() { return this.getRecordHeaderField(78, 79);  }
    public get headerOriginatingDFIIdentification() { return this.getRecordHeaderField(79, 87);  }
    public get headerBatchNumber() { return parseInt(this.getRecordHeaderField(87, 94));  }

    //end of header fields

    // control fields
    public get entryAddendaCount() { return parseInt(this.getRecordControlField(4, 10));  }
    public get entryHash() { return parseInt(this.getRecordControlField(10, 20));  }
    public get totalDebitEntry() { return AchDataTypeUtil.toMoney(this.getRecordControlField(20, 32));  }
    public get totalCreditEntry() { return AchDataTypeUtil.toMoney(this.getRecordControlField(32, 44));  }
    //end of control fields

    public get entryDetailRecords(): EntryDetailRecord[] { return this._entryDetailRecordsArray; };

    /////////////////////// protected members

    protected readonly _indBlockLines: string[];
    protected _entryDetailRecordsArray: EntryDetailRecord[] = [];
    

    protected parseRawText() : void {

        // intentionally starting from 2nd element and going till last but one 
        // the first is header and last is control records.. so skipping them
        for (let i=1;i<this._indBlockLines.length - 1;++i) {

            if (this._indBlockLines[i][0] === ach.RecordType.entryDetailAddenda) {
                //continue as this is detail addenta record.. 
                //parsing addenda record will come in upcoming version
            }

            if (this._indBlockLines[i][0] === ach.RecordType.entryDetail) {
                let indEntryDetail = new EntryDetailRecord(this._indBlockLines[i]);
                this._entryDetailRecordsArray.push(indEntryDetail);
            }
        }


    }

    protected getRecordHeaderField(startPos:number, endPos: number): string {
        return this._indBlockLines[0].substring(startPos, endPos);
    }

    protected getRecordControlField(startPos:number, endPos: number): string {
        return this._indBlockLines[this._indBlockLines.length - 1].substring(startPos, endPos);
    }

}
