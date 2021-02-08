import { ENGINE_METHOD_DIGESTS } from 'constants';
import { stringify } from 'querystring';
import { start } from 'repl';
import { EnvironmentVariableMutatorType } from 'vscode';
import { ArrayUtil } from './utils/arrayUtil';
import { AchDataTypeUtil } from './utils/achDataTypesUtil';
import  {RecordBlocksArray} from './achRecordBlocksArray';
import * as achCEMs from './utils/achCEMs';

export class AchFileParser {


    public readonly achFileRawText:string;


    // file header record fields
    public get immediateDestination() { return this.getFileHeaderField(3, 13);  }
    public get immediateOrigin() { return this.getFileHeaderField(13, 23);  }
    public get fileCreationDate() { return AchDataTypeUtil.toDate(this.getFileHeaderField(23, 29));  }
    public get fileCreationTime() { return this.getFileHeaderField(29, 33);  }
    public get immediateDestinationName() { return this.getFileHeaderField(40, 63);  }
    public get immediateOriginName() { return this.getFileHeaderField(63, 86);  }

    // file control record fields
    public get batchCount() { return parseInt(this.getFileControlField(1, 7));  }
    public get entryAddendaCount() { return parseInt(this.getFileControlField(13, 21));  }
    public get totalDebitAmountsInFile() { return AchDataTypeUtil.toMoney(this.getFileControlField(31, 43));  }
    public get totalCreditAmountsInFile() { return AchDataTypeUtil.toMoney(this.getFileControlField(43, 55));  }
    

    public constructor(rawText:string)   {
        this.achFileRawText = rawText;
        this._indLines = this.achFileRawText.split('\n');
        
        if (this.validateTheRawText()) {
            //assigning the first and last lines to fileHeaderRecord and fileControlRecord
            // this._fileHeaderRecord = this._indLines[0];
            // this._fileControlRecord = this._indLines[this._indLines.length - 1];
            this.parseRawText();
        }
    }

    public get isFileValid():boolean {
        return this._isFileContentValid;
    }

    public get errorInfo():string {
        return this._errorInfo;
    }


    //non-public elements

    protected  _isFileContentValid:boolean = false;
    protected _errorInfo:string = "";    

    protected readonly _indLines: string[];
    protected _recordBlocksArray: RecordBlocksArray[] = [];

    //constants
    protected readonly eachLineExpectedLength:number = 94;

