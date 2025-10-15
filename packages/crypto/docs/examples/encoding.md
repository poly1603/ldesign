#    编码示例

编码工具用于在不同数据格式之间转换，常用于数据传输、存储和显示。

##    基础用法

###    Base64    编码

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

//    编码
const    text    =    'Hello,    World!'
const    encoded    =    encoding.base64.encode(text)
console.log('Base64    编码:',    encoded)    //    'SGVsbG8sIFdvcmxkIQ=='

//    解码
const    decoded    =    encoding.base64.decode(encoded)
console.log('Base64    解码:',    decoded)    //    'Hello,    World!'
```

###    Hex    编码

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

//    编码
const    text    =    'Hello,    World!'
const    encoded    =    encoding.hex.encode(text)
console.log('Hex    编码:',    encoded)    //    '48656c6c6f2c20576f726c6421'

//    解码
const    decoded    =    encoding.hex.decode(encoded)
console.log('Hex    解码:',    decoded)    //    'Hello,    World!'
```

###    URL    安全的    Base64

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

//    URL    安全编码（移除    +、/    和    =）
const    text    =    'Hello,    World!    This    is    a    test.'
const    urlSafe    =    encoding.base64.encodeUrl(text)
console.log('URL    安全    Base64:',    urlSafe)

//    URL    安全解码
const    decoded    =    encoding.base64.decodeUrl(urlSafe)
console.log('解码:',    decoded)
```

###    通用编码接口

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

const    text    =    'Data    to    encode'

//    使用通用接口
const    base64    =    encoding.encode(text,    'base64')
const    hex    =    encoding.encode(text,    'hex')

console.log('Base64:',    base64)
console.log('Hex:',    hex)

//    使用通用解码接口
const    decodedBase64    =    encoding.decode(base64,    'base64')
const    decodedHex    =    encoding.decode(hex,    'hex')

console.log('解码    Base64:',    decodedBase64)
console.log('解码    Hex:',    decodedHex)
```

##    实际应用场景

###    场景    1：数据    URI    生成

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

/**
    *    生成    Data    URI
    */
class    DataURI    {
                //    从文本生成    Data    URI
                static    fromText(content:    string,    mimeType:    string    =    'text/plain'):    string    {
                                const    base64    =    encoding.base64.encode(content)
                                return    `data:${mimeType};base64,${base64}`
                }

                //    从    Data    URI    解析内容
                static    parseDataURI(dataUri:    string):    {
                                mimeType:    string
                                content:    string
                }    |    null    {
                                const    match    =    dataUri.match(/^data:([^;]+);base64,(.+)$/)

                                if    (!match)    {
                                                return    null
                                }

                                const    [,    mimeType,    base64Data]    =    match
                                const    content    =    encoding.base64.decode(base64Data)

                                return    {    mimeType,    content    }
                }

                //    从    JSON    生成    Data    URI
                static    fromJSON(obj:    any):    string    {
                                const    json    =    JSON.stringify(obj)
                                return    this.fromText(json,    'application/json')
                }

                //    从    HTML    生成    Data    URI
                static    fromHTML(html:    string):    string    {
                                return    this.fromText(html,    'text/html')
                }
}

//    使用示例
const    text    =    'Hello,    World!'
const    dataUri    =    DataURI.fromText(text)
console.log('Data    URI:',    dataUri)

//    解析    Data    URI
const    parsed    =    DataURI.parseDataURI(dataUri)
console.log('MIME    类型:',    parsed?.mimeType)
console.log('内容:',    parsed?.content)

//    JSON    Data    URI
const    jsonData    =    {    name:    'John',    age:    30    }
const    jsonDataUri    =    DataURI.fromJSON(jsonData)
console.log('JSON    Data    URI:',    jsonDataUri)

