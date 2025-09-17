import path from 'path';
import fs from 'fs';

import { upperCamelCase } from '../../../gulp/util';

const template = fs.readFileSync(path.resolve(__dirname, 'template/icon.tsx'), 'utf-8');

export function reactGetIconFileContent({ name, element }: { name: string; element: string }): string {
  return template
    .replace(/\$ICON_NAME/g, `${upperCamelCase(name)}Icon`)
    .replace(/\$ELEMENT/g, element)
    .replace(/\$KEY/g, name);
}
