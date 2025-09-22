import { aes } from './src/algorithms/aes.ts';

console.log('🔍 调试备份加密问题...');

// 测试数据
const testData = JSON.stringify({
  version: '1.0',
  created: new Date().toISOString(),
  keys: [
    {
      id: 'test-key-1',
      key: 'test-key-data',
      metadata: { name: 'test', algorithm: 'AES' }
    }
  ]
});

const password = 'BackupPassword123!';

console.log('📝 原始数据:', testData);
console.log('🔑 密码:', password);

// 测试加密
console.log('\n🔒 开始加密...');
const encrypted = aes.encrypt(testData, password);
console.log('加密结果:', encrypted);

if (encrypted.success) {
  console.log('✅ 加密成功');
  console.log('加密数据:', encrypted.data);
  console.log('IV:', encrypted.iv);
  console.log('算法:', encrypted.algorithm);
  console.log('模式:', encrypted.mode);
  console.log('密钥长度:', encrypted.keySize);
  
  // 测试解密
  console.log('\n🔓 开始解密...');
  const decrypted = aes.decrypt(encrypted.data, password);
  console.log('解密结果:', decrypted);
  
  if (decrypted.success) {
    console.log('✅ 解密成功');
    console.log('解密数据:', decrypted.data);
    
    // 验证数据是否一致
    if (decrypted.data === testData) {
      console.log('✅ 数据一致性验证通过');
    } else {
      console.log('❌ 数据一致性验证失败');
      console.log('原始:', testData);
      console.log('解密:', decrypted.data);
    }
  } else {
    console.log('❌ 解密失败:', decrypted.error);
  }
} else {
  console.log('❌ 加密失败:', encrypted.error);
}

// 测试使用EncryptResult对象解密
console.log('\n🔄 测试使用EncryptResult对象解密...');
if (encrypted.success) {
  const decrypted2 = aes.decrypt(encrypted, password);
  console.log('解密结果2:', decrypted2);
  
  if (decrypted2.success) {
    console.log('✅ 使用EncryptResult对象解密成功');
    console.log('解密数据:', decrypted2.data);
  } else {
    console.log('❌ 使用EncryptResult对象解密失败:', decrypted2.error);
  }
}