//    HTML    Data    URI
const    html    =    '<h1>Hello,    World!</h1>'
const    htmlDataUri    =    DataURI.fromHTML(html)
console.log('HTML    Data    URI:',    htmlDataUri)
```

###    场景    2：二进制数据编码

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

/**
    *    二进制数据处理
    */
class    BinaryData    {
                //    数组转    Hex
                static    arrayToHex(arr:    number[]):    string    {
                                return    arr.map((b)    =>    b.toString(16).padStart(2,    '0')).join('')
                }

                //    Hex    转数组
                static    hexToArray(hex:    string):    number[]    {
                                const    result    =    []
                                for    (let    i    =    0;    i    <    hex.length;    i    +=    2)    {
                                                result.push(parseInt(hex.substr(i,    2),    16))
                                }
                                return    result
                }

                //    字节数组转    Base64
                static    arrayToBase64(arr:    number[]):    string    {
                                const    hex    =    this.arrayToHex(arr)
                                const    text    =    String.fromCharCode(...arr)
                                return    encoding.base64.encode(text)
                }

                //    Base64    转字节数组
                static    base64ToArray(base64:    string):    number[]    {
                                const    text    =    encoding.base64.decode(base64)
                                const    result    =    []
                                for    (let    i    =    0;    i    <    text.length;    i++)    {
                                                result.push(text.charCodeAt(i))
                                }
                                return    result
                }
}

//    使用示例
const    byteArray    =    [72,    101,    108,    108,    111]    //    'Hello'

//    转换为    Hex
const    hex    =    BinaryData.arrayToHex(byteArray)
console.log('Hex:',    hex)

//    转换为    Base64
const    base64    =    BinaryData.arrayToBase64(byteArray)
console.log('Base64:',    base64)

//    从    Hex    还原
const    restoredFromHex    =    BinaryData.hexToArray(hex)
console.log('从    Hex    还原:',    restoredFromHex)

//    从    Base64    还原
const    restoredFromBase64    =    BinaryData.base64ToArray(base64)
console.log('从    Base64    还原:',    restoredFromBase64)
```

###    场景    3：URL    参数编码

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

/**
    *    URL    参数安全编码
    */
class    URLParams    {
                //    编码对象为    URL    安全字符串
                static    encodeParams(params:    Record<string,    any>):    string    {
                                const    json    =    JSON.stringify(params)
                                return    encoding.base64.encodeUrl(json)
                }

                //    解码    URL    参数
                static    decodeParams(encoded:    string):    Record<string,    any>    {
                                const    json    =    encoding.base64.decodeUrl(encoded)
                                return    JSON.parse(json)
                }

                //    生成完整    URL
                static    buildURL(baseUrl:    string,    params:    Record<string,    any>):    string    {
                                const    encoded    =    this.encodeParams(params)
                                const    separator    =    baseUrl.includes('?')    ?    '&'    :    '?'
                                return    `${baseUrl}${separator}data=${encoded}`
                }

                //    解析    URL    参数
                static    parseURL(url:    string):    Record<string,    any>    |    null    {
                                const    match    =    url.match(/[?&]data=([^&]+)/)

                                if    (!match)    {
                                                return    null
                                }

                                return    this.decodeParams(match[1])
                }
}

//    使用示例
const    params    =    {
                userId:    123,
                action:    'view',
                filters:    {
                                category:    'tech',
                                tags:    ['javascript',    'typescript'],
                },
}

//    编码参数
const    encoded    =    URLParams.encodeParams(params)
console.log('编码的参数:',    encoded)

//    生成    URL
const    url    =    URLParams.buildURL('https://example.com/api',    params)
console.log('完整    URL:',    url)

//    解析    URL
const    parsed    =    URLParams.parseURL(url)
console.log('解析的参数:',    parsed)
```

###    场景    4：存储编码

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

/**
    *    安全的本地存储编码
    */
class    SecureStorage    {
                //    编码后存储
                static    setItem(key:    string,    value:    any):    void    {
                                const    json    =    JSON.stringify(value)
                                const    encoded    =    encoding.base64.encode(json)
                                localStorage.setItem(key,    encoded)
                }

                //    解码并获取
                static    getItem<T>(key:    string):    T    |    null    {
                                const    encoded    =    localStorage.getItem(key)

                                if    (!encoded)    {
                                                return    null
                                }

                                try    {
                                                const    json    =    encoding.base64.decode(encoded)
                                                return    JSON.parse(json)
                                }    catch    {
                                                return    null
                                }
                }

                //    删除项
                static    removeItem(key:    string):    void    {
                                localStorage.removeItem(key)
                }

                //    清空所有
                static    clear():    void    {
                                localStorage.clear()
                }
}

//    使用示例（浏览器环境）
//    存储数据
SecureStorage.setItem('user',    {
                id:    123,
                name:    'John',
                preferences:    {
                                theme:    'dark',
                                language:    'zh-CN',
                },
})

//    读取数据
const    user    =    SecureStorage.getItem<{
                id:    number
                name:    string
                preferences:    any
}>('user')
console.log('存储的用户:',    user)
```

