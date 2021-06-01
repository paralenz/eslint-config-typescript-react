const { ESLint } = require('eslint')
const { readdirSync, lstatSync } = require('fs')
const { join } = require('path')
const baseConfig = require('../index.js')

expect.extend({
  toContainLintingErrors: (received) => received.length > 0
    ? {
      message: () => received.map(r => r.message).join('\n'),
      pass: true
    }
    : {
      message: () => 'Should contain at least one linting errors.',
      pass: false
    }
})

const eslint = new ESLint({
  baseConfig,
})

const describeRule = rule => {
  const dir = join('tests', rule || '.')
  const files = readdirSync(dir).filter(t => !t.startsWith('_'))

  const { rules, tests } = files
    .filter(f => !f.endsWith('.spec.js'))
    .reduce(({ rules, tests }, f) => lstatSync(join(dir, f)).isDirectory()
      ? {
        tests,
        rules: rules.concat(join(rule, f))
      }
      : {
        rules,
        tests: tests.concat(f)
      }, {
      rules: [],
      tests: []
    })

  if (tests.length > 0) {
    describe(rule || 'root', () => {
      for (const test of tests) {
        it(test, async () => {
          const [r] = await eslint.lintFiles([join(dir, test)])

          const messages = r.messages.filter(msg => msg.ruleId.startsWith(rule))
          const warnings = messages.filter(msg => msg.severity === 1)
          const errors = messages.filter(msg => msg.severity === 2)

          if (test.includes('.error.')) {
            expect(warnings).not.toContainLintingErrors()
            expect(errors).toContainLintingErrors()
          } else if (test.includes('.warn.')) {
            expect(errors).not.toContainLintingErrors()
            expect(warnings).toContainLintingErrors()
          } else {
            expect(messages).not.toContainLintingErrors()
          }

        })
      }
    })
  }

  for (const rule of rules) {
    describeRule(rule)
  }
}

describeRule('')
