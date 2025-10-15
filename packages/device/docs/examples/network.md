#  网络状态监听示例

本文档展示如何使用  @ldesign/device  库监听和处理网络状态变化，实现离线提示、网络类型判断、自适应媒体质量和省流量模式等功能。

##  场景描述

网络状态监听在现代  Web  应用中非常重要，可以帮助我们：

-  **离线检测**：实时检测用户网络连接状态，提供离线提示
-  **网络类型判断**：识别用户使用  WiFi、4G  还是慢速网络
-  **自适应加载**：根据网络速度调整资源加载策略
-  **省流量模式**：在用户开启省流量模式时降低数据使用
-  **用户体验优化**：在网络较差时提供降级方案

##  效果预览说明

实现本示例后，您的应用将能够：

1.  实时显示网络连接状态（在线/离线）
2.  展示当前网络类型（WiFi、4G、3G  等）
3.  根据网络速度自动调整图片和视频质量
4.  在离线时显示缓存内容或友好提示
5.  支持用户手动开启省流量模式

---

##  Vue  3  实现方式

###  1.  基础网络状态监听

使用  `useNetwork`  composable  获取网络信息：

```vue
<script  setup  lang="ts">
import  {  onMounted,  ref,  computed  }  from  'vue'
import  {  useNetwork  }  from  '@ldesign/device/vue'

//  获取网络状态信息
const  {
    networkInfo,            //  完整的网络信息对象
    isOnline,                  //  是否在线
    connectionType,      //  连接类型
    isLoaded,                  //  模块是否已加载
    loadModule,              //  加载网络模块
    unloadModule,          //  卸载网络模块
}  =  useNetwork()

//  加载网络模块
onMounted(async  ()  =>  {
    try  {
        await  loadModule()
        console.log('网络模块加载成功')
    }  catch  (error)  {
        console.warn('网络模块加载失败:',  error)
    }
})

//  计算网络质量
const  networkQuality  =  computed(()  =>  {
    if  (!isOnline.value)  return  'offline'
    if  (!networkInfo.value)  return  'unknown'

    const  type  =  networkInfo.value.type
    if  (type  ===  'wifi'  ||  type  ===  'ethernet')  return  'excellent'
    if  (type  ===  'cellular')  {
        const  effectiveType  =  networkInfo.value.effectiveType
        if  (effectiveType  ===  '4g')  return  'good'
        if  (effectiveType  ===  '3g')  return  'fair'
        return  'poor'
    }
    return  'unknown'
})

//  计算网络质量描述
const  networkQualityText  =  computed(()  =>  {
    const  qualityMap  =  {
        offline:  '离线',
        excellent:  '优秀',
        good:  '良好',
        fair:  '一般',
        poor:  '较差',
        unknown:  '未知',
    }
    return  qualityMap[networkQuality.value]  ||  '未知'
})

//  是否开启省流量模式
const  saveDataMode  =  computed(()  =>  networkInfo.value?.saveData  ??  false)

//  网络速度信息
const  networkSpeed  =  computed(()  =>  {
    if  (!networkInfo.value)  return  null
    return  {
        downlink:  networkInfo.value.downlink  ??  0,      //  下载速度  (Mbps)
        rtt:  networkInfo.value.rtt  ??  0,                      //  往返时间  (ms)
    }
})
</script>

<template>
    <div  class="network-status">
        <!--  加载状态  -->
        <div  v-if="!isLoaded"  class="loading">
            <p>正在加载网络模块...</p>
        </div>

        <!--  网络信息面板  -->
        <div  v-else  class="network-panel">
            <!--  连接状态  -->
            <div  class="status-card"  :class="{ offline: !isOnline }">
                <div  class="status-icon">
                    {{  isOnline  ?  '🌐'  :  '📡'  }}
                </div>
                <div  class="status-content">
                    <h3>连接状态</h3>
                    <p  class="status-text">
                        {{  isOnline  ?  '在线'  :  '离线'  }}
                    </p>
                </div>
            </div>

            <!--  网络类型  -->
            <div  v-if="isOnline"  class="status-card">
                <div  class="status-icon">📶</div>
                <div  class="status-content">
                    <h3>网络类型</h3>
                    <p  class="status-text">
                        {{  connectionType  }}
                    </p>
                </div>
            </div>

            <!--  网络质量  -->
            <div  v-if="isOnline"  class="status-card"  :class="`quality-${networkQuality}`">
                <div  class="status-icon">
                    {{  networkQuality  ===  'excellent'  ?  '⚡'  :
                            networkQuality  ===  'good'  ?  '✓'  :
                            networkQuality  ===  'fair'  ?  '⚠'  :  '❌'  }}
                </div>
                <div  class="status-content">
                    <h3>网络质量</h3>
                    <p  class="status-text">
                        {{  networkQualityText  }}
                    </p>
                </div>
            </div>

            <!--  网络速度  -->
            <div  v-if="isOnline  &&  networkSpeed"  class="status-card">
                <div  class="status-icon">🚀</div>
                <div  class="status-content">
                    <h3>网络速度</h3>
                    <p  class="status-text">
                        下载:  {{  networkSpeed.downlink  }}  Mbps<br>
                        延迟:  {{  networkSpeed.rtt  }}  ms
                    </p>
                </div>
            </div>

            <!--  省流量模式  -->
            <div  v-if="saveDataMode"  class="alert alert-warning">
                💾  省流量模式已开启
            </div>

            <!--  离线提示  -->
            <div  v-if="!isOnline"  class="alert alert-error">
                📡  您当前处于离线状态，部分功能可能无法使用
            </div>
        </div>
    </div>
</template>

<style  scoped>
.network-status  {
    max-width:  1200px;
    margin:  0  auto;
    padding:  20px;
}

.loading  {
    text-align:  center;
    padding:  40px;
    color:  #666;
}

.network-panel  {
    display:  grid;
    grid-template-columns:  repeat(auto-fit,  minmax(250px,  1fr));
    gap:  20px;
}

.status-card  {
    background:  white;
    border-radius:  12px;
    padding:  24px;
    box-shadow:  0  2px  8px  rgba(0,  0,  0,  0.1);
    display:  flex;
    align-items:  center;
    gap:  16px;
    transition:  all  0.3s  ease;
}

.status-card:hover  {
    transform:  translateY(-4px);
    box-shadow:  0  4px  16px  rgba(0,  0,  0,  0.15);
}

.status-card.offline  {
    border-left:  4px  solid  #f44336;
}

.status-card.quality-excellent  {
    border-left:  4px  solid  #4caf50;
}

.status-card.quality-good  {
    border-left:  4px  solid  #8bc34a;
}

.status-card.quality-fair  {
    border-left:  4px  solid  #ff9800;
}

.status-card.quality-poor  {
    border-left:  4px  solid  #f44336;
}

.status-icon  {
    font-size:  48px;
}

.status-content  h3  {
    margin:  0  0  8px  0;
    font-size:  14px;
    color:  #666;
    font-weight:  500;
}

.status-text  {
    margin:  0;
    font-size:  18px;
    font-weight:  600;
    color:  #333;
}

.alert  {
    grid-column:  1  /  -1;
    padding:  16px  20px;
    border-radius:  8px;
    font-size:  14px;
    display:  flex;
    align-items:  center;
    gap:  12px;
}

.alert-warning  {
    background:  #fff3cd;
    color:  #856404;
    border:  1px  solid  #ffc107;
}

.alert-error  {
    background:  #f8d7da;
    color:  #721c24;
    border:  1px  solid  #f44336;
}

@media  (max-width:  768px)  {
    .network-panel  {
        grid-template-columns:  1fr;
    }
}
</style>
```

