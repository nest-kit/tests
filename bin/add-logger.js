#!/usr/bin/env node
'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */
const tsMorph = require('ts-morph')

const app = new tsMorph.Project({
    tsConfigFilePath: './tsconfig.json',
})

app.getSourceFiles().forEach((sourceFile) => {
    if (sourceFile.getClasses().length === 0) {
        return
    }

    let hasImport = false
    sourceFile.getImportDeclarations().forEach((importItem) => {
        if (importItem.getModuleSpecifierValue() === '@nestjs/common') {
            hasImport = true
            let hasImportLogger = false
            importItem.getNamedImports().forEach((namedImport) => {
                if (namedImport.getName() === 'Logger') {
                    hasImportLogger = true
                }
            })

            if (!hasImportLogger) {
                importItem.addNamedImport('Logger')
            } else {
                importItem.setOrder(0)
            }
        }
    })

    if (!hasImport) {
        sourceFile
            .addImportDeclaration({
                namedImports: ['Logger'],
                moduleSpecifier: '@nestjs/common',
            })
            .setOrder(0)
    }

    sourceFile.getClasses().forEach((classItem) => {
        let hasStaticLogger = false
        classItem.getStaticProperties().forEach((staticProperty) => {
            if (staticProperty.getName() === 'logger') {
                hasStaticLogger = true
                staticProperty.setOrder(0)
            }
        })
        if (!hasStaticLogger) {
            classItem
                .addProperty({
                    name: 'logger',
                    initializer: `new Logger(${classItem.getName()}.name)`,
                    isStatic: true,
                    isReadonly: true,
                })
                .setOrder(0)
        }
    })
})

app.saveSync()
