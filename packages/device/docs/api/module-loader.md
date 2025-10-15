#  ModuleLoader  API

高性能模块加载器,负责动态加载和管理扩展模块,支持依赖管理、并行加载和性能监控。

##  类概述

`ModuleLoader`  提供以下功能:

-  按需动态加载模块
-  避免重复加载(单例模式)
-  支持模块依赖管理
-  并行加载多个模块
-  模块预加载
-  加载性能统计
-  错误重试机制

##  构造函数

###  `constructor()`

创建模块加载器实例。

**示例:**

```typescript
import  {  ModuleLoader  }  from  '@ldesign/device'

const  loader  =  new  ModuleLoader()
```

##  核心方法

###  `load<T>(name:  string):  Promise<T>`

加载模块并返回模块数据。

**参数:**
-  **name**  (`string`):  模块名称,支持:
    -  `'network'`  -  网络信息模块
    -  `'battery'`  -  电池信息模块
    -  `'geolocation'`  -  地理位置模块
    -  `'feature'`  -  特性检测模块
    -  `'performance'`  -  性能评估模块
    -  `'media'`  -  媒体设备模块

**返回值:**  `Promise<T>`  -  模块数据

**示例:**

```typescript
//  加载网络模块并获取数据
const  networkInfo  =  await  loader.load('network')
console.log('在线状态:',  networkInfo.status)

//  加载电池模块并获取数据
const  batteryInfo  =  await  loader.load('battery')
console.log('电量:',  batteryInfo.level)
```

###  `loadModuleInstance<T>(name:  string):  Promise<T>`

加载模块并返回模块实例。

**参数:**
-  **name**  (`string`):  模块名称

**返回值:**  `Promise<T>`  -  模块实例

**示例:**

```typescript
//  加载网络模块实例
const  networkModule  =  await  loader.loadModuleInstance('network')
console.log('在线:',  networkModule.isOnline())
console.log('连接类型:',  networkModule.getConnectionType())

//  加载电池模块实例
const  batteryModule  =  await  loader.loadModuleInstance('battery')
console.log('电量:',  batteryModule.getLevel())
console.log('充电中:',  batteryModule.isCharging())
```

###  `unload(name:  string):  Promise<void>`

卸载指定模块。

**参数:**
-  **name**  (`string`):  模块名称

**示例:**

```typescript
//  卸载网络模块
await  loader.unload('network')

//  卸载所有模块
await  loader.unloadAll()
```

###  `unloadAll():  Promise<void>`

卸载所有已加载的模块。

**示例:**

```typescript
await  loader.unloadAll()
```

##  查询方法

###  `isLoaded(name:  string):  boolean`

检查模块是否已加载。

**参数:**
-  **name**  (`string`):  模块名称

**返回值:**  `boolean`

**示例:**

```typescript
if  (loader.isLoaded('network'))  {
    console.log('网络模块已加载')
}  else  {
    await  loader.loadModuleInstance('network')
}
```

###  `getModule(name:  string):  DeviceModule  |  undefined`

获取已加载的模块实例。

**参数:**
-  **name**  (`string`):  模块名称

**返回值:**  `DeviceModule  |  undefined`

**示例:**

```typescript
const  networkModule  =  loader.getModule('network')
if  (networkModule)  {
    console.log('网络数据:',  networkModule.getData())
}
```

###  `getLoadedModules():  string[]`

获取所有已加载的模块名称列表。

**返回值:**  `string[]`

**示例:**

```typescript
const  modules  =  loader.getLoadedModules()
console.log('已加载模块:',  modules)  //  ['network',  'battery',  'geolocation']
```

##  高级功能

###  `preload(names:  string[]):  Promise<void>`

预加载多个模块(在后台加载,不阻塞)。

**参数:**
-  **names**  (`string[]`):  要预加载的模块名称列表

**示例:**

```typescript
//  应用启动时预加载常用模块
await  loader.preload(['network',  'battery'])

//  后续使用时无需等待加载
const  networkModule  =  await  loader.loadModuleInstance('network')  //  立即返回
```

###  `loadMultiple<T>(names:  string[],  concurrency?:  number):  Promise<T[]>`

批量并行加载多个模块。

**参数:**
-  **names**  (`string[]`):  要加载的模块名称列表
-  **concurrency**  (`number`,  可选,  默认:  `3`):  并发加载数量

**返回值:**  `Promise<T[]>`  -  模块实例数组

**示例:**

```typescript
//  并行加载多个模块
const  [networkModule,  batteryModule,  geoModule]  =  await  loader.loadMultiple([
    'network',
    'battery',
    'geolocation'
])

//  控制并发数
const  modules  =  await  loader.loadMultiple(
    ['network',  'battery',  'geolocation',  'feature'],
    2  //  同时最多加载  2  个
)
```

###  `setDependencies(name:  string,  deps:  string[]):  void`

设置模块依赖关系。

**参数:**
-  **name**  (`string`):  模块名称
-  **deps**  (`string[]`):  依赖的模块列表

**示例:**