###  2.  自适应媒体加载

根据网络状态自动调整图片和视频质量：

```vue
<script  setup  lang="ts">
import  {  computed,  onMounted  }  from  'vue'
import  {  useNetwork  }  from  '@ldesign/device/vue'

interface  MediaProps  {
    src:  {
        high:  string          //  高清版本
        medium:  string      //  中等质量
        low:  string            //  低质量
    }
    alt?:  string
    type?:  'image'  |  'video'
}

const  props  =  defineProps<MediaProps>()

const  {  networkInfo,  isOnline,  loadModule  }  =  useNetwork()

onMounted(()  =>  {
    loadModule()
})

//  根据网络状况选择合适的媒体源
const  mediaSrc  =  computed(()  =>  {
    //  离线状态使用最低质量
    if  (!isOnline.value)  {
        return  props.src.low
    }

    //  没有网络信息时使用中等质量
    if  (!networkInfo.value)  {
        return  props.src.medium
    }

    const  type  =  networkInfo.value.type
    const  saveData  =  networkInfo.value.saveData
    const  downlink  =  networkInfo.value.downlink  ??  0

    //  省流量模式优先使用低质量
    if  (saveData)  {
        return  props.src.low
    }

    //  WiFi  或以太网使用高清
    if  (type  ===  'wifi'  ||  type  ===  'ethernet')  {
        return  props.src.high
    }

    //  根据下载速度选择
    if  (downlink  >  5)  {
        return  props.src.high          //  >  5Mbps  使用高清
    }  else  if  (downlink  >  2)  {
        return  props.src.medium      //  >  2Mbps  使用中等质量
    }  else  {
        return  props.src.low            //  <  2Mbps  使用低质量
    }
})

//  质量标识
const  qualityLabel  =  computed(()  =>  {
    if  (mediaSrc.value  ===  props.src.high)  return  'HD'
    if  (mediaSrc.value  ===  props.src.medium)  return  'SD'
    return  'LD'
})

//  是否显示质量提示
const  showQualityTip  =  computed(()  =>  {
    return  mediaSrc.value  !==  props.src.high
})
</script>

<template>
    <div  class="adaptive-media">
        <!--  图片类型  -->
        <div  v-if="type  ===  'image'"  class="media-container">
            <img
                :src="mediaSrc"
                :alt="alt"
                class="adaptive-image"
                loading="lazy"
            />
            <div  v-if="showQualityTip"  class="quality-badge">
                {{  qualityLabel  }}
            </div>
        </div>

        <!--  视频类型  -->
        <div  v-else  class="media-container">
            <video
                :src="mediaSrc"
                class="adaptive-video"
                controls
                preload="metadata"
            />
            <div  v-if="showQualityTip"  class="quality-badge">
                {{  qualityLabel  }}
            </div>
        </div>

        <!--  网络提示  -->
        <div  v-if="!isOnline"  class="media-tip offline-tip">
            离线模式  -  显示缓存内容
        </div>
        <div  v-else-if="networkInfo?.saveData"  class="media-tip">
            省流量模式  -  已降低媒体质量
        </div>
    </div>
</template>

<style  scoped>
.adaptive-media  {
    position:  relative;
    width:  100%;
}

.media-container  {
    position:  relative;
    width:  100%;
    border-radius:  8px;
    overflow:  hidden;
}

.adaptive-image,
.adaptive-video  {
    width:  100%;
    height:  auto;
    display:  block;
}

.quality-badge  {
    position:  absolute;
    top:  12px;
    right:  12px;
    background:  rgba(0,  0,  0,  0.7);
    color:  white;
    padding:  4px  12px;
    border-radius:  4px;
    font-size:  12px;
    font-weight:  600;
}

.media-tip  {
    margin-top:  8px;
    padding:  8px  12px;
    background:  #fff3cd;
    color:  #856404;
    border-radius:  4px;
    font-size:  13px;
}

.offline-tip  {
    background:  #f8d7da;
    color:  #721c24;
}
</style>
```

