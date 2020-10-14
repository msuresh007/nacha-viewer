"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NachaFileViewerProvider = void 0;
const vscode = require("vscode");
const achFileParser_1 = require("./achFileParser");
//import { getNonce } from './util';
class NachaFileViewerProvider {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const provider = new NachaFileViewerProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(NachaFileViewerProvider.viewType, provider);
        return providerRegistration;
    }
    resolveCustomTextEditor(document, webviewPanel, token) {
        return __awaiter(this, void 0, void 0, function* () {
            webviewPanel.webview.options = {
                enableScripts: true,
            };
            webviewPanel.webview.html = this.getHTMLForWebview(webviewPanel.webview, document);
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
        });
    }
    getHTMLForWebview(webview, document) {
        let retHTML = "";
        let date = new Date();
        //const rawAchFileText:string = document.getText();
        let achFileParserObj = new achFileParser_1.AchFileParser(document.getText());
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
exports.NachaFileViewerProvider = NachaFileViewerProvider;
NachaFileViewerProvider.viewType = 'nacha-viewer.achFile';
//# sourceMappingURL=achFileViewer.js.map