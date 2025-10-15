#  DeviceDetector  API

设备检测器主类,负责检测设备类型、监听设备变化、管理扩展模块。

##  类概述

`DeviceDetector`  是  @ldesign/device  的核心类,提供以下功能:

-  检测设备类型(桌面、移动、平板)
-  监听屏幕方向变化
-  检测浏览器和操作系统信息
-  动态加载扩展模块(电池、地理位置、网络等)
-  提供响应式的设备信息更新
-  性能监控和优化

##  构造函数

###  `constructor(options?:  DeviceDetectorOptions)`

创建设备检测器实例。

####  参数

-  **options**  (`DeviceDetectorOptions`,  可选):  配置选项
  -  **enableResize**  (`boolean`,  默认:  `true`):  是否启用窗口大小变化监听
  -  **enableOrientation**  (`boolean`,  默认:  `true`):  是否启用屏幕方向变化监听
  -  **modules**  (`string[]`,  可选):  要加载的扩展模块列表,如  `['network',  'battery',  'geolocation']`
  -  **breakpoints**  (`object`,  可选):  设备类型断点配置
    -  **mobile**  (`number`,  默认:  `768`):  移动设备最大宽度
    -  **tablet**  (`number`,  默认:  `1024`):  平板设备最大宽度
  -  **debounceDelay**  (`number`,  默认:  `100`):  事件防抖时间(毫秒)

####  示例

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

//  基础配置
const  detector  =  new  DeviceDetector()

//  完整配置
const  detector  =  new  DeviceDetector({
  enableResize:  true,
  enableOrientation:  true,
  modules:  ['network',  'battery'],
  breakpoints:  {
    mobile:  768,
    tablet:  1024
  },
  debounceDelay:  200
})
```

##  属性

DeviceDetector  继承自  EventEmitter,所有  EventEmitter  的方法都可使用。

##  方法

###  设备信息获取

####  `getDeviceInfo():  DeviceInfo`

获取完整的设备信息对象。

**返回值:**  `DeviceInfo`  -  包含设备类型、屏幕信息、浏览器、操作系统等完整信息

**示例:**

```typescript
const  deviceInfo  =  detector.getDeviceInfo()

console.log('设备类型:',  deviceInfo.type)                //  'mobile'  |  'tablet'  |  'desktop'
console.log('屏幕宽度:',  deviceInfo.width)                //  1920
console.log('屏幕高度:',  deviceInfo.height)              //  1080
console.log('像素比:',  deviceInfo.pixelRatio)            //  2
console.log('浏览器:',  deviceInfo.browser.name)          //  'Chrome'
console.log('操作系统:',  deviceInfo.os.name)              //  'Windows'
console.log('是否支持触摸:',  deviceInfo.features.touch)  //  false
```

####  `getDeviceType():  DeviceType`

获取当前设备类型。

**返回值:**  `'desktop'  |  'tablet'  |  'mobile'`

**示例:**

```typescript
const  type  =  detector.getDeviceType()
if  (type  ===  'mobile')  {
  console.log('这是移动设备')
}
```

####  `getOrientation():  Orientation`

获取当前屏幕方向。

**返回值:**  `'portrait'  |  'landscape'`

**示例:**

```typescript
const  orientation  =  detector.getOrientation()
if  (orientation  ===  'portrait')  {
  console.log('竖屏模式')
}
```

####  `isMobile():  boolean`

检查是否为移动设备。

**返回值:**  `boolean`

**示例:**

```typescript
if  (detector.isMobile())  {
  //  加载移动端资源
}
```

####  `isTablet():  boolean`

检查是否为平板设备。

**返回值:**  `boolean`

####  `isDesktop():  boolean`

检查是否为桌面设备。

**返回值:**  `boolean`

####  `isTouchDevice():  boolean`

检查是否为触摸设备。

**返回值:**  `boolean`

**示例:**

```typescript
if  (detector.isTouchDevice())  {
  //  启用触摸优化
  console.log('支持触摸操作')
}
```

###  模块管理

####  `loadModule<T>(name:  string):  Promise<T>`

动态加载扩展模块并返回模块实例。

**参数:**
-  **name**  (`string`):  模块名称,支持:  `'network'`,  `'battery'`,  `'geolocation'`,  `'feature'`,  `'performance'`,  `'media'`

**返回值:**  `Promise<T>`  -  模块实例

**示例:**

```typescript
//  加载网络模块
const  networkModule  =  await  detector.loadModule('network')
console.log('在线状态:',  networkModule.isOnline())