###  3.  网络感知的数据加载组件

实现一个能够根据网络状况智能加载数据的组件：

```vue
<script  setup  lang="ts">
import  {  ref,  computed,  watch,  onMounted  }  from  'vue'
import  {  useNetwork  }  from  '@ldesign/device/vue'

interface  DataItem  {
    id:  number
    title:  string
    description:  string
    image:  string
    largeData?:  any  //  可选的大量数据
}

const  {  networkInfo,  isOnline,  loadModule  }  =  useNetwork()

//  数据列表
const  items  =  ref<DataItem[]>([])
const  loading  =  ref(false)
const  error  =  ref<string  |  null>(null)

//  是否启用智能加载
const  smartLoadEnabled  =  ref(true)

//  根据网络状况决定加载策略
const  shouldLoadLargeData  =  computed(()  =>  {
    if  (!smartLoadEnabled.value)  return  true
    if  (!isOnline.value)  return  false
    if  (!networkInfo.value)  return  true

    const  type  =  networkInfo.value.type
    const  saveData  =  networkInfo.value.saveData
    const  downlink  =  networkInfo.value.downlink  ??  0

    //  省流量模式不加载大数据
    if  (saveData)  return  false

    //  WiFi  或高速网络才加载大数据
    return  (type  ===  'wifi'  ||  type  ===  'ethernet'  ||  downlink  >  3)
})

//  加载数据的函数
const  loadData  =  async  ()  =>  {
    loading.value  =  true
    error.value  =  null

    try  {
        //  模拟  API  请求
        await  new  Promise(resolve  =>  setTimeout(resolve,  1000))

        //  根据网络状况决定加载的数据量
        const  endpoint  =  shouldLoadLargeData.value
            ?  '/api/data?full=true'
            :  '/api/data?minimal=true'

        console.log('从接口加载数据:',  endpoint)

        //  模拟数据
        items.value  =  Array.from({  length:  10  },  (\_,  i)  =>  ({
            id:  i  +  1,
            title:  `项目  ${i  +  1}`,
            description:  shouldLoadLargeData.value
                ?  `这是完整的描述信息，包含更多细节...`
                :  `简短描述`,
            image:  shouldLoadLargeData.value
                ?  `https://via.placeholder.com/400x300`
                :  `https://via.placeholder.com/200x150`,
            largeData:  shouldLoadLargeData.value  ?  {  /*  ...大量数据  */  }  :  undefined,
        }))
    }  catch  (err)  {
        error.value  =  err  instanceof  Error  ?  err.message  :  '加载失败'
    }  finally  {
        loading.value  =  false
    }
}

