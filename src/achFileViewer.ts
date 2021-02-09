import * as path from 'path';
import * as vscode from 'vscode';
import { AchFileParser } from './achFileParser';
//import { getNonce } from './util';

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
                            // webviewPanel.webview.postMessage({
                            //     type: 'update',
                            //     text: document.getText(),
                            // });
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
        let date: Date = new Date();  
        //const rawAchFileText:string = document.getText();
        let achFileParserObj = new AchFileParser(document.getText());
        
        retHTML = `
        <HTML>
        <BODY>
            <table border=1 width=100%>
            <tr> <td>
            ${this.getTableFileHeaderControlDetails(achFileParserObj)}
            </td> </tr>`;

            retHTML+= `<tr> <td>Total Number of Record Blocks: &nbsp;&nbsp; <b> ${achFileParserObj.recordBlocks.length} </b> </td> </tr>`;

            retHTML+=`<tr>`;

            achFileParserObj.recordBlocks.forEach(element => {
                retHTML+= `<table border width=100%> 
                <tr><td> <font size=+1> Batch Number  </font></td> <td> <font size=+1> ${element.headerBatchNumber} </font> </td> 
                <td> Company Name </td> <td> <b> ${element.companyName} </b> </td> 
                <td> Company Identification </td> <td> <b> ${element.headerCompanyIdentification} </b> </td>
                </tr> </table>`;
            });

            retHTML+=`</tr>`;

            retHTML+=`
            </table>
             <h3> ACH File Contents: </h3>
             <HR/>
             <PRE>${achFileParserObj.achFileRawText}</PRE>
             <HR/>
             Contents in file are valid: ${achFileParserObj.isFileValid} <br/>
             Error Info: ${achFileParserObj.errorInfo} <br/>
             <PRE> Immediate Destination: |${achFileParserObj.immediateDestination}|</PRE> </br/>
             <PRE> Immediate Origin: |${achFileParserObj.immediateOrigin}|</PRE> </br/>
             <PRE> immediateDestinationName: |${achFileParserObj.immediateDestinationName}|</PRE> </br/>
             <PRE> immediateOriginName: |${achFileParserObj.immediateOriginName}|</PRE> </br/>
             <PRE> totalDebitAmountsInFile: |${achFileParserObj.totalDebitAmountsInFile}|</PRE> </br/>
             <PRE> totalCreditAmountsInFile: |${achFileParserObj.totalCreditAmountsInFile}|</PRE> </br/>

             end of the file
        </BODY>
        </HTML>`;

        return retHTML;
    }

    private getTableFileHeaderControlDetails(achFileParser:AchFileParser): string
    {
        let retFileControlTable:string = "";
        retFileControlTable = `<table width=100% border><tr>`;
        retFileControlTable+=`<td>Immediate Destination</td><td><b>${achFileParser.immediateDestination}</b></td>`;
        retFileControlTable+=`<td>Immediate Origin</td><td><b>${achFileParser.immediateOrigin}</b></td>`;
        retFileControlTable+=`</tr><tr>`;
        retFileControlTable+=`<td>Immediate Destination Name</td><td><b>${achFileParser.immediateDestinationName}</b></td>`;
        retFileControlTable+=`<td>Immediate Origin Name</td><td><b>${achFileParser.immediateOriginName}</b></td>`;
        retFileControlTable+=`</tr><tr>`;
        retFileControlTable+=`<td>File Creation Date</td><td><b>${achFileParser.fileCreationDate}</b></td>`;
        retFileControlTable+=`<td>File Creation Time</td><td><b>${achFileParser.fileCreationTime}</b></td>`;
        retFileControlTable+=`</tr><tr>`;
        retFileControlTable+=`<td>Total Number of Batch Blocks</td><td><b>${achFileParser.batchCount}</b></td>`;
        retFileControlTable+=`<td>Total Number of Addenda Records Count</td><td><b>${achFileParser.entryAddendaCount}</b></td>`;
        retFileControlTable+=`</tr><tr>`;
        retFileControlTable+=`<td>Total Debit Entry Amount</td><td align=right><font size=+1><b>${achFileParser.totalDebitAmountsInFile}</b></font></td>`;
        retFileControlTable+=`<td>Total Credit Entry Amount</td><td align=right><font size=+1><b>${achFileParser.totalCreditAmountsInFile}</b></font></td>`;
        retFileControlTable+= `</tr><table>`;
        return retFileControlTable;
    }

    
    }   
