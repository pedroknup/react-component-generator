import * as path from 'path';
import * as fs from 'fs';

import { InputBoxOptions } from 'vscode';
import { IDisposable } from './disposable.interface';
import { DuckExistError } from './errors/duck-exist.error';
import { VSCodeWindow } from './vscode.interfaces';
import { generateComponentFile, generateTestFile, generateStoryBookDocumentationFile } from './generate-files';
import { type } from 'os';

export class DuckGenerator implements IDisposable {
         private readonly extension = '.js';
         private readonly duckFiles = [
           '.component.ts',
           '.component-module.scss',
           '.stories.tsx',
           '.component.spec.tsx',
           'index'
         ];
         private readonly defaultPath = 'src/modules';

         constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

         async execute(): Promise<void> {
           // prompt for the name of the duck, or the path to create the duck in
           let path: string | undefined = await this.prompPath();
           const componentName: string | undefined = await this.prompt();
           const fileName: string | undefined = await this.promptFileName();

           if (!componentName || !fileName) {
             return;
           }
           if (typeof path == 'undefined') {
             path = '';
           }
           path = 'src/shared/' + (path == '' ? 'modules' : path)
           const absoluteComponentPath: string = this.toAbsolutePath(path);

           try {
             this.create(absoluteComponentPath, fileName, componentName);

             this.window.showInformationMessage(`Component '${componentName}' successfully created`);
           } catch (err) {
             // log?
             if (err instanceof DuckExistError) {
               this.window.showErrorMessage(`Component '${componentName}' already exists`);
             } else {
               this.window.showErrorMessage(`Error: ${err.message}`);
             }
           }
         }

         async prompt(): Promise<string | undefined> {
           // this can be abstracted out as an argument for prompt
           const options: InputBoxOptions = {
             ignoreFocusOut: true,
             prompt: `Component name (CamelCase): `,
             placeHolder: 'ComponentName',
             validateInput: this.validate
           };

           return await this.window.showInputBox(options);
         }
         async promptFileName(): Promise<string | undefined> {
           // this can be abstracted out as an argument for prompt
           const options: InputBoxOptions = {
             ignoreFocusOut: true,
             prompt: `File name (with-dash): `,
             placeHolder: 'component-name',
             validateInput: this.validate
           };

           return await this.window.showInputBox(options);
         }
         async prompPath(): Promise<string | undefined> {
           // this can be abstracted out as an argument for prompt
           const options: InputBoxOptions = {
             ignoreFocusOut: true,
             prompt: `Component folder (default: modules):`,
             placeHolder: 'modules',
             validateInput: this.validateFolder
           };

           return await this.window.showInputBox(options);
         }

         create(absoluteComponentPath: string, componentFileName?: string, componentName?: string) {
           const finalPath = `${absoluteComponentPath}/${componentFileName}/`;
           if (fs.existsSync(finalPath)) {
             const component: string = path.basename(finalPath);

             throw new DuckExistError(`'${component}' already exists`);
           }

           try {
             // create the directory
             fs.mkdirSync(finalPath);

             let filename = `${componentFileName}.component.tsx`;
             let fullpath = path.join(finalPath, filename);
             fs.writeFileSync(fullpath, generateComponentFile(componentFileName, componentName));

             filename = `${componentFileName}-component.module.scss`;
             fullpath = path.join(finalPath, filename);
             fs.writeFileSync(fullpath, `.${componentFileName}{}`);

             filename = `${componentFileName}.component.spec.tsx`;
             fullpath = path.join(finalPath, filename);
             fs.writeFileSync(fullpath, generateTestFile(componentFileName, componentName));

             filename = `${componentFileName}.stories.tsx`;
             fullpath = path.join(finalPath, filename);
             fs.writeFileSync(fullpath, generateStoryBookDocumentationFile(componentFileName, componentName));
             
             filename = `index.ts`;
             fullpath = path.join(finalPath, filename);
             fs.writeFileSync(fullpath,`export * from './${componentFileName}.component'`);
           } catch (err) {
             // log other than console?
             console.log('Error', err.message);

             throw err;
           }
         }

         validate(name: string): string | null {
           if (!name) {
             return 'Field is required';
           }

           if (name.includes(' ')) {
             return 'Spaces are not allowed';
           }
           return null;

           // no errors
         }
         validateFolder(name: string): string | null {
           if (name.includes(' ')) {
             return 'Spaces are not allowed';
           }
           return null;

           // no errors
         }

         toAbsolutePath(nameOrRelativePath: string): string {
           // simple test for slashes in string
           if (/\/|\\/.test(nameOrRelativePath)) {
             return path.resolve(this.workspaceRoot, nameOrRelativePath);
           }
           // if it's just the name of the duck, assume that it'll be in 'src/state/ducks/'
           return path.resolve(this.workspaceRoot, this.defaultPath, nameOrRelativePath);
         }

         dispose(): void {
           console.log('disposing...');
         }
       }