//  初始化
onMounted(async  ()  =>  {
    await  loadModule()
    await  loadData()
})

//  监听网络状态变化，自动重新加载
watch([isOnline,  networkInfo],  ()  =>  {
    if  (smartLoadEnabled.value)  {
        loadData()
    }
},  {  deep:  true  })

//  切换智能加载模式
const  toggleSmartLoad  =  ()  =>  {
    smartLoadEnabled.value  =  !smartLoadEnabled.value
    if  (smartLoadEnabled.value)  {
        loadData()
    }
}
</script>

<template>
    <div  class="network-aware-loader">
        <!--  控制面板  -->
        <div  class="control-panel">
            <div  class="control-item">
                <label>
                    <input
                        type="checkbox"
                        :checked="smartLoadEnabled"
                        @change="toggleSmartLoad"
                    />
                    启用智能加载
                </label>
            </div>
            <div  class="control-item">
                <span  class="status-text">
                    当前策略：{{  shouldLoadLargeData  ?  '完整数据'  :  '精简数据'  }}
                </span>
            </div>
            <button  @click="loadData"  class="reload-btn"  :disabled="loading">
                {{  loading  ?  '加载中...'  :  '重新加载'  }}
            </button>
        </div>

        <!--  网络提示  -->
        <div  v-if="!isOnline"  class="alert alert-offline">
            当前离线，显示缓存数据
        </div>
        <div  v-else-if="networkInfo?.saveData"  class="alert alert-savedata">
            省流量模式已开启，已减少数据传输
        </div>

        <!--  加载状态  -->
        <div  v-if="loading"  class="loading-state">
            <div  class="spinner"></div>
            <p>正在加载数据...</p>
        </div>

        <!--  错误状态  -->
        <div  v-else-if="error"  class="error-state">
            <p>❌  加载失败：{{  error  }}</p>
            <button  @click="loadData"  class="retry-btn">重试</button>
        </div>

        <!--  数据列表  -->
        <div  v-else  class="data-list">
            <div
                v-for="item  in  items"
                :key="item.id"
                class="data-item"
            >
                <img  :src="item.image"  :alt="item.title"  class="item-image"  />
                <div  class="item-content">
                    <h3>{{  item.title  }}</h3>
                    <p>{{  item.description  }}</p>
                    <span  v-if="item.largeData"  class="badge">完整数据</span>
                    <span  v-else  class="badge  badge-minimal">精简版</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style  scoped>
