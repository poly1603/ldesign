/**
 * 数据验证工具
 *
 * @description
 * 提供身份证、手机号、银行卡、邮箱等常用数据的验证功能。
 * 支持中国大陆的各种证件和格式验证。
 */
/**
 * 验证中国大陆手机号
 *
 * @param phone - 手机号
 * @returns 是否为有效手机号
 *
 * @example
 * ```typescript
 * isValidPhone('13812345678') // true
 * isValidPhone('12345678901') // false
 * isValidPhone('138-1234-5678') // true (支持带分隔符)
 * ```
 */
export declare function isValidPhone(phone: string): boolean;
/**
 * 验证中国大陆身份证号
 *
 * @param idCard - 身份证号
 * @returns 是否为有效身份证号
 *
 * @example
 * ```typescript
 * isValidIdCard('110101199003077777') // true (18位)
 * isValidIdCard('110101900307777') // true (15位)
 * isValidIdCard('11010119900307777X') // true (带X)
 * isValidIdCard('123456789012345678') // false
 * ```
 */
export declare function isValidIdCard(idCard: string): boolean;
/**
 * 验证银行卡号
 *
 * @param cardNumber - 银行卡号
 * @returns 是否为有效银行卡号
 *
 * @example
 * ```typescript
 * isValidBankCard('6222600260001072444') // true
 * isValidBankCard('1234567890123456') // false
 * isValidBankCard('6222 6002 6000 1072 444') // true (支持带空格)
 * ```
 */
export declare function isValidBankCard(cardNumber: string): boolean;
/**
 * 验证邮箱地址
 *
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('user.name+tag@example.co.uk') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export declare function isValidEmail(email: string): boolean;
/**
 * 验证URL
 *
 * @param url - URL地址
 * @returns 是否为有效URL
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // true
 * isValidUrl('http://localhost:3000') // true
 * isValidUrl('ftp://files.example.com') // true
 * isValidUrl('invalid-url') // false
 * ```
 */
export declare function isValidUrl(url: string): boolean;
/**
 * 验证IP地址（IPv4）
 *
 * @param ip - IP地址
 * @returns 是否为有效IPv4地址
 *
 * @example
 * ```typescript
 * isValidIPv4('192.168.1.1') // true
 * isValidIPv4('255.255.255.255') // true
 * isValidIPv4('256.1.1.1') // false
 * ```
 */
export declare function isValidIPv4(ip: string): boolean;
/**
 * 验证IPv6地址
 *
 * @param ip - IPv6地址
 * @returns 是否为有效IPv6地址
 *
 * @example
 * ```typescript
 * isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334') // true
 * isValidIPv6('2001:db8:85a3::8a2e:370:7334') // true
 * isValidIPv6('::1') // true
 * ```
 */
export declare function isValidIPv6(ip: string): boolean;
/**
 * 验证中国大陆固定电话号码
 *
 * @param phone - 固定电话号码
 * @returns 是否为有效固定电话
 *
 * @example
 * ```typescript
 * isValidLandline('010-12345678') // true
 * isValidLandline('0755-87654321') // true
 * isValidLandline('400-123-4567') // true
 * ```
 */
export declare function isValidLandline(phone: string): boolean;
/**
 * 验证中国大陆邮政编码
 *
 * @param zipCode - 邮政编码
 * @returns 是否为有效邮政编码
 *
 * @example
 * ```typescript
 * isValidZipCode('100000') // true
 * isValidZipCode('518000') // true
 * isValidZipCode('12345') // false
 * ```
 */
export declare function isValidZipCode(zipCode: string): boolean;
/**
 * 验证密码强度
 *
 * @param password - 密码
 * @param options - 验证选项
 * @returns 密码强度等级和详细信息
 *
 * @example
 * ```typescript
 * validatePassword('123456')
 * // { level: 'weak', score: 1, feedback: ['密码长度至少8位', '需要包含大写字母'] }
 *
 * validatePassword('MyPassword123!')
 * // { level: 'strong', score: 4, feedback: [] }
 * ```
 */
export declare function validatePassword(password: string, options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
}): {
    level: 'weak' | 'medium' | 'strong';
    score: number;
    feedback: string[];
};
/**
 * 验证统一社会信用代码
 *
 * @param code - 统一社会信用代码
 * @returns 是否为有效的统一社会信用代码
 *
 * @example
 * ```typescript
 * isValidSocialCreditCode('91110000000000000A') // true
 * isValidSocialCreditCode('12345678901234567890') // false
 * ```
 */
export declare function isValidSocialCreditCode(code: string): boolean;
//# sourceMappingURL=validate.d.ts.map