#!/usr/bin/env node
'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */
const tsMorph = require('ts-morph')
const db = require('@prisma/client')
const { lowerCase } = require('lodash')
const path = require('path')
const { Scope, VariableDeclarationKind } = require('ts-morph')

const app = new tsMorph.Project({
    tsConfigFilePath: './tsconfig.json',
})

const names = Object.keys(db.ModelName).map((item) => [
    item,
    lowerCase(item).split(' ').join('-'),
])

const basePath = '/src/modules/database/repository'
const projectPath = path.resolve(__dirname, '../')

const files = app
    .getSourceFiles()
    .map((item) => {
        return item.getDirectory().getPath().includes(basePath) &&
            item.getFilePath().includes('repository.ts')
            ? item
                  .getFilePath()
                  .replace(projectPath, '')
                  .replace(basePath + '/', '')
                  .replace('.repository.ts', '')
            : undefined
    })
    .filter(Boolean)

names
    .map(([name, fileName]) => {
        if (!files.includes(fileName)) {
            const fullFileName = fileName + '.repository.ts'
            const file = app.createSourceFile(
                path.join(projectPath, basePath, fullFileName)
            )
            file.addImportDeclaration({
                moduleSpecifier: '@nestjs/common',
                namedImports: ['Injectable'],
            })
            file.addImportDeclaration({
                moduleSpecifier: '../database.service',
                namedImports: ['DatabaseService'],
            })
            const fullName = `${name}Repository`
            const repositoryClass = file.addClass({
                name: fullName,
                isExported: true,
            })
            repositoryClass.addDecorator({
                name: 'Injectable',
                arguments: [undefined],
            })
            repositoryClass.addConstructor({
                parameters: [
                    {
                        name: 'db',
                        type: 'DatabaseService',
                        isReadonly: true,
                        scope: Scope.Private,
                    },
                ],
            })
            file.saveSync()
            return [fullName, fullFileName]
        }
        return undefined
    })
    .filter(Boolean)

let indexFile = app.getSourceFile(path.join(projectPath, basePath, 'index.ts'))

if (indexFile) {
    app.removeSourceFile(indexFile)
}

const dir = app.getDirectory(path.join(projectPath, basePath))

indexFile = app.createSourceFile(
    path.join(projectPath, basePath, 'index.ts'),
    '',
    { overwrite: true }
)

const allNames = dir
    .getSourceFiles()
    .sort((a, b) => a.getBaseName().length - b.getBaseName().length)
    .map((item) => {
        if (indexFile.getFilePath() !== item.getFilePath()) {
            const name = item.getClasses()[0].getName()
            indexFile.addImportDeclaration({
                moduleSpecifier:
                    indexFile.getRelativePathAsModuleSpecifierTo(item),
                namedImports: [name],
            })
            return name
        }
        return undefined
    })
    .filter(Boolean)

indexFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
        {
            name: 'REPOSITORIES',
            initializer: `[${allNames.join(', ')}]`,
        },
    ],
})

indexFile.saveSync()

app.saveSync()
