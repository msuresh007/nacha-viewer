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

    
    }   