.network-aware-loader  {
    max-width:  1200px;
    margin:  0  auto;
    padding:  20px;
}

.control-panel  {
    background:  white;
    padding:  20px;
    border-radius:  8px;
    margin-bottom:  20px;
    display:  flex;
    gap:  20px;
    align-items:  center;
    flex-wrap:  wrap;
    box-shadow:  0  2px  4px  rgba(0,  0,  0,  0.1);
}

.control-item  {
    display:  flex;
    align-items:  center;
}

.control-item  label  {
    display:  flex;
    align-items:  center;
    gap:  8px;
    cursor:  pointer;
}

.status-text  {
    color:  #666;
    font-size:  14px;
}

.reload-btn  {
    padding:  8px  20px;
    background:  #2196f3;
    color:  white;
    border:  none;
    border-radius:  4px;
    cursor:  pointer;
    font-size:  14px;
    transition:  background  0.2s;
}

.reload-btn:hover:not(:disabled)  {
    background:  #1976d2;
}

.reload-btn:disabled  {
    opacity:  0.6;
    cursor:  not-allowed;
}

.alert  {
    padding:  12px  16px;
    border-radius:  6px;
    margin-bottom:  20px;
    font-size:  14px;
}

.alert-offline  {
    background:  #f8d7da;
    color:  #721c24;
    border:  1px  solid  #f44336;
}

.alert-savedata  {
    background:  #fff3cd;
    color:  #856404;
    border:  1px  solid  #ffc107;
}

.loading-state  {
    text-align:  center;
    padding:  60px  20px;
}

.spinner  {
    width:  40px;
    height:  40px;
    border:  4px  solid  #f3f3f3;
    border-top:  4px  solid  #2196f3;
    border-radius:  50%;
    margin:  0  auto  16px;
    animation:  spin  1s  linear  infinite;
}

@keyframes  spin  {
    0%  {  transform:  rotate(0deg);  }
    100%  {  transform:  rotate(360deg);  }
}

.error-state  {
    text-align:  center;
    padding:  60px  20px;
    color:  #f44336;
}

.retry-btn  {
    margin-top:  16px;
    padding:  10px  24px;
    background:  #f44336;
    color:  white;
    border:  none;
    border-radius:  4px;
    cursor:  pointer;
}

.data-list  {
    display:  grid;
    grid-template-columns:  repeat(auto-fill,  minmax(300px,  1fr));
    gap:  20px;
}

.data-item  {
    background:  white;
    border-radius:  8px;
    overflow:  hidden;
    box-shadow:  0  2px  8px  rgba(0,  0,  0,  0.1);
    transition:  transform  0.2s;
}

.data-item:hover  {
    transform:  translateY(-4px);
}

.item-image  {
    width:  100%;
    height:  200px;
    object-fit:  cover;
}

.item-content  {
    padding:  16px;
}

.item-content  h3  {
    margin:  0  0  8px  0;
    font-size:  18px;
    color:  #333;
}

.item-content  p  {
    margin:  0  0  12px  0;
    color:  #666;
    font-size:  14px;
    line-height:  1.6;
}

