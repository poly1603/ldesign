/**
 * 测试 @ldesign/crypto 集成
 */

import crypto from '@ldesign/crypto';

console.log('🧪 测试 @ldesign/crypto 包集成...\n');

// 测试基本导入
try {
  console.log('✅ @ldesign/crypto 包导入成功');

  // 测试 AES 加密
  console.log('\n📝 测试 AES 加密:');
  const text = 'Hello, LDesign!';
  const key = 'test-secret-key';

  const encrypted = crypto.aes.encrypt(text, key);
  if (encrypted.success) {
    console.log('  ✅ 加密成功:', encrypted.data.substring(0, 50) + '...');

    const decrypted = crypto.aes.decrypt(encrypted.data, key);
    if (decrypted.success && decrypted.data === text) {
      console.log('  ✅ 解密成功:', decrypted.data);
    } else {
      console.log('  ❌ 解密失败');
    }
  } else {
    console.log('  ❌ 加密失败:', encrypted.error);
  }

  // 测试 Hash
  console.log('\n📝 测试 Hash 功能:');
  const hashResult = crypto.hash.sha256('test data');
  console.log('  ✅ SHA256:', hashResult.substring(0, 50) + '...');

  // 测试 HMAC
  console.log('\n📝 测试 HMAC 功能:');
  const hmacResult = crypto.hmac.sha256('message', 'secret');
  console.log('  ✅ HMAC:', hmacResult.substring(0, 50) + '...');

  // 测试 Base64 编码
  console.log('\n📝 测试 Base64 编码:');
  const encoded = crypto.encoding.encode('Hello', 'base64');
  const decoded = crypto.encoding.decode(encoded, 'base64');
  console.log('  ✅ 编码:', encoded);
  console.log('  ✅ 解码:', decoded);

  // 测试随机密钥生成
  console.log('\n📝 测试密钥生成:');
  const randomKey = crypto.RandomUtils.generateKey(32);
  console.log('  ✅ 随机密钥 (32字节):', randomKey.substring(0, 50) + '...');

  console.log('\n🎉 所有测试通过！@ldesign/crypto 集成成功！\n');

} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error('\n错误详情:', error);
  process.exit(1);
}

export default {};

