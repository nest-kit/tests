#!/usr/bin/env node
'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const historyPath = path.resolve(__dirname, '../node_modules/.prisma')

const sourceTargetPath = path.resolve(
    __dirname,
    '../node_modules/@prisma/client/index.d.ts'
)
const sourceIndexTargetPath = path.resolve(
    __dirname,
    '../node_modules/@prisma/client/index.js'
)

if (fs.existsSync(historyPath)) {
    fs.rmSync(historyPath, { recursive: true })
}

if (fs.existsSync(sourceTargetPath)) {
    fs.rmSync(sourceTargetPath, { recursive: true })
}

if (fs.existsSync(sourceIndexTargetPath)) {
    fs.rmSync(sourceIndexTargetPath, { recursive: true })
}

fs.writeFileSync(sourceTargetPath, `export * from './generated'`)
fs.writeFileSync(
    sourceIndexTargetPath,
    `const prisma = require('./generated/index')

module.exports = prisma`
)

console.log('Success')