.badge  {
    display:  inline-block;
    padding:  4px  12px;
    background:  #4caf50;
    color:  white;
    border-radius:  4px;
    font-size:  12px;
    font-weight:  600;
}

.badge-minimal  {
    background:  #ff9800;
}

@media  (max-width:  768px)  {
    .data-list  {
        grid-template-columns:  1fr;
    }
}
</style>
```

---

##  原生  JavaScript  实现方式

###  网络状态监听器

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

/**
  *  网络状态管理器
  */
class  NetworkStatusManager  {
    private  detector:  DeviceDetector
    private  networkModule:  any
    private  callbacks:  Map<string,  Set<Function>>  =  new  Map()

    constructor()  {
        this.detector  =  new  DeviceDetector()
        this.init()
    }

    private  async  init()  {
        try  {
            //  加载网络模块
            this.networkModule  =  await  this.detector.loadModule('network')

            //  监听网络变化
            this.detector.on('networkChange',  (info)  =>  {
                this.emit('statusChange',  info)

                //  触发特定事件
                if  (info.status  ===  'offline')  {
                    this.emit('offline',  info)
                }  else  {
                    this.emit('online',  info)
                }
            })

            console.log('网络模块初始化成功')
        }  catch  (error)  {
            console.error('网络模块加载失败:',  error)
        }
    }

    /**
      *  获取当前网络信息
      */
    getNetworkInfo()  {
        if  (!this.networkModule)  return  null
        return  this.networkModule.getData()
    }

    /**
      *  检查是否在线
      */
    isOnline():  boolean  {
        if  (!this.networkModule)  return  navigator.onLine
        return  this.networkModule.isOnline()
    }

    /**
      *  获取连接类型
      */
    getConnectionType():  string  {
        if  (!this.networkModule)  return  'unknown'
        return  this.networkModule.getConnectionType()
    }

    /**
      *  判断是否为快速网络
      */
    isFastNetwork():  boolean  {
        const  info  =  this.getNetworkInfo()
        if  (!info)  return  true

        const  type  =  info.type
        const  downlink  =  info.downlink  ??  0

        return  (
            type  ===  'wifi'  ||
            type  ===  'ethernet'  ||
            downlink  >  5
        )
    }

    /**
      *  判断是否为慢速网络
      */
    isSlowNetwork():  boolean  {
        const  info  =  this.getNetworkInfo()
        if  (!info)  return  false

        const  downlink  =  info.downlink  ??  10
        return  downlink  <  2
    }

    /**
      *  获取推荐的媒体质量
      */
    getRecommendedQuality():  'high'  |  'medium'  |  'low'  {
        const  info  =  this.getNetworkInfo()

        if  (!this.isOnline())  return  'low'
        if  (!info)  return  'medium'

        if  (info.saveData)  return  'low'

        const  type  =  info.type
        const  downlink  =  info.downlink  ??  0

        if  (type  ===  'wifi'  ||  type  ===  'ethernet'  ||  downlink  >  5)  {
            return  'high'
        }  else  if  (downlink  >  2)  {
            return  'medium'
        }  else  {
            return  'low'
        }
    }

    /**
      *  注册事件监听器
      */
    on(event:  string,  callback:  Function)  {
        if  (!this.callbacks.has(event))  {
            this.callbacks.set(event,  new  Set())
        }
        this.callbacks.get(event)!.add(callback)
    }

    /**
      *  移除事件监听器
      */
    off(event:  string,  callback:  Function)  {
        const  callbacks  =  this.callbacks.get(event)
        if  (callbacks)  {
            callbacks.delete(callback)
        }
    }

    /**
      *  触发事件
      */
    private  emit(event:  string,  data:  any)  {
        const  callbacks  =  this.callbacks.get(event)
        if  (callbacks)  {
            callbacks.forEach(callback  =>  callback(data))
        }
    }

    /**
      *  销毁管理器
      */
    async  destroy()  {
        this.callbacks.clear()
        await  this.detector.destroy()
    }
}

//  使用示例
const  networkManager  =  new  NetworkStatusManager()

//  监听网络状态变化
networkManager.on('statusChange',  (info)  =>  {
    console.log('网络状态变化:',  info)
    updateNetworkUI(info)
})

//  监听离线事件
networkManager.on('offline',  ()  =>  {
    console.log('网络已断开')
    showOfflineNotification()
    enableOfflineMode()
})

//  监听上线事件
networkManager.on('online',  ()  =>  {
    console.log('网络已连接')
    hideOfflineNotification()
    syncPendingData()
})

//  获取推荐的媒体质量
const  quality  =  networkManager.getRecommendedQuality()
console.log('推荐媒体质量:',  quality)

//  根据网络状况加载资源
function  loadMediaWithQuality(src:  any)  {
    const  quality  =  networkManager.getRecommendedQuality()
    const  url  =  src[quality]

    console.log(`加载  ${quality}  质量的媒体:`,  url)
    return  url
}

//  辅助函数
function  updateNetworkUI(info:  any)  {
    const  statusEl  =  document.getElementById('network-status')
    if  (statusEl)  {
        statusEl.textContent  =  info.status  ===  'online'  ?  '在线'  :  '离线'
        statusEl.className  =  info.status  ===  'online'  ?  'online'  :  'offline'
    }
}

function  showOfflineNotification()  {
    //  显示离线通知
    alert('网络已断开，正在切换到离线模式')
}

function  hideOfflineNotification()  {
    //  隐藏离线通知
    console.log('网络已恢复')
}

function  enableOfflineMode()  {
    //  启用离线模式
    document.body.classList.add('offline-mode')
}

function  syncPendingData()  {
    //  同步待处理的数据
    console.log('同步离线期间的数据...')
}
```