    protected validateTheRawText():boolean
    {
        //check if each of the lines length is exactly 94 characters
        for (var itemKey in this._indLines) {
            var eachString = this._indLines[itemKey];
            if (eachString.length !== this.eachLineExpectedLength) {
                this._isFileContentValid=false;
                this._errorInfo=`Invalid line length at number ${itemKey}. Expected length is ${this.eachLineExpectedLength}. This line is of length -> ${eachString.length}`;
                return false;
            }
        }
        //end of check if lines length is exactly 94 characters
        //-------------------------------------------------------------


        //check if file records are structured correctly
        /*
            1- File Header
                5 - Batch Header
                    6 - Entry Detail 
                    7 - Entry Detail Addendum (optional)
                8 - Batch Control
            9 - File Control 
        */

        
        for (var i=0;i<this._indLines.length; ++i) {
        
            const firstChar = this._indLines[i][0];
        
            if ("156789".indexOf(firstChar)<0) {
                this._isFileContentValid=false;
                this._errorInfo=`Invalid first character in line number ${i+1}`;
                return false;
            }

            if ((ArrayUtil.isFirstElement(i, this._indLines.length)) && (firstChar!== achCEMs.RecordType.fileHeader)) {
                //first line is not a file header record
                this._isFileContentValid=false;
                this._errorInfo=`First line is not a file header record.`;
                return false;
            }

            if ((ArrayUtil.isLastElement(i, this._indLines.length)) && (firstChar!==achCEMs.RecordType.fileControl)) {
                //last line is not a file control record
                this._isFileContentValid=false;
                this._errorInfo=`Last line is not a file Control record.`;
                return false;
            }

            if ((ArrayUtil.isOneOfTheMiddleElements(i, this._indLines.length)) 
                    && ((firstChar===achCEMs.RecordType.fileHeader) || (firstChar===achCEMs.RecordType.fileControl))) {
                //file header and/or file control file is repeated
                this._isFileContentValid=false;
                this._errorInfo=`File Header Record Type or File Control Record type is repeated in the file at line number ${i+1}`;
                return false;
            }

            //checking rules for batch header
            if (firstChar===achCEMs.RecordType.batchHeader) {
                //make sure this is immediately after fileHeader of batchControl Record
                if (ArrayUtil.isFirstElement(i, this._indLines.length)) {
                    //batch header cannot be first line
                    this._isFileContentValid=false;
                    this._errorInfo=`Batch Header cannot be the first line of file`;
                    return false;
                }

                let prevChar = this._indLines[i-1][0];

                if ((prevChar!==achCEMs.RecordType.fileHeader) && (prevChar!==achCEMs.RecordType.batchControl)) {
                    this._isFileContentValid=false;
                    this._errorInfo=`The line ${i+1} is of type Record Header. And previous line ${i} is not file Header or Batch Control type`;
                    return false;
                }
            }   // end of checking rules for batch header 

            //checking rules for batch control type
            if (firstChar === achCEMs.RecordType.batchControl) {
                
                let foundParingRecordHeader:boolean = false;

                //go up and see if there is a pairing batch header type record
                for (var j=i-1; j>0; --j) { //no need to go till fist element so, j>0
                    let prevChar = this._indLines[j][0];

                    if (prevChar === achCEMs.RecordType.batchHeader) {  //found correct header
                        foundParingRecordHeader = true;
                        break;
                    }

                    if ((prevChar === achCEMs.RecordType.entryDetail) || (prevChar === achCEMs.RecordType.entryDetailAddenda)) {
                        continue;
                    }

                    if ((prevChar === achCEMs.RecordType.batchControl) ||
                        (prevChar === achCEMs.RecordType.fileControl) ||
                        (prevChar === achCEMs.RecordType.fileHeader)) {   // red flag 
                            foundParingRecordHeader = false;
                            break;
                    }
                }

                if (foundParingRecordHeader === false) {
                    this._isFileContentValid=false;
                    this._errorInfo=`Batch Control Record at line ${i+1} is not paired with  Batch Header record properly`;
                    return false;

                }
            }   //end of checking rules for batch control type

            // did not write rules for detail and detail addenda records yet

            }   //end of for loop of individual lines



        this._isFileContentValid = true;
        return true;
    }    

    protected parseRawText() : void
    {
        //loop through the lines and break the lines into blocks of records and add them to the RecordBlocksArray object
        let startIndex = 0, endIndex = 0;
        for (let i=0;i<this._indLines.length;++i) {

            if (this._indLines[i][0] === achCEMs.RecordType.batchHeader)
            {
                startIndex = i;
                endIndex = 0;
                //go from here till end to find the batchcontrol record
                for (let j=startIndex+1;j<this._indLines.length;++j) {
                    if (this._indLines[j][0] === achCEMs.RecordType.batchControl) {
                        endIndex = j;
                        break;
                    }                    
                }

                //found the pairing batchControl record if endIndex!=0
                if (endIndex!==0) {
                    let recordBlocksArrayObj = new RecordBlocksArray(this._indLines.slice(startIndex, endIndex + 1));
                    this._recordBlocksArray.push(recordBlocksArrayObj);
                    startIndex = endIndex + 1;  // move the startIndex to after the endIndex
                }
            }   
        }
    }

    protected getFileHeaderField(startPos:number, endPos: number): string {
        return this._indLines[0].substring(startPos, endPos);
    }

    protected getFileControlField(startPos:number, endPos: number): string {
        return this._indLines[this._indLines.length - 1].substring(startPos, endPos);
    }

}


/*
enum AchDataTypes {
    "string" = 1,
    "integer" = 2,
    "date" = 3,
    "time" = 4,
    "currency" = 5
}
*/

/*

// usage
@achFileRecordField(11, 33, 2) 
//decorator function
function achFileRecordField(startPos:number, endPos: number, dataType: AchDataTypes) {
    return function( target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor)
        {
            //descriptor.value="this is value " + startPos + endPos + dataType;                
            descriptor.get = function() { return "GET Function" + startPos + endPos + dataType + propertyKey; };
    };
}
*/

//attribute fieldname, start point, end point, datatype 
//css framework bulma