//  加载电池模块
const  batteryModule  =  await  detector.loadModule('battery')
console.log('电量:',  batteryModule.getLevelPercentage()  +  '%')

//  加载地理位置模块
const  geoModule  =  await  detector.loadModule('geolocation')
const  position  =  await  geoModule.getCurrentPosition()
console.log('位置:',  position.latitude,  position.longitude)
```

####  `unloadModule(name:  string):  Promise<void>`

卸载指定的扩展模块。

**参数:**
-  **name**  (`string`):  模块名称

**示例:**

```typescript
await  detector.unloadModule('network')
```

####  `isModuleLoaded(name:  string):  boolean`

检查模块是否已加载。

**参数:**
-  **name**  (`string`):  模块名称

**返回值:**  `boolean`

**示例:**

```typescript
if  (detector.isModuleLoaded('network'))  {
  console.log('网络模块已加载')
}
```

####  `getLoadedModules():  string[]`

获取所有已加载的模块名称列表。

**返回值:**  `string[]`

**示例:**

```typescript
const  modules  =  detector.getLoadedModules()
console.log('已加载模块:',  modules)  //  ['network',  'battery']
```

###  其他方法

####  `refresh():  void`

强制刷新设备信息,立即重新检测。

**示例:**

```typescript
//  强制刷新设备信息
detector.refresh()
```

####  `getDetectionMetrics():  object`

获取检测性能指标。

**返回值:**  包含以下属性的对象:
-  **detectionCount**  (`number`):  检测次数
-  **averageDetectionTime**  (`number`):  平均检测时间(毫秒)
-  **lastDetectionDuration**  (`number`):  最后一次检测耗时(毫秒)

**示例:**

```typescript
const  metrics  =  detector.getDetectionMetrics()
console.log('检测次数:',  metrics.detectionCount)
console.log('平均耗时:',  metrics.averageDetectionTime.toFixed(2)  +  'ms')
```

####  `destroy():  Promise<void>`

销毁检测器,清理所有资源和事件监听器。

**示例:**

```typescript
//  清理资源
await  detector.destroy()
```

##  事件

DeviceDetector  继承自  EventEmitter,支持以下事件:

###  `deviceChange`

设备类型发生变化时触发。

**回调参数:**  `DeviceInfo`

**示例:**

```typescript
detector.on('deviceChange',  (deviceInfo)  =>  {
  console.log('设备类型变化:',  deviceInfo.type)
  console.log('新的屏幕尺寸:',  deviceInfo.width,  'x',  deviceInfo.height)
})
```

###  `orientationChange`

屏幕方向发生变化时触发。

**回调参数:**  `'portrait'  |  'landscape'`

**示例:**

```typescript
detector.on('orientationChange',  (orientation)  =>  {
  console.log('屏幕方向变化:',  orientation)
  if  (orientation  ===  'landscape')  {
    //  横屏时的处理
  }
})
```

###  `resize`

窗口大小发生变化时触发。

**回调参数:**  `{  width:  number,  height:  number  }`

**示例:**

```typescript
detector.on('resize',  ({  width,  height  })  =>  {
  console.log('窗口尺寸变化:',  width,  'x',  height)
})
```

###  `networkChange`

网络状态发生变化时触发(需要加载  network  模块)。

**回调参数:**  `NetworkInfo`

**示例:**

```typescript
await  detector.loadModule('network')

detector.on('networkChange',  (info)  =>  {
  console.log('网络状态:',  info.status)
  console.log('连接类型:',  info.type)
  console.log('下载速度:',  info.downlink,  'Mbps')
})
```

###  `batteryChange`

电池状态发生变化时触发(需要加载  battery  模块)。

**回调参数:**  `BatteryInfo`

**示例:**

```typescript
await  detector.loadModule('battery')

detector.on('batteryChange',  (info)  =>  {
  console.log('电量:',  (info.level  *  100).toFixed(0)  +  '%')
  console.log('充电状态:',  info.charging  ?  '充电中'  :  '未充电')
})
```

###  `positionChange`

地理位置发生变化时触发(需要加载  geolocation  模块)。

**回调参数:**  `GeolocationInfo`

**示例:**

```typescript
const  geoModule  =  await  detector.loadModule('geolocation')
geoModule.startWatching()

