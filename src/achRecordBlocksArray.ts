import * as ach from './utils/achCEMs';

import { AchDataTypeUtil } from './utils/achDataTypesUtil';
import { EntryDetailRecord } from './achEntryDetailRecord';
import { EntryAddendaRecord } from './achEntryAddendaRecord';

export class RecordBlocksArray {

    public constructor(recordBlock:string[]) {
        this._indBlockLines = recordBlock;
        // now need to validate the text, as it is already done at file level
        this.parseRawText();
    }

    public isIAT(): boolean {
        return this.getRecordHeaderField(50, 53) === "IAT"; // Check SEC Code for "IAT"
    }


    //header fields

    //service class - common for both ACH and IAT
    //02-04	3	Numeric	Service Class Code	Identifies the type of entries in the batch 200 - ACH Entries Mixed Debits and Credits.	M
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

   
    // 6	51-53	3	Alpha	Standard Entry Class Code	Standard Entry Class Code.
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


    // ACH
    //3	05-20	16	Alpha-Numeric	Company Name	Company Name	O 
    //IAT
    //3	05-20	16	blank	IAT Indicator	Leave blank	O

    public get companyName() { return this.getRecordHeaderField(4, 20);  }

    //CompanyIDentification is referred to as Originator Identification for IAT
    public get headerCompanyIdentification() { return this.getRecordHeaderField(40, 50);  } 
    public get companyEntryDescrption() { return this.getRecordHeaderField(53, 63);  }
        // ACH-Specific Methods
    public get companyDescriptiveDate() {
        if (!this.isIAT()) {
            return AchDataTypeUtil.toDate(this.getRecordHeaderField(63, 69));
        }
        return "";
    }

    // Common for both ACH and IAT: Effective Entry Date
    public get effectiveEntryDate() {
        const positionStart = this.isIAT() ? 72 : 69;
        const positionEnd = this.isIAT() ? 78 : 75;
        return AchDataTypeUtil.toDate(this.getRecordHeaderField(positionStart, positionEnd));
    }

    public get originatorStatusCode() { return this.getRecordHeaderField(78, 79);  }
    public get headerOriginatingDFIIdentification() { return this.getRecordHeaderField(79, 87);  }
    public get headerBatchNumber() { return parseInt(this.getRecordHeaderField(87, 94));  }

    // IAT-Specific Methods
    //4	21-22	2	'FF'	Foreign Exchange Indicator	Fixed-to-Fixed - No currency conversion. Entry is originated in a fixed-value amount and is to be received in the same fixed-value amount in the same currency. Fixed-value entries will have spaces in the Foreign Exchange Reference field.	M

    public get foreignExchangeIndicator() { 
        let ffCode:string = this.getRecordHeaderField(20, 22);
        let retStr: string = "";
        if (ach.AchCEMs.foreignExchangeIndicatorDescriptions.has(ffCode)) {
            retStr = ffCode + ' - ' + ach.AchCEMs.foreignExchangeIndicatorDescriptions.get(ffCode);
        }
        else {
            retStr = ffCode + ' - Description NOT Available';
        }

        return retStr;        
    }
 
    //5	23-23	1	'3'	Foreign Exchange Reference Indicator	Code used to indicate the content of the Foreign Exchange Reference Field.

    public get foreignExchangeReferenceIndicator() { 
        let ffRefIndicatorStr:string = this.getRecordHeaderField(22, 23);
        let retStr:string|undefined = "";

        let ffRefIndicatorNum = parseInt(ffRefIndicatorStr);

        if (isNaN(ffRefIndicatorNum) || !ach.AchCEMs.foreignExchangeReferenceIndicatorCodes.has(ffRefIndicatorNum)) {
            retStr = "Invalid Entry. Valid Entries are 1, 2 or 3";
        }
        else {
            retStr = ach.AchCEMs.foreignExchangeReferenceIndicatorCodes.get(ffRefIndicatorNum);
        }

        return ffRefIndicatorStr + ' - ' + retStr;
    }

    //6	24-38	15	blank	Foreign Exchange Reference	
    public get foreignExchangeReference() { return this.getRecordHeaderField(23, 38); }
    
    //7	39-40	2	Alphameric	ISO Destination Country Code	This field contains the two-character code, as approved by the International Organization for Standardization (ISO), to identify the country in which the entry is to be received. Values can be found on the International Organization for Standardization website: www.iso.org.

    public get iSODestinationCountryCode() { 
        let destCountryCode:string = this.getRecordHeaderField(38, 40);
        let retStr:string|undefined = "";

        if (!ach.AchCEMs.isoCountryCodeNames.has(destCountryCode)) {
            retStr = "Invalid Country Code Entry";
        }
        else {
            retStr = ach.AchCEMs.isoCountryCodeNames.get(destCountryCode);
        }

        return destCountryCode + ' - ' + retStr;
    }
    
    //11	64-66	3	Alphameric	ISO Originating Currency Code (Account Currency)
    public get originatingCurrencyCode() {
        let origCurrencyCode:string = this.getRecordHeaderField(63, 66);
        let retStr:string|undefined = "";

        if (!ach.AchCEMs.isoCurrencyCodeNames.has(origCurrencyCode)) {
            retStr = "Invalid Currency Code Entry";
        }
        else {
            retStr = ach.AchCEMs.isoCurrencyCodeNames.get(origCurrencyCode);
        }

        return origCurrencyCode + ' - ' + retStr;

    }

 //12	67-69	3	Alphameric	ISO Destination Currency Code (Payment Currency)
    public get DestinationCurrencyCode() {
        let destinCurrencyCode:string = this.getRecordHeaderField(66, 69);
        let retStr:string|undefined = "";

        if (!ach.AchCEMs.isoCurrencyCodeNames.has(destinCurrencyCode)) {
            retStr = "Invalid Currency Code Entry";
        }
        else {
            retStr = ach.AchCEMs.isoCurrencyCodeNames.get(destinCurrencyCode);
        }

        return destinCurrencyCode + ' - ' + retStr;

    }
    
    //end of header fields

    // control fields
    public get entryAddendaCount() { return parseInt(this.getRecordControlField(4, 10));  }
    public get entryHash() { return parseInt(this.getRecordControlField(10, 20));  }
    public get totalDebitEntry() { return AchDataTypeUtil.toMoney(this.getRecordControlField(20, 32));  }
    public get totalCreditEntry() { return AchDataTypeUtil.toMoney(this.getRecordControlField(32, 44));  }
    public get totalDebitEntryForIAT() { return AchDataTypeUtil.toMoney(this.getRecordControlField(20, 32), false);  }
    public get totalCreditEntryForIAT() { return AchDataTypeUtil.toMoney(this.getRecordControlField(32, 44), false);  }
  
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
                // Access the last (most recent) element and update its properties
                if (this._entryDetailRecordsArray.length > 0) {
                    let recentEntry = this._entryDetailRecordsArray[this._entryDetailRecordsArray.length - 1];
                    recentEntry.addAddendaRecord(new EntryAddendaRecord(this._indBlockLines[i]));
                }

            }
            else if (this._indBlockLines[i][0] === ach.RecordType.entryDetail) {
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
