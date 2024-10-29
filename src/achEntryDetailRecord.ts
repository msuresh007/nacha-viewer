import { EntryAddendaRecord } from "./achEntryAddendaRecord";
import { AchCEMs } from "./utils/achCEMs";
import { AchDataTypeUtil } from './utils/achDataTypesUtil';

export class EntryDetailRecord {

    public constructor(detailLine:string) {
        this._detailLine = detailLine;

        // no need to validate the text, as it is already done at file level
        //this.parseRawText();  //no need to call parserawtext, as there would not be any child level elements.. just the properties should be good enough to do the honors..
    }

     // Public method to push a new addenda record into the array
     public addAddendaRecord(addendaRecord: EntryAddendaRecord): void {
        this._EntryAddendaRecordsArray.push(addendaRecord);
    }   

    public get transactionCode():string {

        let retStr: string|undefined = "";
        let transCode = this.getEntryDetailField(1, 3); 
        let transCodeNum = parseInt(transCode);
        if (isNaN(transCodeNum) || !AchCEMs.transactionCodes.has(transCodeNum)) {
            retStr = 'definition not found';
        }
        else {
            retStr = AchCEMs.transactionCodes.get(transCodeNum);
        }

        return transCode + ' - ' + retStr;
    }

    public get receivingDFIIdentification() { return this.getEntryDetailField(3, 11);  }    //Transit routing number of the receiver’s financial institution.
    public get checkDigit() { return this.getEntryDetailField(11, 12);  }   //The ninth digit of the receiving financial institution’s transit routing number.
    public get dfiAccountNumber() { return this.getEntryDetailField(12, 29);  } //Receiver’s account number at their financial institution. Left justify.
    public get amount() { return AchDataTypeUtil.toMoney(this.getEntryDetailField(29, 39)); } //Transaction amount in dollars with two decimal places.
    public get identificationNumber() { return this.getEntryDetailField(39, 54);  } // Receiver’s identification number
    public get individualName() { return this.getEntryDetailField(54, 76);  } // Receiver’s name .. and Company name also, whichever is applicable
    public get traceNumber() { return this.getEntryDetailField(79, 94);  } //The Bank will assign a trace number. This number will be unique to the transaction and will help   identify the transaction in case of an inquiry.

    public get AddendaRecordsHtmlTable() {
        let htmlText:string = "";
        if (this._EntryAddendaRecordsArray.length<1)
        {
            //there are no addenda records
            return htmlText;
        }
        htmlText+= "<tr> <td colspan=8> <table border=1 width=100%><tr><td width=10%> Type Code </td> <td width=10%>Sequence Number </td> <td style=\"text-align: center;\"> <font size=+1>Addenda Records</font></td></tr>";

        this._EntryAddendaRecordsArray.forEach(addendaRec => {
            htmlText+= `
            <tr>
            <td> ${addendaRec.TypeCode} </td>
            <td> ${addendaRec.SequenceNumber} </td>
            <td> ${addendaRec.addendaDetailInHtml} </td>
            </tr>
            `;
        });
        htmlText+="</table> </td> </tr>";
        return htmlText;
    }

    //non-public members
    protected readonly _detailLine: string;
    protected _EntryAddendaRecordsArray:EntryAddendaRecord[] = [];

    // protected parseRawText() {
        
    // }

    protected getEntryDetailField(startPos:number, endPos: number): string {
        return this._detailLine.substring(startPos, endPos);
    }



}