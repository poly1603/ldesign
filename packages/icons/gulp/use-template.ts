import { createTransformStream } from './transform';

export type IconFileContentGenerator = (props: {
  name: string;
  element: string;
  generationTime?: string;
  buildVersion?: string;
}) => string;

export const useTemplate = (iconGenerator: IconFileContentGenerator) => {
  const generationTime = new Date().toISOString();
  const buildVersion = require('../package.json').version;

  return createTransformStream((svgElementString, { stem: name }) =>
    iconGenerator({
      name,
      element: svgElementString,
      generationTime,
      buildVersion
    })
  );
};
