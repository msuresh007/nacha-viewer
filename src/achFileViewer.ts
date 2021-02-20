import * as path from 'path';
import * as vscode from 'vscode';
import { AchFileParser } from './achFileParser';
import { RecordBlocksArray } from './achRecordBlocksArray';

export class NachaFileViewerProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable { 
		const provider = new NachaFileViewerProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(NachaFileViewerProvider.viewType, provider);
		return providerRegistration;
    }
	private static readonly viewType = 'nacha-viewer.achFile';
    
	constructor(
		private readonly context: vscode.ExtensionContext
	) { }


    public async resolveCustomTextEditor(
        document: vscode.TextDocument, 
        webviewPanel: vscode.WebviewPanel, 
        token: vscode.CancellationToken
        ) : Promise<void> {
            webviewPanel.webview.options = {
                enableScripts:true,
                        };
                        webviewPanel.webview.html=this.getHTMLForWebview(webviewPanel.webview, document);
  
                        function updateWebview() {
                            webviewPanel.webview.postMessage({
                                type: 'update',
                                text: document.getText(),
                            });
                        }

                            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
                                if (e.document.uri.toString() === document.uri.toString()) {
                                    updateWebview();
                                }
                            });
                    
                            // Make sure we get rid of the listener when our editor is closed.
                            webviewPanel.onDidDispose(() => {
                                changeDocumentSubscription.dispose();
                            });
                    
                    


                            updateWebview();                            

                                                
}

    private getHTMLForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        let retHTML:string = "";
        //let date: Date = new Date();  
        //const rawAchFileText:string = document.getText();
        
        let achFileParserObj = new AchFileParser(document.getText());


        
        retHTML = `
        <HTML>
        <BODY>
            <table border=1 width=100%>
            <tr> <td>
            ${this.getTableFileHeaderControlDetails(achFileParserObj)}
            </td> </tr>`;

