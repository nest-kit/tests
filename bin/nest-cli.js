#!/usr/bin/env node
'use strict'

/* eslint-disable @typescript-eslint/no-var-requires */
const supportList =
    require('@nestjs/cli/lib/schematics/nest.collection').NestCollection.getSchematics()

const Table = require('cli-table3')
const { Command } = require('commander')
const chalk = require('chalk')

const bootstrap = () => {
    const program = new Command()
    program
        .version('0.1.0')
        .argument('name', '名称')
        .argument('[path]', '路径', undefined)
        .option('-s, --schematics <value...>', 'mo s co', [])
        .option(
            '-d, --dry-run',
            'Report actions that would be taken without writing out results.'
        )
        .option(
            '-p, --project [project]',
            'Project in which to generate files.'
        )
        .option(
            '--flat',
            'Enforce flat structure of generated element.',
            () => true
        )
        .option(
            '--no-flat',
            'Enforce that directories are generated.',
            () => false
        )
        .option(
            '--spec',
            'Enforce spec files generation.',
            () => {
                return { value: true, passedAsInput: true }
            },
            true
        )
        .option('--skip-import', 'Skip importing', () => true, false)
        .option('--no-spec', 'Disable spec files generation.', () => {
            return { value: false, passedAsInput: true }
        })
        .option(
            '-c, --collection [collectionName]',
            'Schematics collection to use.'
        )
        .action((name, path, _options) => {
            const schematics = [..._options.schematics]
            const fullSubSchematics = supportList
                .map((item) => {
                    return schematics.includes(item.alias) ||
                        schematics.includes(item.name)
                        ? item
                        : undefined
                })
                .filter(Boolean)

            const sortArr = ['application', 'app', 'lib', 'mo']
            sortArr.reverse().forEach((item) => {
                if (fullSubSchematics.find((i) => i.alias === item)) {
                    // set the first one
                    fullSubSchematics.unshift(
                        fullSubSchematics.splice(
                            fullSubSchematics.findIndex(
                                (i) => i.alias === item
                            ),
                            1
                        )[0]
                    )
                }
            })

            const leftMargin = ''
            const tableConfig = {
                head: ['name', 'alias', 'description'],
                chars: {
                    left: leftMargin.concat('│'),
                    'top-left': leftMargin.concat('┌'),
                    'bottom-left': leftMargin.concat('└'),
                    mid: '',
                    'left-mid': '',
                    'mid-mid': '',
                    'right-mid': '',
                },
            }

            const table = new Table(tableConfig)
            fullSubSchematics.forEach((item) => {
                table.push([
                    chalk.green(item.name),
                    chalk.cyan(item.alias),
                    item.description,
                ])
            })

            const options = []
            options.push({ name: 'dry-run', value: !!_options.dryRun })
            if (_options.flat !== undefined) {
                options.push({ name: 'flat', value: _options.flat })
            }
            options.push({
                name: 'spec',
                value:
                    typeof _options.spec === 'boolean'
                        ? _options.spec
                        : _options.spec.value,
                options: {
                    passedAsInput:
                        typeof _options.spec === 'boolean'
                            ? false
                            : _options.spec.passedAsInput,
                },
            })
            options.push({
                name: 'collection',
                value: _options.collection,
            })
            options.push({
                name: 'project',
                value: _options.project,
            })
            options.push({
                name: 'skipImport',
                value: _options.skipImport,
                options: {
                    keepInputNameFormat: true,
                },
            })
            const inputs = []

            inputs.push({
                name: 'path',
                value: path,
            })

            Promise.all(
                fullSubSchematics.map((item) => {
                    const realInputs = [
                        ...inputs,
                        { name: 'name', value: name },
                        { name: 'schematic', value: item.name },
                    ]

                    const GenerateAction =
                        require('@nestjs/cli/actions/generate.action').GenerateAction
                    const generateCommand = new GenerateAction()
                    return generateCommand.handle(realInputs, options)
                })
            )
        })

    program.parse()
}
bootstrap()
