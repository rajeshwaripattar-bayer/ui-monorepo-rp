import _ from 'lodash'
import message from '@commitlint/message'
import * as ensure from '@commitlint/ensure'
import { RuleConfigSeverity } from 'cz-git'

const COUNTRY_ENUM = ['us','au']
const TYPES = [
  { value: 'feat', name: 'feat:     ✨  A new feature', emoji: ':sparkles:' },
  { value: 'fix', name: 'fix:      🐛  A bug fix', emoji: ':bug:' },
  { value: 'docs', name: 'docs:     📝  Documentation only changes', emoji: ':memo:' },
  { value: 'style', name: 'style:    💄  Changes that do not affect the meaning of the code', emoji: ':lipstick:' },
  {
    value: 'refactor',
    name: 'refactor: ♻️   A code change that neither fixes a bug nor adds a feature',
    emoji: ':recycle:'
  },
  { value: 'perf', name: 'perf:     ⚡️  A code change that improves performance', emoji: ':zap:' },
  {
    value: 'test',
    name: 'test:     ✅  Adding missing tests or correcting existing tests',
    emoji: ':white_check_mark:'
  },
  {
    value: 'build',
    name: 'build:    📦️   Changes that affect the build system or external dependencies',
    emoji: ':package:'
  },
  { value: 'ci', name: 'ci:       🎡  Changes to our CI configuration files and scripts', emoji: ':ferris_wheel:' },
  { value: 'chore', name: "chore:    🔨  Other changes that don't modify src or test files", emoji: ':hammer:' },
  { value: 'revert', name: 'revert:   ⏪️  Reverts a previous commit', emoji: ':rewind:' }
]
const TYPE_ENUM = TYPES.map((t) => t.value)

/** @type {import('cz-git').UserConfig} */
const config = {
  defaultIgnores: true,
  formatter: '@commitlint/format',
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes']
}

config.parserPreset = {
  name: 'conventional-changelog-conventionalcommits',
  path: './node_modules/conventional-changelog-conventionalcommits/index.js',
  parserOpts: {
    issuePrefixes: ['#'],
    breakingHeaderPattern: /^(\w+)\/(\w+)\/(\d+)(?:\((.*)\))?!?: (.*)$/,
    headerCorrespondence: ['country', 'type', 'task', 'scope', 'subject'],
    headerPattern: /^(\w+)\/(\w+)\/(\d+)(?:\((.*)\))?!?: (.*)$/,
    noteKeywords: ['BREAKING CHANGE', 'BREAKING-CHANGE'],
    revertCorrespondence: ['header', 'hash'],
    revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i
  }
}

config.rules = {
  task: [RuleConfigSeverity.Error, `always`],
  country: [RuleConfigSeverity.Error, `always`],
  'type-enum': [RuleConfigSeverity.Error, `always`, TYPE_ENUM]
}

config.plugins = [
  {
    rules: {
      task: ({ task }) => [_.isNumber(Number(task)), 'task must be a non-empty number'],
      country: ({ country }) => {
        const result = ensure.enum(country?.toString() ?? '', COUNTRY_ENUM)
        return [result, message([`country must`, `be one of [${COUNTRY_ENUM.join(', ')}]`])]
      }
    }
  }
]

////////////////////////////////////////////////////////
// Enable this once we setup our own commitizen adapter
////////////////////////////////////////////////////////

// import { execSync } from 'child_process'
// const gitStatus = execSync('git status --porcelain || true').toString().trim().split('\n')
// const scopeComplete = gitStatus
//   .find((r) => ~r.indexOf('M  src'))
//   ?.replace(/(\/)/g, '%%')
//   ?.match(/src%%((\w|-)*)/)?.[1]
// const subjectComplete = gitStatus
//   .find((r) => ~r.indexOf('M  packages/components'))
//   ?.replace(/\//g, '%%')
//   ?.match(/packages%%components%%((\w|-)*)/)?.[1]

// // @tip: git branch name = 12345-this-is-issue   =>    auto get defaultIssues = #12345
// const issue = execSync('git rev-parse --abbrev-ref HEAD').toString().trim().split('-')[0]
// let hasIssue = issue
// if (issue.match(/0+/g)?.length > 2) {
//   hasIssue = false
// }

// config.prompt = {
//   types: TYPES,

//   alias: {
//     b: 'chore: bump dependencies',
//     c: 'chore: update config files',
//     f: 'docs: fix typos',
//     ':': 'docs: update README'
//   },

//   messages: {
//     type: "Select the type of change that you're committing:",
//     scope: 'Denote the SCOPE of this change (optional):',
//     customScope: 'Denote the SCOPE of this change:',
//     subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
//     body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
//     breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
//     footerPrefixesSelect: 'Select the ISSUES type of changeList by this change (optional):',
//     customFooterPrefix: 'Input ISSUES prefix:',
//     footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
//     generatingByAI: 'Generating your AI commit subject...',
//     generatedSelectByAI: 'Select suitable subject by AI generated:',
//     confirmCommit: 'Are you sure you want to proceed with the commit above?'
//   },

//   allowBreakingChanges: ['feat', 'fix'],
//   allowCustomIssuePrefix: false,
//   allowEmptyIssuePrefix: false,
//   allowEmptyScopes: true,
//   allowCustomScopes: false,

//   defaultBody: '',
//   defaultScope: scopeComplete,
//   defaultFooterPrefix: '',
//   defaultIssues: !hasIssue ? '' : `#${issue}`,
//   defaultSubject: subjectComplete && `[${subjectComplete}] `,

//   customScopesAlign: !scopeComplete ? 'top-bottom' : 'bottom',
//   customIssuePrefixAlias: '___CUSTOM___',
//   customIssuePrefixAlign: !hasIssue ? 'top' : 'bottom',
//   customScopesAlias: '___CUSTOM___',

//   enableMultipleScopes: true,
//   scopeEnumSeparator: ',',

//   useAI: false,
//   useEmoji: true,
//   emojiAlign: 'center',
//   themeColorCode: '38;5;075',
//   confirmColorize: true,
//   emptyIssuePrefixAlias: '<skip>',
//   emptyScopesAlias: '<skip>',
//   issuePrefixes: [
//     { value: 'link', name: 'link:     Work in processing to ISSUES' },
//     { value: 'closed', name: 'closed:   ISSUES has been processed' }
//   ],
//   markBreakingChangeMode: true,
//   scopeOverrides: undefined,
//   upperCaseSubject: false,

//   skipQuestions: ['footerPrefix'],

//   // formatMessageCB: (mod) => {
//   //   console.log(mod)

//   //   return mod.defaultMessage
//   // }
// }

export default config