###    场景    5：消息编码传输

```typescript
import    {    encoding,    hash    }    from    '@ldesign/crypto'

/**
    *    消息编码和完整性验证
    */
class    MessageEncoder    {
                //    编码消息
                static    encode(message:    any):    string    {
                                //    序列化
                                const    json    =    JSON.stringify(message)

                                //    计算校验和
                                const    checksum    =    hash.sha256(json).substring(0,    8)

                                //    组合消息和校验和
                                const    combined    =    `${checksum}${json}`

                                //    Base64    编码
                                return    encoding.base64.encode(combined)
                }

                //    解码并验证消息
                static    decode(encoded:    string):    {
                                valid:    boolean
                                message?:    any
                                error?:    string
                }    {
                                try    {
                                                //    Base64    解码
                                                const    combined    =    encoding.base64.decode(encoded)

                                                //    分离校验和和消息
                                                const    checksum    =    combined.substring(0,    8)
                                                const    json    =    combined.substring(8)

                                                //    验证校验和
                                                const    actualChecksum    =    hash.sha256(json).substring(0,    8)

                                                if    (checksum    !==    actualChecksum)    {
                                                                return    {
                                                                                valid:    false,
                                                                                error:    '消息完整性验证失败',
                                                                }
                                                }

                                                //    解析消息
                                                const    message    =    JSON.parse(json)

                                                return    {
                                                                valid:    true,
                                                                message,
                                                }
                                }    catch    (error)    {
                                                return    {
                                                                valid:    false,
                                                                error:    '消息解码失败',
                                                }
                                }
                }
}

//    使用示例
const    message    =    {
                type:    'notification',
                content:    '您有一条新消息',
                timestamp:    Date.now(),
}

//    编码消息
const    encoded    =    MessageEncoder.encode(message)
console.log('编码的消息:',    encoded)

//    解码消息
const    decoded    =    MessageEncoder.decode(encoded)
console.log('解码结果:',    decoded)

//    篡改测试
const    tampered    =    encoded    +    'x'
const    tamperedResult    =    MessageEncoder.decode(tampered)
console.log('篡改检测:',    tamperedResult.valid    ===    false)
```

###    场景    6：文件名编码

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

/**
    *    安全的文件名编码
    */
class    FileNameEncoder    {
                //    编码文件名（移除特殊字符）
                static    encode(filename:    string):    string    {
                                //    分离文件名和扩展名
                                const    parts    =    filename.split('.')
                                const    ext    =    parts.length    >    1    ?    parts.pop()    :    ''
                                const    name    =    parts.join('.')

                                //    Base64    URL    安全编码
                                const    encoded    =    encoding.base64.encodeUrl(name)

                                //    添加扩展名
                                return    ext    ?    `${encoded}.${ext}`    :    encoded
                }

                //    解码文件名
                static    decode(encodedFilename:    string):    string    {
                                //    分离文件名和扩展名
                                const    parts    =    encodedFilename.split('.')
                                const    ext    =    parts.length    >    1    ?    parts.pop()    :    ''
                                const    encoded    =    parts.join('.')

                                //    Base64    解码
                                const    name    =    encoding.base64.decodeUrl(encoded)

                                //    添加扩展名
                                return    ext    ?    `${name}.${ext}`    :    name
                }

                //    生成唯一文件名
                static    generateUnique(filename:    string):    string    {
                                const    timestamp    =    Date.now()
                                const    random    =    Math.random().toString(36).substring(2,    8)
                                const    unique    =    `${timestamp}_${random}_${filename}`
                                return    this.encode(unique)
                }
}

//    使用示例
const    originalName    =    '我的文档    2024.pdf'

//    编码文件名
const    encoded    =    FileNameEncoder.encode(originalName)
console.log('编码的文件名:',    encoded)

//    解码文件名
const    decoded    =    FileNameEncoder.decode(encoded)
console.log('解码的文件名:',    decoded)

