# Change Log

### 3.0.2
- **Fix in computation when Padded lines are present**: Fixed the computation logic to ignore padded lines, while computing debits and credits.


### 3.0.1
- **Padded Lines Support**: The NachaViewer extension now supports handling padded lines, which are used to ensure ACH files conform to fixed-length record formats by padding lines to meet the required file length.

### 2.0.0
- **Added IAT File Support**: The NachaViewer extension now includes support for viewing and interpreting IAT (International ACH Transaction) files, enhancing compatibility with a broader range of ACH file types.
  
- **Addenda Records Parsing**: Added parsing and display functionality for IAT addenda records, providing users with more detailed transaction information directly in the viewer.

- **Improved User Interface**: Minor adjustments to improve the readability of new file types and record formats.

- **Bug Fixes and Stability Improvements**: Addressed minor bugs to enhance overall performance and stability.


### 1.2.0
- Added SEC code descriptions related to international transactions, acknowledgments, and specialized payment types to enhance coverage and support for various ACH entry classifications.

### 1.1.0

 - Updated to support carriage return character, in addition to new line character
 ## 1.0.0

 - Initial release of ACH File Viewer. 
 - Support for viewing batch records, amounts and associated details