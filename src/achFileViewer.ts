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
            <H1> This is a test2 ${date} </H1>
            <PRE>webview.cspSource BEGIN
             ${webview.cspSource}
             END </PRE>
             <h3> ACH File Contents: </h3>
             <HR/>
             <PRE>${achFileParserObj.achFileRawText}</PRE>
             <HR/>
             end of the file
        </BODY>
        </HTML>`;

        return retHTML;
    }

    
    }   
