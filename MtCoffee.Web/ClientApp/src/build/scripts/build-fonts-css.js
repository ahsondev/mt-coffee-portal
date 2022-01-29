const fs = require('fs');
const config = require('./fontello/config.json');

// const copyFont = (fileName) => {
//   const data = fs.readFileSync(`src/build/scripts/fontello/font/${fileName}`);
//   fs.writeFileSync(`public/assets/font/${fileName}`, data);
// }

// copyFont('foo.eot');

const codes = config.glyphs.map(g => ({name: g.css, code: `\\${parseInt(g.code, 10).toString(16).toUpperCase()}`}));

const now = Date.now();
// /* Variables that can be used in other scss files. */
// ${codes.map(c => `$icon-code-${c.name}: '${c.code.toUpperCase()}';`).join('\n')}
const scssFileContent =  `
$icon-codes-map: (
${codes.map(c => `  ${c.name}: '${c.code.toUpperCase()}',`).join('\n')}
);

@function get-icon-code($name, $literal: true) {
  @if $literal == true {
    @return map-get($icon-codes-map, $name);
  }
  @else {
    @return var(--mt-icon-code-#{$name});
  }
}
`;

fs.writeFileSync('src/style/shared/_icon-variables.scss', scssFileContent);

const fontDeclarationCss = `
@font-face {
  font-family: 'mtcoffee';
  src: url('/assets/font/mtcoffee.eot?${now}#iefix') format('embedded-opentype'),
        url('/assets/font/mtcoffee.woff2?${now}') format('woff2'),
        url('/assets/font/mtcoffee.woff?${now}') format('woff'),
        url('/assets/font/mtcoffee.ttf?${now}') format('truetype'),
        url('/assets/font/mtcoffee.svg?${now}#mtcoffee') format('svg');
  font-weight: normal;
  font-style: normal;
}

.icon-x-before:before, .icon-x-after:after {
  font-family: "mtcoffee";
  font-style: normal;
  font-weight: normal;
  display: inline-block;
  text-decoration: inherit;
  width: 1em;
  margin-right: .2em;
  text-align: center;

  /* For safety - reset parent styles, that can break glyph codes*/
  font-variant: normal;
  text-transform: none;
  
  /* you can be more comfortable with increased icons size */
  /* font-size: 120%; */
  
  /* fix buttons height, for twitter bootstrap */
  line-height: 1em;
  
  /* Animation center compensation - margins should be symmetric */
  /* remove if not needed */
  margin-left: .2em;

  /* Font smoothing. That was taken from TWBS */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Uncomment for 3D effect */
  /* text-shadow: 1px 1px 1px rgba(127, 127, 127, 0.3); */
}

${codes.map(c => `.icon-x-before.icon-${c.name}:before { content: '${c.code.toUpperCase()}'; }`).join('\n')}
${codes.map(c => `.icon-x-after.icon-${c.name}:after { content: '${c.code.toUpperCase()}'; }`).join('\n')}

:root {
${codes.map(c => `  --mt-icon-code-${c.name}: '${c.code.toUpperCase()}';`).join('\n')}
}
`
;

fs.writeFileSync('public/assets/font/mtcoffee-font.css', fontDeclarationCss);

const iconNamesTs = `export type FontIconName = 
${codes.map(c => `    | '${c.name}'`).join('\n')}
    ;`;


fs.writeFileSync('src/components/common/icons/iconNames.ts', iconNamesTs);