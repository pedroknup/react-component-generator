import * as path from 'path';
import * as fs from 'fs';

import { InputBoxOptions } from 'vscode';
import { IDisposable } from './disposable.interface';
import { ComponentExistsError } from './errors/component-exists.error';
import { VSCodeWindow } from './vscode.interfaces';
import { generateComponentFile, generateTestFile, generateStoryBookDocumentationFile } from './generate-files';

export class ComponentGenerator implements IDisposable {
         private readonly defaultPath = 'src/modules';

         constructor(private workspaceRoot: string, private window: VSCodeWindow) {}

         async execute(): Promise<void> {
           let path: string | undefined = await this.prompPath();
           const componentName: string | undefined = await this.promptName();
           const fileName: string | undefined = await this.promptFileName();

           if (!componentName || !fileName) {
             return;
           }
           if (typeof path == 'undefined') {
             path = '';
           }
           path = 'src/shared/' + (path === '' ? 'modules' : path)
           const absoluteComponentPath: string = this.toAbsolutePath(path);

           try {
             this.create(absoluteComponentPath, fileName, componentName);
             this.window.showInformationMessage(`Component '${componentName}' successfully created`);
           } catch (err) {
             // log?
             if (err instanceof ComponentExistsError) {
               this.window.showErrorMessage(`Component '${componentName}' already exists`);
             } else {
               this.window.showErrorMessage(`Error: ${err.message}`);
             }
           }
         }

         async promptName(): Promise<string | undefined> {
           const options: InputBoxOptions = {
             ignoreFocusOut: true,
             prompt: `Component name (CamelCase): `,
             placeHolder: 'ComponentName',
             validateInput: this.validate
           };

           return await this.window.showInputBox(options);
         }
         async promptFileName(): Promise<string | undefined> {
           const options: InputBoxOptions = {
             ignoreFocusOut: true,
             prompt: `File name (with-dash): `,
             placeHolder: 'component-name',
             validateInput: this.validate
           };

           return await this.window.showInputBox(options);
         }
         async prompPath(): Promise<string | undefined> {
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
             throw new ComponentExistsError(`'${component}' already exists`);
           }

           try {
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
         }
         validateFolder(name: string): string | null {
           if (name.includes(' ')) {
             return 'Spaces are not allowed';
           }
           return null;
         }

         toAbsolutePath(nameOrRelativePath: string): string {
           if (/\/|\\/.test(nameOrRelativePath)) {
             return path.resolve(this.workspaceRoot, nameOrRelativePath);
           }
             return path.resolve(this.workspaceRoot, this.defaultPath, nameOrRelativePath);
         }

         dispose(): void {
         }
       }