//    生成唯一文件名
const    unique    =    FileNameEncoder.generateUnique('document.pdf')
console.log('唯一文件名:',    unique)
```

##    编码转换

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

/**
    *    编码格式转换
    */
class    EncodingConverter    {
                //    Hex    转    Base64
                static    hexToBase64(hex:    string):    string    {
                                const    text    =    encoding.hex.decode(hex)
                                return    encoding.base64.encode(text)
                }

                //    Base64    转    Hex
                static    base64ToHex(base64:    string):    string    {
                                const    text    =    encoding.base64.decode(base64)
                                return    encoding.hex.encode(text)
                }

                //    任意格式转换
                static    convert(
                                data:    string,
                                from:    'hex'    |    'base64',
                                to:    'hex'    |    'base64',
                ):    string    {
                                if    (from    ===    to)    {
                                                return    data
                                }

                                //    解码
                                const    decoded    =    encoding.decode(data,    from)

                                //    重新编码
                                return    encoding.encode(decoded,    to)
                }
}

//    使用示例
const    hexData    =    '48656c6c6f'

//    Hex    转    Base64
const    base64Data    =    EncodingConverter.hexToBase64(hexData)
console.log('Hex    转    Base64:',    base64Data)

//    Base64    转    Hex
const    backToHex    =    EncodingConverter.base64ToHex(base64Data)
console.log('Base64    转    Hex:',    backToHex)

//    通用转换
const    converted    =    EncodingConverter.convert(hexData,    'hex',    'base64')
console.log('通用转换:',    converted)
```

##    错误处理

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

function    safeEncode(data:    string,    type:    'base64'    |    'hex'):    string    |    null    {
                try    {
                                return    encoding.encode(data,    type)
                }    catch    (error)    {
                                console.error('编码失败:',    error)
                                return    null
                }
}

function    safeDecode(encoded:    string,    type:    'base64'    |    'hex'):    string    |    null    {
                try    {
                                return    encoding.decode(encoded,    type)
                }    catch    (error)    {
                                console.error('解码失败:',    error)
                                return    null
                }
}

//    使用示例
const    encoded    =    safeEncode('Hello',    'base64')
if    (encoded)    {
                const    decoded    =    safeDecode(encoded,    'base64')
                console.log('解码结果:',    decoded)
}
```

##    性能测试

```typescript
import    {    encoding    }    from    '@ldesign/crypto'

//    测试编码性能
function    testEncodingPerformance()    {
                const    data    =    'Test    data    for    encoding    performance'.repeat(100)
                const    iterations    =    1000

                //    Base64    编码
                console.time(`Base64    编码    ${iterations}    次`)
                for    (let    i    =    0;    i    <    iterations;    i++)    {
                                encoding.base64.encode(data)
                }
                console.timeEnd(`Base64    编码    ${iterations}    次`)

                //    Base64    解码
                const    encoded    =    encoding.base64.encode(data)
                console.time(`Base64    解码    ${iterations}    次`)
                for    (let    i    =    0;    i    <    iterations;    i++)    {
                                encoding.base64.decode(encoded)
                }
                console.timeEnd(`Base64    解码    ${iterations}    次`)

                //    Hex    编码
                console.time(`Hex    编码    ${iterations}    次`)
                for    (let    i    =    0;    i    <    iterations;    i++)    {
                                encoding.hex.encode(data)
                }
                console.timeEnd(`Hex    编码    ${iterations}    次`)

                //    Hex    解码
                const    hexEncoded    =    encoding.hex.encode(data)
                console.time(`Hex    解码    ${iterations}    次`)
                for    (let    i    =    0;    i    <    iterations;    i++)    {
                                encoding.hex.decode(hexEncoded)
                }
                console.timeEnd(`Hex    解码    ${iterations}    次`)
}

testEncodingPerformance()
```

##    使用建议

```typescript
//    Base64    -    适用于文本传输和存储
const    textData    =    encoding.base64.encode('文本数据')

//    Hex    -    适用于二进制数据和调试
const    binaryData    =    encoding.hex.encode('二进制数据')

//    URL    安全    Base64    -    适用于    URL    参数
const    urlData    =    encoding.base64.encodeUrl('URL    数据')

//    选择建议：
//    -    数据传输：Base64
//    -    URL    参数：URL    安全    Base64
//    -    调试显示：Hex
//    -    存储：Base64（更紧凑）
```

##    相关资源

-    [哈希示例](./hash.md)
-    [AES    加密](./aes.md)
-    [API    文档](/api/encoding)
-    [性能优化](/guide/performance)