###  自适应图片加载器

```typescript
/**
  *  自适应图片加载器
  */
class  AdaptiveImageLoader  {
    private  networkManager:  NetworkStatusManager

    constructor(networkManager:  NetworkStatusManager)  {
        this.networkManager  =  networkManager
    }

    /**
      *  加载自适应图片
      */
    loadImage(container:  HTMLElement,  sources:  ImageSources)  {
        const  quality  =  this.networkManager.getRecommendedQuality()
        const  src  =  sources[quality]

        //  创建图片元素
        const  img  =  document.createElement('img')
        img.src  =  src
        img.alt  =  sources.alt  ||  ''
        img.className  =  'adaptive-image'

        //  添加加载状态
        container.classList.add('loading')

        //  加载完成
        img.onload  =  ()  =>  {
            container.classList.remove('loading')
            container.classList.add('loaded')
            container.appendChild(img)

            //  添加质量标识
            if  (quality  !==  'high')  {
                this.addQualityBadge(container,  quality)
            }
        }

        //  加载失败
        img.onerror  =  ()  =>  {
            container.classList.remove('loading')
            container.classList.add('error')
            container.innerHTML  =  '<p>图片加载失败</p>'
        }

        return  img
    }

    /**
      *  批量加载图片
      */
    loadImages(selector:  string,  sourcesMap:  Map<string,  ImageSources>)  {
        const  containers  =  document.querySelectorAll(selector)

        containers.forEach((container,  index)  =>  {
            const  sources  =  sourcesMap.get(`image-${index}`)
            if  (sources)  {
                this.loadImage(container  as  HTMLElement,  sources)
            }
        })
    }

    /**
      *  添加质量标识
      */
    private  addQualityBadge(container:  HTMLElement,  quality:  string)  {
        const  badge  =  document.createElement('div')
        badge.className  =  'quality-badge'
        badge.textContent  =  quality.toUpperCase()
        container.appendChild(badge)
    }

    /**
      *  预加载图片
      */
    preloadImage(src:  string):  Promise<void>  {
        return  new  Promise((resolve,  reject)  =>  {
            const  img  =  new  Image()
            img.onload  =  ()  =>  resolve()
            img.onerror  =  reject
            img.src  =  src
        })
    }

    /**
      *  智能预加载（根据网络状况）
      */
    async  smartPreload(sources:  ImageSources[])  {
        const  quality  =  this.networkManager.getRecommendedQuality()

        //  只在快速网络时预加载
        if  (quality  ===  'high'  &&  this.networkManager.isFastNetwork())  {
            const  promises  =  sources.map(src  =>
                this.preloadImage(src[quality])
            )
            await  Promise.all(promises)
            console.log('图片预加载完成')
        }  else  {
            console.log('网络较慢，跳过预加载')
        }
    }
}

interface  ImageSources  {
    high:  string
    medium:  string
    low:  string
    alt?:  string
}

//  使用示例
const  networkManager  =  new  NetworkStatusManager()
const  imageLoader  =  new  AdaptiveImageLoader(networkManager)

//  加载单张图片
const  container  =  document.getElementById('image-container')
if  (container)  {
    imageLoader.loadImage(container,  {
        high:  'https://example.com/image-hd.jpg',
        medium:  'https://example.com/image-md.jpg',
        low:  'https://example.com/image-ld.jpg',
        alt:  '示例图片',
    })
}

//  批量加载图片
const  imagesMap  =  new  Map<string,  ImageSources>()
imagesMap.set('image-0',  {
    high:  '/images/1-hd.jpg',
    medium:  '/images/1-md.jpg',
    low:  '/images/1-ld.jpg',
})
imagesMap.set('image-1',  {
    high:  '/images/2-hd.jpg',
    medium:  '/images/2-md.jpg',
    low:  '/images/2-ld.jpg',
})

imageLoader.loadImages('.image-container',  imagesMap)
```

