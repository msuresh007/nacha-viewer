import * as fs from 'fs';
import * as path from 'path';

export function findTestFiles(): Promise<string[]> {
    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((resolve, reject) => {
        fs.readdir(testsRoot, (err, files) => {
            if (err) {
                return reject(err);
            }

            // Filter for test files that end with .test.js
            const testFiles = files.filter(file => file.endsWith('.test.js'));

            // Log found test files
            console.log('Found test files:', testFiles);
            resolve(testFiles);
        });
    });
}

// Usage example (uncomment the following lines to execute)
// findTestFiles()
//     .then(files => console.log(files))
//     .catch(err => console.error(err));
