import { AchFileParser } from "./achFileParser";
import { AchCEMs } from "./utils/achCEMs";
import { AchDataTypeUtil } from './utils/achDataTypesUtil';


export class EntryAddendaRecord {

    public constructor(addendaLine:string) {
        this._addendaLine = addendaLine;

        // no need to validate the text, as it is already done at file level
        //this.parseRawText();  //no need to call parserawtext, as there would not be any child level elements.. just the properties should be good enough to do the honors..
    }

    public get TypeCode() { return this.getAddendaField(1,3); } //02 02-03 2 N Addendum Type Code
    public get SequenceNumber() { return this.getAddendaField(87,94); } //6 88-94 7 Entry Detail Sequence Number
    public get addendaDetailInHtml() {
        let strHtml = "";
        
        const isTypeCodeValidInteger = /^-?\d+$/.test(this.TypeCode);


        if (!isTypeCodeValidInteger)
        {
            //for some reason the addenda record typecode is not an integer
            strHtml = `${this.TypeCode} - Invalid TypeCode entry`
            return strHtml;
        }

        let typeCodeNum = parseInt(this.TypeCode, 10);

        switch (typeCodeNum)
        {
            case 10: {  
                let transactionTypeCode = this.getAddendaField(3,6);
                let transactionTypeCodeDescription: string |undefined = "Not Available"
                if (AchCEMs.IATransactionTypeCodes.has(transactionTypeCode)) {
                    transactionTypeCodeDescription = AchCEMs.IATransactionTypeCodes.get(transactionTypeCode);
                }

                let foreignPaymentAmount = AchDataTypeUtil.toMoney(this.getAddendaField(6, 24));
                let receivingName = this.getAddendaField(46, 81);
                let foreignTraceNumber = this.getAddendaField(24, 46);

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Transaction Type Code </td> 
                        <td width=25%> <b> ${transactionTypeCode} - ${transactionTypeCodeDescription} </b> </td>  
                        <td width=25%> Foreign Payment Amount </td> 
                        <td style="text-align: right;"  width=25%> <b> ${foreignPaymentAmount} </b> </td> 
                    </tr>
                    <tr> 
                        <td> Receiving Name </td> 
                        <td> <b> ${receivingName} </b> </td>  
                        <td> Foreign Trace Number </td> 
                        <td> <b> ${foreignTraceNumber} </b> </td> 
                    </tr>  
                </table>`

                break;
            }

            case 11: {

                let originatorName = this.getAddendaField(3, 38);
                let originatorStreetAddress = this.getAddendaField(38, 73);

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Originator Name </td> 
                        <td width=25%> <b> ${originatorName} </b> </td>  
                        <td width=25%> Originator Street Address </td> 
                        <td width=25%> <b> ${originatorStreetAddress} </b> </td> 
                    </tr>
                </table>`


                break;
            }

            case 12: {

                let originatorCity = this.getAddendaField(3, 38);
                let originatorCountry = this.getAddendaField(38, 73);

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Originator City & State/Province </td> 
                        <td width=25%> <b> ${originatorCity} </b> </td>  
                        <td width=25%> Originator Country & Postal Code </td> 
                        <td width=25%> <b> ${originatorCountry} </b> </td> 
                    </tr>
                </table>`


                break;
            }

            case 13: {  
                let originatingDFIName = this.getAddendaField(3,38);
                let originatingDFIDQualifier = this.getAddendaField(38,40);
                let originatingDFIIdentification = this.getAddendaField(40,74);
                let originatingDFICountryCode = this.getAddendaField(74,77).trim();
                let originatingDFICountryCodeDescription: string |undefined = "Unrecognized country code"
                if (AchCEMs.isoCountryCodeNames.has(originatingDFICountryCode)) {
                    originatingDFICountryCodeDescription = AchCEMs.isoCountryCodeNames.get(originatingDFICountryCode);
                }

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Originating DFI Name </td> 
                        <td width=25%> <b> ${originatingDFIName} </b> </td>  
                        <td width=25%> Originating DFI ID Number Qualifier </td> 
                        <td width=25%> <b> ${originatingDFIDQualifier} </b> </td> 
                    </tr>
                    <tr> 
                        <td> Originating DFI ID </td> 
                        <td> <b> ${originatingDFIIdentification} </b> </td>  
                        <td> Originating DFI Branch Country Code </td> 
                        <td> <b>${originatingDFICountryCode} - ${originatingDFICountryCodeDescription}</b> </td> 
                    </tr>  
                </table>`

                break;
            }

            case 14: {  
                let receivingDFIName = this.getAddendaField(3,38);
                let receivingDFIDQualifier = this.getAddendaField(38,40);
                let receivingDFIIdentification = this.getAddendaField(40,74);
                let receivingDFICountryCode = this.getAddendaField(74,77).trim();
                let receivingDFICountryCodeDescription: string |undefined = "Unrecognized country code"
                if (AchCEMs.isoCountryCodeNames.has(receivingDFICountryCode)) {
                    receivingDFICountryCodeDescription = AchCEMs.isoCountryCodeNames.get(receivingDFICountryCode);
                }

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Receiving DFI Name </td> 
                        <td width=25%> <b> ${receivingDFIName} </b> </td>  
                        <td width=25%> Receiving DFI ID Number Qualifier </td> 
                        <td width=25%> <b> ${receivingDFIDQualifier} </b> </td> 
                    </tr>
                    <tr> 
                        <td> Receiving DFI ID </td> 
                        <td> <b> ${receivingDFIIdentification} </b> </td>  
                        <td> Receiving DFI Branch Country Code </td> 
                        <td> <b>${receivingDFICountryCode} - ${receivingDFICountryCodeDescription}</b> </td> 
                    </tr>  
                </table>`

                break;
            }

            case 15: {

                let receiverIdNumber = this.getAddendaField(3, 18);
                let receiverStreetAddress = this.getAddendaField(18, 53);

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Receiver ID Number </td> 
                        <td width=25%> <b> ${receiverIdNumber} </b> </td>  
                        <td width=25%> Receiver Street Address </td> 
                        <td width=25%> <b> ${receiverStreetAddress} </b> </td> 
                    </tr>
                </table>`


                break;
            }

            case 16: {

                let receiverCityState = this.getAddendaField(3, 38);
                let receiverCountryAndCode = this.getAddendaField(38, 73);

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Receiver City & State/Province </td> 
                        <td width=25%> <b> ${receiverCityState} </b> </td>  
                        <td width=25%> Receiver Country & Postal Code </td> 
                        <td width=25%> <b> ${receiverCountryAndCode} </b> </td> 
                    </tr>
                </table>`


                break;
            }
            case 17: 
            case 18: 
            {

                let paymentRelatedInformation = this.getAddendaField(3, 83);

                strHtml = `<table border width=100%> 
                    <tr> 
                        <td width=25%> Payment Related Information  </td> 
                        <td width=75%> <b> ${paymentRelatedInformation} </b> </td>  
                    </tr>
                </table>`
                break;
            }
            default: {

                break;
            }

     

        }

        

        return strHtml;
    }
 
  
    protected readonly _addendaLine: string;

    // protected parseRawText() {
        
    // }

    protected getAddendaField(startPos:number, endPos: number): string {
        return this._addendaLine.substring(startPos, endPos);
    }
      
}