```typescript
//  设置依赖关系
loader.setDependencies('performance',  ['network',  'battery'])

//  加载时会自动先加载依赖模块
await  loader.loadModuleInstance('performance')
//  会自动先加载  network  和  battery
```

###  `setPriority(name:  string,  priority:  number):  void`

设置模块加载优先级。

**参数:**
-  **name**  (`string`):  模块名称
-  **priority**  (`number`):  优先级,数字越大优先级越高

**示例:**

```typescript
//  设置优先级
loader.setPriority('network',  10)
loader.setPriority('battery',  5)
loader.setPriority('geolocation',  1)

//  预加载时会按优先级顺序加载
await  loader.preload(['geolocation',  'battery',  'network'])
//  实际加载顺序:  network  ->  battery  ->  geolocation
```

##  性能监控

###  `getLoadingStats(name?:  string):  object  |  Record<string,  object>`

获取模块加载统计信息。

**参数:**
-  **name**  (`string`,  可选):  模块名称,不传则返回所有模块的统计

**返回值:**  统计信息对象或统计信息映射

统计信息包含:
-  **loadCount**  (`number`):  加载次数
-  **totalLoadTime**  (`number`):  总加载时间(毫秒)
-  **averageLoadTime**  (`number`):  平均加载时间(毫秒)
-  **lastLoadTime**  (`number`):  最后一次加载时间(毫秒)
-  **errors**  (`number`):  错误次数

**示例:**

```typescript
//  获取单个模块统计
const  stats  =  loader.getLoadingStats('network')
console.log('网络模块统计:',  {
    加载次数:  stats.loadCount,
    平均耗时:  stats.averageLoadTime.toFixed(2)  +  'ms',
    错误次数:  stats.errors
})

//  获取所有模块统计
const  allStats  =  loader.getLoadingStats()
console.log('所有模块统计:',  allStats)
```

###  `clearStats(name?:  string):  void`

清理统计信息。

**参数:**
-  **name**  (`string`,  可选):  模块名称,不传则清理所有统计

**示例:**

```typescript
//  清理单个模块统计
loader.clearStats('network')

//  清理所有统计
loader.clearStats()
```

##  完整示例

###  基础使用

```typescript
import  {  ModuleLoader  }  from  '@ldesign/device'

const  loader  =  new  ModuleLoader()

//  加载网络模块
const  networkModule  =  await  loader.loadModuleInstance('network')
console.log('在线状态:',  networkModule.isOnline())

//  加载电池模块
const  batteryModule  =  await  loader.loadModuleInstance('battery')
console.log('电量:',  batteryModule.getLevelPercentage()  +  '%')

//  检查模块是否已加载
if  (loader.isLoaded('geolocation'))  {
    const  geoModule  =  loader.getModule('geolocation')
}  else  {
    const  geoModule  =  await  loader.loadModuleInstance('geolocation')
}

//  卸载不需要的模块
await  loader.unload('network')

//  清理所有模块
await  loader.unloadAll()
```

###  并行加载

```typescript
const  loader  =  new  ModuleLoader()

//  并行加载多个模块
const  [networkModule,  batteryModule,  geoModule]  =  await  loader.loadMultiple([
    'network',
    'battery',
    'geolocation'
],  3)  //  最多  3  个并发

//  立即可用
console.log('网络状态:',  networkModule.isOnline())
console.log('电量:',  batteryModule.getLevel())
console.log('位置:',  await  geoModule.getCurrentPosition())
```

###  模块预加载

```typescript
const  loader  =  new  ModuleLoader()

//  应用启动时预加载
async  function  init()  {
    //  设置优先级
    loader.setPriority('network',  10)
    loader.setPriority('battery',  8)
    loader.setPriority('geolocation',  5)

    //  预加载(不阻塞启动)
    loader.preload(['network',  'battery',  'geolocation'])
        .then(()  =>  console.log('模块预加载完成'))
        .catch((err)  =>  console.error('预加载失败:',  err))

    //  继续执行其他初始化
    await  setupUI()
}

//  后续使用时无需等待
async  function  checkNetwork()  {
    //  立即返回,因为已经预加载
    const  networkModule  =  await  loader.loadModuleInstance('network')
    return  networkModule.isOnline()
}
```

###  依赖管理

```typescript
const  loader  =  new  ModuleLoader()

//  设置模块依赖关系
loader.setDependencies('performance',  ['network',  'battery'])
loader.setDependencies('analytics',  ['network',  'geolocation'])

//  加载时自动解析依赖
await  loader.loadModuleInstance('analytics')
//  会自动先加载  network  和  geolocation

//  检查已加载的模块
console.log('已加载:',  loader.getLoadedModules())
//  ['network',  'geolocation',  'analytics']
```

###  性能监控