detector.on('positionChange',  (position)  =>  {
  console.log('纬度:',  position.latitude)
  console.log('经度:',  position.longitude)
  console.log('精度:',  position.accuracy,  '米')
})
```

###  `error`

检测过程中发生错误时触发。

**回调参数:**  `{  message:  string,  count:  number,  lastError:  unknown  }`

**示例:**

```typescript
detector.on('error',  (error)  =>  {
  console.error('检测错误:',  error.message)
  console.log('错误次数:',  error.count)
})
```

##  完整示例

###  基础使用

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

//  创建检测器
const  detector  =  new  DeviceDetector({
  enableResize:  true,
  enableOrientation:  true,
  breakpoints:  {
    mobile:  768,
    tablet:  1024
  }
})

//  获取设备信息
const  info  =  detector.getDeviceInfo()
console.log('设备类型:',  info.type)
console.log('浏览器:',  info.browser.name,  info.browser.version)
console.log('操作系统:',  info.os.name,  info.os.version)

//  监听变化
detector.on('deviceChange',  (deviceInfo)  =>  {
  console.log('设备信息更新:',  deviceInfo)
})

detector.on('orientationChange',  (orientation)  =>  {
  console.log('方向变化:',  orientation)
})

//  条件判断
if  (detector.isMobile())  {
  console.log('移动端界面')
}  else  if  (detector.isDesktop())  {
  console.log('桌面端界面')
}
```

###  模块加载示例

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

const  detector  =  new  DeviceDetector()

//  加载网络模块
const  networkModule  =  await  detector.loadModule('network')
detector.on('networkChange',  (info)  =>  {
  if  (info.status  ===  'offline')  {
    alert('网络已断开')
  }
})

//  加载电池模块
const  batteryModule  =  await  detector.loadModule('battery')
if  (batteryModule.isLowBattery(0.2))  {
  console.warn('电量不足  20%')
}

detector.on('batteryChange',  (info)  =>  {
  if  (info.level  <  0.1  &&  !info.charging)  {
    alert('电量严重不足,请充电')
  }
})

//  加载地理位置模块
const  geoModule  =  await  detector.loadModule('geolocation')
if  (geoModule.isSupported())  {
  try  {
    const  position  =  await  geoModule.getCurrentPosition()
    console.log('当前位置:',  position.latitude,  position.longitude)

    //  监听位置变化
    geoModule.startWatching((pos)  =>  {
      console.log('位置更新:',  pos)
    })
  }  catch  (error)  {
    console.error('获取位置失败:',  error)
  }
}

//  清理资源
window.addEventListener('beforeunload',  async  ()  =>  {
  await  detector.destroy()
})
```

###  性能监控示例

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

const  detector  =  new  DeviceDetector()

//  获取性能指标
setInterval(()  =>  {
  const  metrics  =  detector.getDetectionMetrics()
  console.log('性能指标:',  {
    检测次数:  metrics.detectionCount,
    平均耗时:  metrics.averageDetectionTime.toFixed(2)  +  'ms',
    最后耗时:  metrics.lastDetectionDuration.toFixed(2)  +  'ms'
  })
},  5000)
```

##  类型定义

```typescript
interface  DeviceDetectorOptions  {
  enableResize?:  boolean
  enableOrientation?:  boolean
  breakpoints?:  {
    mobile:  number
    tablet:  number
  }
  debounceDelay?:  number
  modules?:  string[]
}

interface  DeviceInfo  {
  type:  'desktop'  |  'tablet'  |  'mobile'
  orientation:  'portrait'  |  'landscape'
  width:  number
  height:  number
  pixelRatio:  number
  isTouchDevice:  boolean
  userAgent:  string
  os:  {
    name:  string
    version:  string
    platform?:  string
  }
  browser:  {
    name:  string
    version:  string
    engine?:  string
  }
  screen:  {
    width:  number
    height:  number
    pixelRatio:  number
    availWidth:  number
    availHeight:  number
  }
  features:  {
    touch:  boolean
    webgl?:  boolean
    camera?:  boolean
    microphone?:  boolean
    bluetooth?:  boolean
  }
}
```

##  注意事项

1.  **性能优化**:  DeviceDetector  内部使用了多种性能优化策略,包括缓存、防抖、频率限制等
2.  **内存管理**:  使用完毕后应调用  `destroy()`  方法清理资源
3.  **模块加载**:  模块是按需加载的,只有调用  `loadModule()`  时才会加载对应模块
4.  **事件桥接**:  模块的事件会自动桥接到  DeviceDetector,可以直接在  detector  上监听
5.  **浏览器兼容**:  部分功能依赖现代浏览器  API,在旧浏览器中可能不可用
6.  **服务端渲染**:  在  SSR  环境中会返回默认值,不会抛出错误

##  相关链接

-  [EventEmitter  API](./event-emitter.md)
-  [ModuleLoader  API](./module-loader.md)
-  [类型定义](./types.md)
-  [返回首页](./index.md)
