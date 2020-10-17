import { ArrayUtil } from './arrayUtil';

export class AchFileParser {


    public readonly achFileRawText:string;

    public constructor(rawText:string)   {
        this.achFileRawText = rawText;
        this._indLines = this.achFileRawText.split('\n');
        
        if (this.validateTheRawText()) {
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

            if ((ArrayUtil.isFirstElement(i, this._indLines.length)) && (firstChar!==RecordType.fileHeader)) {
                //first line is not a file header record
                this._isFileContentValid=false;
                this._errorInfo=`First line is not a file header record.`;
                return false;
            }

            if ((ArrayUtil.isLastElement(i, this._indLines.length)) && (firstChar!==RecordType.fileControl)) {
                //last line is not a file control record
                this._isFileContentValid=false;
                this._errorInfo=`Last line is not a file Control record.`;
                return false;
            }

            if ((ArrayUtil.isOneOfTheMiddleElements(i, this._indLines.length)) 
                    && ((firstChar===RecordType.fileHeader) || (firstChar===RecordType.fileControl))) {
                //file header and/or file control file is repeated
                this._isFileContentValid=false;
                this._errorInfo=`File Header Record Type or File Control Record type is repeated in the file at line number ${i+1}`;
                return false;
            }

            //checking rules for batch header
            if (firstChar===RecordType.batchHeader) {
                //make sure this is immediately after fileHeader of batchControl Record
                if (ArrayUtil.isFirstElement(i, this._indLines.length)) {
                    //batch header cannot be first line
                    this._isFileContentValid=false;
                    this._errorInfo=`Batch Header cannot be the first line of file`;
                    return false;
                }

                let prevChar = this._indLines[i-1][0];

                if ((prevChar!==RecordType.fileHeader) && (prevChar!==RecordType.batchControl)) {
                    this._isFileContentValid=false;
                    this._errorInfo=`The line ${i+1} is of type Record Header. And previous line ${i} is not file Header or Batch Control type`;
                    return false;
                }
            }   // end of checking rules for batch header 

            //checking rules for batch control type
            if (firstChar === RecordType.batchControl) {
                
                let foundParingRecordHeader:boolean = false;

                //go up and see if there is a pairing batch header type record
                for (var j=i-1; j>0; --j) { //no need to go till fist element so, j>0
                    let prevChar = this._indLines[j][0];

                    if (prevChar === RecordType.batchHeader) {  //found correct header
                        foundParingRecordHeader = true;
                        break;
                    }

                    if ((prevChar === RecordType.entryDetail) || (prevChar === RecordType.entryDetailAddenda)) {
                        continue;
                    }

                    if ((prevChar === RecordType.batchControl) ||
                        (prevChar === RecordType.fileControl) ||
                        (prevChar === RecordType.fileHeader)) {   // red flag 
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

    protected parseRawText()
    {

    }
}

enum RecordType {
    fileHeader          = "1",
    batchHeader         = "5",
    entryDetail         = "6",
    entryDetailAddenda  = "7",
    batchControl        = "8",
    fileControl         = "9"
}

