import path from 'path';
import fs from 'fs';

import { upperCamelCase } from '../../../gulp/util';

const template = fs.readFileSync(path.resolve(__dirname, 'template/icon.tsx'), 'utf-8');

export function vueGetIconFileContent({
  name,
  element,
  generationTime,
  buildVersion
}: {
  name: string;
  element: string;
  generationTime?: string;
  buildVersion?: string;
}): string {
  return template
    .replace(/\$ICON_NAME/g, upperCamelCase(name))
    .replace(/\$ELEMENT/g, element)
    .replace(/\$KEY/g, name)
    .replace(/\$GENERATION_TIME/g, generationTime || new Date().toISOString())
    .replace(/\$BUILD_VERSION/g, buildVersion || '1.0.0');
}
