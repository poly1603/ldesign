const  fs  =  require('fs');

const  filePath  =  'src/components/progress/progress.tsx';
let  content  =  fs.readFileSync(filePath,  'utf-8');

//  Fix  line  248  -  add  complete  theme  class
content  =  content.replace(
        /                        this\.theme    !==    'default'    \?        :    '',/,
        "                        this.theme  !==  'default'  ?  `ldesign-progress--theme-${this.theme}`  :  '',"
);

//  Fix  line  384  -  add  complete  theme  class  for  circle
content  =  content.replace(
        /                        this\.theme    !==    'default'    \?        :    '',\n                        this\.type    ===    'dashboard'    &&    this\.dashboardVariant    !==    'standard'    \?        :    '',/,
        "                        this.theme  !==  'default'  ?  `ldesign-progress--theme-${this.theme}`  :  '',\n                        this.type  ===  'dashboard'  &&  this.dashboardVariant  !==  'standard'  ?  `ldesign-progress--dashboard-${this.dashboardVariant}`  :  '',"
);

//  Fix  line  539  -  add  complete  theme  class  for  steps
content  =  content.replace(
        /                        this\.shadow    \?    'ldesign-progress--shadow'    :    '',\n                        this\.theme    !==    'default'    \?        :    '',/,
        "                        this.shadow  ?  'ldesign-progress--shadow'  :  '',\n                        this.theme  !==  'default'  ?  `ldesign-progress--theme-${this.theme}`  :  '',"
);

//  Fix  indentation  for  lines  102,  103,  105,  106
const  lines  =  content.split('\n');
if  (lines[101]  &&  lines[101].startsWith('                '))  {
    lines[101]  =  lines[101].replace(/^                /,  '        ');
}
if  (lines[102]  &&  lines[102].startsWith('                '))  {
        lines[102]  =  lines[102].replace(/^                /,  '        ');
}
if  (lines[104]  &&  lines[104].startsWith('                '))  {
        lines[104]  =  lines[104].replace(/^                /,  '        ');
}
if  (lines[105]  &&  lines[105].startsWith('                '))  {
        lines[105]  =  lines[105].replace(/^                /,  '        ');
}
content  =  lines.join('\n');

fs.writeFileSync(filePath,  content,  'utf-8');
console.log('Fixed  progress.tsx!');
