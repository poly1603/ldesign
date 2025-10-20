/**
 * @ldesign/color - Named Colors
 * 
 * CSS named color definitions
 */

// Use a Map for better memory efficiency and lookup performance
export const namedColorsMap = new Map<string, string>([
  // Basic colors
  ['black', '#000000'],
  ['white', '#FFFFFF'],
  ['red', '#FF0000'],
  ['green', '#008000'],
  ['blue', '#0000FF'],
  ['yellow', '#FFFF00'],
  ['cyan', '#00FFFF'],
  ['magenta', '#FF00FF'],
  ['silver', '#C0C0C0'],
  ['gray', '#808080'],
  ['grey', '#808080'],
  ['maroon', '#800000'],
  ['olive', '#808000'],
  ['lime', '#00FF00'],
  ['aqua', '#00FFFF'],
  ['teal', '#008080'],
  ['navy', '#000080'],
  ['fuchsia', '#FF00FF'],
  ['purple', '#800080'],
  
  // Extended colors
  ['aliceblue', '#F0F8FF'],
  ['antiquewhite', '#FAEBD7'],
  ['aquamarine', '#7FFFD4'],
  ['azure', '#F0FFFF'],
  ['beige', '#F5F5DC'],
  ['bisque', '#FFE4C4'],
  ['blanchedalmond', '#FFEBCD'],
  ['blueviolet', '#8A2BE2'],
  ['brown', '#A52A2A'],
  ['burlywood', '#DEB887'],
  ['cadetblue', '#5F9EA0'],
  ['chartreuse', '#7FFF00'],
  ['chocolate', '#D2691E'],
  ['coral', '#FF7F50'],
  ['cornflowerblue', '#6495ED'],
  ['cornsilk', '#FFF8DC'],
  ['crimson', '#DC143C'],
  ['darkblue', '#00008B'],
  ['darkcyan', '#008B8B'],
  ['darkgoldenrod', '#B8860B'],
  ['darkgray', '#A9A9A9'],
  ['darkgrey', '#A9A9A9'],
  ['darkgreen', '#006400'],
  ['darkkhaki', '#BDB76B'],
  ['darkmagenta', '#8B008B'],
  ['darkolivegreen', '#556B2F'],
  ['darkorange', '#FF8C00'],
  ['darkorchid', '#9932CC'],
  ['darkred', '#8B0000'],
  ['darksalmon', '#E9967A'],
  ['darkseagreen', '#8FBC8F'],
  ['darkslateblue', '#483D8B'],
  ['darkslategray', '#2F4F4F'],
  ['darkslategrey', '#2F4F4F'],
  ['darkturquoise', '#00CED1'],
  ['darkviolet', '#9400D3'],
  ['deeppink', '#FF1493'],
  ['deepskyblue', '#00BFFF'],
  ['dimgray', '#696969'],
  ['dimgrey', '#696969'],
  ['dodgerblue', '#1E90FF'],
  ['firebrick', '#B22222'],
  ['floralwhite', '#FFFAF0'],
  ['forestgreen', '#228B22'],
  ['gainsboro', '#DCDCDC'],
  ['ghostwhite', '#F8F8FF'],
  ['gold', '#FFD700'],
  ['goldenrod', '#DAA520'],
  ['greenyellow', '#ADFF2F'],
  ['honeydew', '#F0FFF0'],
  ['hotpink', '#FF69B4'],
  ['indianred', '#CD5C5C'],
  ['indigo', '#4B0082'],
  ['ivory', '#FFFFF0'],
  ['khaki', '#F0E68C'],
  ['lavender', '#E6E6FA'],
  ['lavenderblush', '#FFF0F5'],
  ['lawngreen', '#7CFC00'],
  ['lemonchiffon', '#FFFACD'],
  ['lightblue', '#ADD8E6'],
  ['lightcoral', '#F08080'],
  ['lightcyan', '#E0FFFF'],
  ['lightgoldenrodyellow', '#FAFAD2'],
  ['lightgray', '#D3D3D3'],
  ['lightgrey', '#D3D3D3'],
  ['lightgreen', '#90EE90'],
  ['lightpink', '#FFB6C1'],
  ['lightsalmon', '#FFA07A'],
  ['lightseagreen', '#20B2AA'],
  ['lightskyblue', '#87CEFA'],
  ['lightslategray', '#778899'],
  ['lightslategrey', '#778899'],
  ['lightsteelblue', '#B0C4DE'],
  ['lightyellow', '#FFFFE0'],
  ['limegreen', '#32CD32'],
  ['linen', '#FAF0E6'],
  ['mediumaquamarine', '#66CDAA'],
  ['mediumblue', '#0000CD'],
  ['mediumorchid', '#BA55D3'],
  ['mediumpurple', '#9370DB'],
  ['mediumseagreen', '#3CB371'],
  ['mediumslateblue', '#7B68EE'],
  ['mediumspringgreen', '#00FA9A'],
  ['mediumturquoise', '#48D1CC'],
  ['mediumvioletred', '#C71585'],
  ['midnightblue', '#191970'],
  ['mintcream', '#F5FFFA'],
  ['mistyrose', '#FFE4E1'],
  ['moccasin', '#FFE4B5'],
  ['navajowhite', '#FFDEAD'],
  ['oldlace', '#FDF5E6'],
  ['olivedrab', '#6B8E23'],
  ['orange', '#FFA500'],
  ['orangered', '#FF4500'],
  ['orchid', '#DA70D6'],
  ['palegoldenrod', '#EEE8AA'],
  ['palegreen', '#98FB98'],
  ['paleturquoise', '#AFEEEE'],
  ['palevioletred', '#DB7093'],
  ['papayawhip', '#FFEFD5'],
  ['peachpuff', '#FFDAB9'],
  ['peru', '#CD853F'],
  ['pink', '#FFC0CB'],
  ['plum', '#DDA0DD'],
  ['powderblue', '#B0E0E6'],
  ['rebeccapurple', '#663399'],
  ['rosybrown', '#BC8F8F'],
  ['royalblue', '#4169E1'],
  ['saddlebrown', '#8B4513'],
  ['salmon', '#FA8072'],
  ['sandybrown', '#F4A460'],
  ['seagreen', '#2E8B57'],
  ['seashell', '#FFF5EE'],
  ['sienna', '#A0522D'],
  ['skyblue', '#87CEEB'],
  ['slateblue', '#6A5ACD'],
  ['slategray', '#708090'],
  ['slategrey', '#708090'],
  ['snow', '#FFFAFA'],
  ['springgreen', '#00FF7F'],
  ['steelblue', '#4682B4'],
  ['tan', '#D2B48C'],
  ['thistle', '#D8BFD8'],
  ['tomato', '#FF6347'],
  ['turquoise', '#40E0D0'],
  ['violet', '#EE82EE'],
  ['wheat', '#F5DEB3'],
  ['whitesmoke', '#F5F5F5'],
  ['yellowgreen', '#9ACD32'],
  
  // System colors
  ['transparent', 'rgba(0,0,0,0)']
]);

// Backward compatibility export
export const namedColors = Object.fromEntries(namedColorsMap);

export type NamedColor = keyof typeof namedColors;

/**
 * Get a color by name - Use Map for O(1) lookup
 */
export function getNamedColor(name: string): string | undefined {
  return namedColorsMap.get(name.toLowerCase());
}

/**
 * Check if a string is a valid named color
 */
export function isNamedColor(name: unknown): name is NamedColor {
  return typeof name === 'string' && namedColorsMap.has(name.toLowerCase());
}

/**
 * Get all named color names - Return array from Map keys
 */
export function getNamedColorNames(): string[] {
  return Array.from(namedColorsMap.keys());
}

// Pre-computed reverse map for faster lookups
const hexToNameMap = new Map<string, string>();
for (const [name, hex] of namedColorsMap) {
  hexToNameMap.set(hex.toUpperCase(), name);
}

/**
 * Get the name of a color from its hex value - Use reverse map for O(1) lookup
 */
export function getColorName(hex: string): string | undefined {
  return hexToNameMap.get(hex.toUpperCase());
}