```typescript
const  loader  =  new  ModuleLoader()

//  加载多个模块
await  loader.loadModuleInstance('network')
await  loader.loadModuleInstance('battery')
await  loader.loadModuleInstance('geolocation')

//  查看性能统计
const  stats  =  loader.getLoadingStats()

console.log('性能报告:')
Object.entries(stats).forEach(([name,  stat])  =>  {
    console.log(`${name}:`)
    console.log(`  -  加载次数:  ${stat.loadCount}`)
    console.log(`  -  平均耗时:  ${stat.averageLoadTime.toFixed(2)}ms`)
    console.log(`  -  最后耗时:  ${stat.lastLoadTime.toFixed(2)}ms`)
    console.log(`  -  错误次数:  ${stat.errors}`)
})
```

###  错误处理

```typescript
const  loader  =  new  ModuleLoader()

try  {
    //  尝试加载模块
    const  module  =  await  loader.loadModuleInstance('network')
    console.log('模块加载成功')
}  catch  (error)  {
    console.error('模块加载失败:',  error)

    //  检查错误统计
    const  stats  =  loader.getLoadingStats('network')
    if  (stats  &&  stats.errors  >  0)  {
        console.warn(`网络模块加载失败  ${stats.errors}  次`)
    }
}
```

###  实战:模块管理器

```typescript
import  {  ModuleLoader  }  from  '@ldesign/device'

class  AppModuleManager  {
    private  loader:  ModuleLoader

    constructor()  {
        this.loader  =  new  ModuleLoader()
        this.setupDependencies()
        this.setupPriorities()
    }

    private  setupDependencies()  {
        //  定义模块依赖关系
        this.loader.setDependencies('analytics',  ['network'])
        this.loader.setDependencies('dashboard',  ['network',  'battery'])
    }

    private  setupPriorities()  {
        //  设置加载优先级
        this.loader.setPriority('network',  10)
        this.loader.setPriority('battery',  8)
        this.loader.setPriority('geolocation',  5)
    }

    async  preloadEssentials()  {
        //  预加载核心模块
        await  this.loader.preload(['network',  'battery'])
    }

    async  loadModule(name:  string)  {
        try  {
            return  await  this.loader.loadModuleInstance(name)
        }  catch  (error)  {
            console.error(`加载模块  ${name}  失败:`,  error)
            throw  error
        }
    }

    async  cleanup()  {
        await  this.loader.unloadAll()
    }

    getStats()  {
        return  this.loader.getLoadingStats()
    }
}

//  使用
const  manager  =  new  AppModuleManager()

//  应用启动
await  manager.preloadEssentials()

//  按需加载
const  geoModule  =  await  manager.loadModule('geolocation')

//  查看性能
console.log('模块性能:',  manager.getStats())

//  清理
await  manager.cleanup()
```

##  支持的模块

###  network  -  网络信息模块
提供网络状态、连接类型、速度等信息。

###  battery  -  电池信息模块
提供电池电量、充电状态、剩余时间等信息。

###  geolocation  -  地理位置模块
提供位置获取、位置监听、距离计算等功能。

###  feature  -  特性检测模块
检测浏览器和设备支持的各种特性。

###  performance  -  性能评估模块
评估设备性能,包括  CPU、GPU、内存等。

###  media  -  媒体设备模块
管理摄像头、麦克风等媒体设备。

##  类型定义

```typescript
interface  DeviceModule  {
    name:  string
    init:  ()  =>  Promise<void>  |  void
    destroy:  ()  =>  Promise<void>  |  void
    getData:  ()  =>  unknown
}

interface  LoadingStats  {
    loadCount:  number
    totalLoadTime:  number
    averageLoadTime:  number
    lastLoadTime:  number
    errors:  number
}

interface  ModuleLoader  {
    load<T>(name:  string):  Promise<T>
    loadModuleInstance<T>(name:  string):  Promise<T>
    unload(name:  string):  Promise<void>
    unloadAll():  Promise<void>
    isLoaded(name:  string):  boolean
    getModule(name:  string):  DeviceModule  |  undefined
    getLoadedModules():  string[]
    preload(names:  string[]):  Promise<void>
    loadMultiple<T>(names:  string[],  concurrency?:  number):  Promise<T[]>
    setDependencies(name:  string,  deps:  string[]):  void
    setPriority(name:  string,  priority:  number):  void
    getLoadingStats(name?:  string):  LoadingStats  |  Record<string,  LoadingStats>
    clearStats(name?:  string):  void
}
```

##  注意事项

1.  **单例模式**:  同一个模块只会加载一次,重复调用返回同一实例
2.  **并发控制**:  `loadMultiple()`  默认最多  3  个并发,避免过度占用资源
3.  **错误重试**:  加载失败会自动重试最多  3  次,使用指数退避策略
4.  **依赖解析**:  自动处理模块依赖,使用拓扑排序确保正确的加载顺序
5.  **循环依赖**:  会检测并抛出循环依赖错误
6.  **性能统计**:  统计信息会定期清理,避免内存占用过多
7.  **清理资源**:  卸载模块时会调用其  `destroy()`  方法清理资源

##  相关链接

-  [DeviceDetector  API](./device-detector.md)
-  [NetworkModule  API](./network-module.md)
-  [BatteryModule  API](./battery-module.md)
-  [GeolocationModule  API](./geolocation-module.md)
-  [类型定义](./types.md)
-  [返回首页](./index.md)