//            retHTML+= `<tr> <td>Total Number of Record Blocks: &nbsp;&nbsp; <b>${achFileParserObj.recordBlocks.length}</b> </td> </tr>`;

            retHTML+=`<tr>`;

            achFileParserObj.recordBlocks.forEach(element => {
                retHTML+= this.getRecordBlockDetailsTable(element);
            });

            retHTML+=`</tr>`;

            retHTML+=`
            </table>
            <br /> <br />
            <font size=+1> File Path: &nbsp;&nbsp; ${document.fileName} </font>
             <h2> ACH File as-is: </h2>
             <PRE style="color:aquamarine; padding-left: 50px;">${achFileParserObj.achFileRawText}</PRE>
             <HR/>
             <div style="text-align:right; width: 100%;font-style: italic;">
             ACH File Viewer 1.0.0 &nbsp;&nbsp;
             </div>
             <br />
        </BODY>
        </HTML>`;

        return retHTML;
    }

    private getTableFileHeaderControlDetails(achFileParser:AchFileParser): string
    {
        let strFileValidityStatus:string = achFileParser.isFileValid ? "Good": "Invalid - " + achFileParser.errorInfo;
        let fileValidityTdColor:string = achFileParser.isFileValid ? "green": "red";

        let retFileControlTable:string = `
        <table width=100% border>
        <tr>
            <td> File ID Modifier </td><td> <b>${achFileParser.fileIDModifier}</b> </td> 
            <td> File Validity Status </td><td align=center style="background-color:${fileValidityTdColor};"> ${strFileValidityStatus} </td>
        </tr>
        <tr>
            <td>Immediate Destination</td><td><b>${achFileParser.immediateDestination}</b></td>
            <td>Immediate Origin</td><td><b>${achFileParser.immediateOrigin}</b></td>
        </tr>
        <tr>
            <td>Immediate Destination Name</td><td><b>${achFileParser.immediateDestinationName}</b></td>
            <td>Immediate Origin Name</td><td><b>${achFileParser.immediateOriginName}</b></td>
        </tr>
        <tr>
            <td>File Creation Date</td><td><b>${achFileParser.fileCreationDate}</b></td>
            <td>File Creation Time</td><td><b>${achFileParser.fileCreationTime}</b></td>
        </tr>
        <tr>
            <td>Total Number of Batch Blocks</td><td align=right><b>${achFileParser.batchCount}</b></td>
            <td>Total Number of Entry &amp; Addenda Records</td><td align=right><b>${achFileParser.entryAddendaCount}</b></td>
        </tr>
        <tr>
            <td>Total Debit Entry Amount</td><td align=right><font size=+1><b>${achFileParser.totalDebitAmountsInFile}</b></font></td>
            <td>Total Credit Entry Amount</td><td align=right><font size=+1><b>${achFileParser.totalCreditAmountsInFile}</b></font></td>
        </tr>
        <table>`;

        return retFileControlTable;
    }

    private getRecordBlockDetailsTable(recordBlock:RecordBlocksArray): string
    {
        
        //<tr> <td colspan=6  style="background-color:peru; height:3px; bdackground-image: linear-gradient(to right, peru, #000000);">   </td> </tr>
        let retRecordBlockTable:string = `<table border=1 width=100% > 
        <tr>
            <td rowspan=3> <font size=+1> Batch Number  </font></td> <td rowspan=3 align=center> <font size=+2> ${recordBlock.headerBatchNumber} </font> </td> 
            <td>Total Debit Entry Amount</td><td align=right><font size=+1><b>${recordBlock.totalDebitEntry}</b></font></td>
            <td>Total Credit Entry Amount</td><td align=right><font size=+1><b>${recordBlock.totalCreditEntry}</b></font></td>
        </tr> 
        <tr>
            <td> Company Descriptive Date </td> <td> <b> ${recordBlock.companyDescriptiveDate} </b> </td> 
            <td> Effective Entry Date </td> <td> <b> ${recordBlock.effectiveEntryDate} </b> </td> 
        </tr>
        <tr>
            <td> Entry 	&amp; Addenda Records Count </td> <td align=right> <b> ${recordBlock.entryAddendaCount} </b> </td> 
            <td> Service Class Code </td> <td> <b> ${recordBlock.headerServiceClassCode} </b> </td> 
        <tr>

            <td> Company Name </td> <td> <b> ${recordBlock.companyName} </b> </td> 
            <td> Company Identification </td> <td> <b> ${recordBlock.headerCompanyIdentification} </b> </td>
            <td> Standard Entry Class </td> <td> <b> ${recordBlock.standardEntryClassCode} </b> </td> 
        </tr> 
        <tr>
            <td> Company Entry Description </td> <td> <b> ${recordBlock.companyEntryDescrption} </b> </td> 
            <td> Originator Status Code </td> <td> <b> ${recordBlock.originatorStatusCode} </b> </td> 
            <td> Originating DFI Indentification </td> <td> <b> ${recordBlock.headerOriginatingDFIIdentification} </b> </td> 
        </tr>

        <tr>
            <td colspan=6>
                ${this.getDetailRecordsTable(recordBlock)}
            </td>
        </tr>
        </table>`  ;      
//        <tr> <td colspan=6  style="background-color:saddlebrown; height:1px; bacskground-image: linear-gradient(to right, mediumturquoise, #000000);">   </td> </tr>

        return retRecordBlockTable;
    }

    private getDetailRecordsTable(recordBlock:RecordBlocksArray): string
    {
        let retDetailRecordTable:string = `
            <table border=1 width=100%> 
                <tr style="background-color:#333333;">
                    <td><b>Trace Number</b></td>
                    <td><b>Transaction Code</b></td>
                    <td><b>Receiving DFI Identification</b></td>
                    <td><b>Receiving Individual/Company Name</b></td>
                    <td><b>DFI Account Number</b></td>
                    <td><b>Identification Number</b></td>
                    <td align=middle><b>Check Digit</b></td>
                    <td align=right><b>Amount</b></td>
                </tr>`;

            recordBlock.entryDetailRecords.forEach(entryDetail => {
                retDetailRecordTable+=`
                <tr>
                    <td>${entryDetail.traceNumber}</td>
                    <td>${entryDetail.transactionCode}</td>
                    <td>${entryDetail.receivingDFIIdentification}</td>
                    <td>${entryDetail.individualName}</td>
                    <td>${entryDetail.dfiAccountNumber}</td>
                    <td>${entryDetail.identificationNumber}</td>
                    <td align=middle>${entryDetail.checkDigit}</td>
                    <td align=right>${entryDetail.amount}</td>
                    </tr>
                `;

            });

            retDetailRecordTable+=`</table>`;

            //recordBlock.entryDetailRecords[0].

        return retDetailRecordTable;
    }
    
    }   
