module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  doubleQuote: false,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 100,
  
  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // Objects
  objectCurlySpacing: true,
  
  // Arrays
  arrayBracketSpacing: false,
  
  // JSX (for React components)
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // End of line
  endOfLine: 'lf',
  
  // Quote props
  quoteProps: 'as-needed',
  
  // HTML
  htmlWhitespaceSensitivity: 'css',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Prose wrap
  proseWrap: 'preserve',
  
  // Vue files
  vueIndentScriptAndStyle: false,
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.css', '*.scss', '*.less'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: ['package.json', 'package-lock.json'],
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
  ],
};