---

##  代码解释

###  关键概念

1.  **网络模块按需加载**：使用  `loadModule('network')`  加载网络检测功能
2.  **实时监听**：通过事件系统监听网络状态变化
3.  **智能策略**：根据网络类型、速度、省流量模式等因素决定加载策略
4.  **优雅降级**：在网络较差或离线时提供降级方案

###  网络质量判断逻辑

-  **优秀**：WiFi  或以太网连接
-  **良好**：4G  移动网络
-  **一般**：3G  移动网络
-  **较差**：2G  或更慢的网络

---

##  扩展建议

1.  **离线缓存**
      ```typescript
      //  使用  Service  Worker  缓存资源
      if  ('serviceWorker'  in  navigator)  {
          navigator.serviceWorker.register('/sw.js')
      }
      ```

2.  **断点续传**
      ```typescript
      //  实现大文件的断点续传
      class  ResumableUploader  {
          upload(file:  File,  onProgress:  Function)  {
              //  分片上传逻辑
          }
      }
      ```

3.  **智能重试**
      ```typescript
      //  网络恢复后自动重试失败的请求
      async  function  fetchWithRetry(url:  string,  options:  RequestInit)  {
          let  retries  =  3
          while  (retries  >  0)  {
              try  {
                  return  await  fetch(url,  options)
              }  catch  (error)  {
                  retries--
                  if  (retries  ===  0)  throw  error
                  await  new  Promise(resolve  =>  setTimeout(resolve,  1000))
              }
          }
      }
      ```

4.  **网络预测**
      ```typescript
      //  基于历史数据预测网络趋势
      class  NetworkPredictor  {
          predictQuality(history:  any[])  {
              //  机器学习预测逻辑
          }
      }
      ```

---

##  最佳实践

1.  **优先考虑离线体验**：设计时考虑离线场景
2.  **提供反馈**：让用户知道当前网络状态
3.  **避免强制高清**：给用户选择权
4.  **智能预加载**：只在快速网络时预加载
5.  **监控网络变化**：实时响应网络状况变化

---

##  相关链接

-  [基础使用示例](./index.md)  -  设备检测基础
-  [响应式设计示例](./responsive.md)  -  响应式布局
-  [电池监控示例](./battery.md)  -  电池状态监控
-  [地理位置示例](./geolocation.md)  -  地理位置获取
-  [API  参考文档](../api/)  -  完整  API  文档
