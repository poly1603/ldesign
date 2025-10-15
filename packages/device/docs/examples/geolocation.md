#  地理位置示例

本文档展示如何使用  @ldesign/device  库获取和监听设备地理位置信息，实现当前位置获取、实时位置跟踪、地图定位和附近搜索等功能。

##  场景描述

地理位置功能在许多应用中都非常重要，可以实现：

-  **位置获取**：获取用户当前的地理坐标
-  **实时跟踪**：持续监听用户位置变化
-  **地图定位**：在地图上标记用户位置
-  **附近搜索**：基于位置提供本地化服务
-  **导航功能**：提供路线规划和导航
-  **位置分享**：允许用户分享当前位置

##  效果预览说明

实现本示例后，您的应用将能够：

1.  一键获取用户当前位置（经纬度）
2.  显示位置精度和其他位置信息
3.  实时追踪用户移动轨迹
4.  在地图上显示用户位置
5.  计算两点之间的距离
6.  处理定位权限和错误情况

---

##  Vue  3  实现方式

###  1.  基础位置获取

使用  `useGeolocation`  composable  获取地理位置：

```vue
<script  setup  lang="ts">
import  {  onMounted,  computed  }  from  'vue'
import  {  useGeolocation  }  from  '@ldesign/device/vue'

//  获取地理位置信息
const  {
    position,                            //  完整的位置信息对象
    latitude,                            //  纬度
    longitude,                        //  经度
    accuracy,                            //  精度（米）
    altitude,                            //  海拔（米）
    heading,                                //  方向（度）
    speed,                                    //  速度（米/秒）
    error,                                    //  错误信息
    isSupported,                    //  是否支持地理位置  API
    isWatching,                        //  是否正在监听位置变化
    isLoaded,                            //  模块是否已加载
    isLoading,                        //  是否正在加载
    hasPosition,                    //  是否已获取到位置
    isHighAccuracy,        //  是否为高精度定位
    coordinates,                    //  坐标对象  {  lat,  lng  }
    loadModule,                        //  加载地理位置模块
    getCurrentPosition,  //  获取当前位置
    startWatching,            //  开始监听位置变化
    stopWatching,                //  停止监听位置变化
}  =  useGeolocation()

//  加载地理位置模块
onMounted(async  ()  =>  {
    try  {
        await  loadModule()
        console.log('地理位置模块加载成功')

        //  自动获取当前位置
        if  (isSupported.value)  {
            await  handleGetLocation()
        }
    }  catch  (err)  {
        console.warn('地理位置模块加载失败:',  err)
    }
})

//  获取位置
const  handleGetLocation  =  async  ()  =>  {
    try  {
        await  getCurrentPosition({
            enableHighAccuracy:  true,        //  高精度模式
            timeout:  10000,                                        //  超时时间  10  秒
            maximumAge:  0,                                            //  不使用缓存
        })
        console.log('位置获取成功:',  position.value)
    }  catch  (err)  {
        console.error('位置获取失败:',  err)
    }
}

//  开始追踪
const  handleStartTracking  =  async  ()  =>  {
    try  {
        await  startWatching()
        console.log('开始追踪位置变化')
    }  catch  (err)  {
        console.error('启动位置追踪失败:',  err)
    }
}

//  停止追踪
const  handleStopTracking  =  ()  =>  {
    stopWatching()
    console.log('停止追踪位置变化')
}

//  格式化坐标显示
const  formatCoordinate  =  (value:  number  |  null,  decimals  =  6)  =>  {
    return  value  ?  value.toFixed(decimals)  :  '-'
}

//  格式化速度（米/秒  转  公里/小时）
const  formatSpeed  =  computed(()  =>  {
    if  (!speed.value)  return  '-'
    const  kmh  =  speed.value  *  3.6
    return  `${kmh.toFixed(1)}  km/h`
})

//  格式化方向
const  formatHeading  =  computed(()  =>  {
    if  (!heading.value)  return  '-'
    const  directions  =  ['北',  '东北',  '东',  '东南',  '南',  '西南',  '西',  '西北']
    const  index  =  Math.round(heading.value  /  45)  %  8
    return  `${heading.value.toFixed(0)}°  (${directions[index]})`
})

//  精度等级
const  accuracyLevel  =  computed(()  =>  {
    if  (!accuracy.value)  return  'unknown'
    if  (accuracy.value  <  10)  return  'excellent'
    if  (accuracy.value  <  50)  return  'good'
    if  (accuracy.value  <  100)  return  'fair'
    return  'poor'
})

//  精度描述
const  accuracyText  =  computed(()  =>  {
    const  levelMap  =  {
        excellent:  '优秀',
        good:  '良好',
        fair:  '一般',
        poor:  '较差',
        unknown:  '未知',
    }
    return  levelMap[accuracyLevel.value]
})
</script>

<template>
    <div  class="geolocation-demo">
        <!--  不支持提示  -->
        <div  v-if="!isSupported"  class="not-supported">
            <div  class="icon">📍</div>
            <h3>不支持地理位置</h3>
            <p>您的浏览器或设备不支持地理位置  API</p>
        </div>

        <!--  加载状态  -->
        <div  v-else-if="!isLoaded"  class="loading">
            <div  class="spinner"></div>
            <p>正在加载地理位置模块...</p>
        </div>

        <!--  主要内容  -->
        <div  v-else  class="location-panel">
            <!--  控制按钮  -->
            <div  class="controls">
                <button
                    @click="handleGetLocation"
                    :disabled="isLoading"
                    class="btn  btn-primary"
                >
                    {{  isLoading  ?  '获取中...'  :  '获取当前位置'  }}
                </button>

                <button
                    v-if="!isWatching"
                    @click="handleStartTracking"
                    :disabled="isLoading"
                    class="btn  btn-secondary"
                >
                    开始实时追踪
                </button>

                <button
                    v-else
                    @click="handleStopTracking"
                    class="btn  btn-danger"
                >
                    停止追踪
                </button>
            </div>

            <!--  追踪状态提示  -->
            <div  v-if="isWatching"  class="tracking-indicator">
                <span  class="pulse"></span>
                <span>正在实时追踪位置...</span>
            </div>

            <!--  错误提示  -->
            <div  v-if="error"  class="error-message">
                <span  class="error-icon">❌</span>
                <div  class="error-content">
                    <strong>定位失败</strong>
                    <p>{{  error  }}</p>
                    <p  class="error-hint">
                        请确保已授予位置权限，并且  GPS  或网络定位功能已启用
                    </p>
                </div>
            </div>

            <!--  位置信息  -->
            <div  v-if="hasPosition"  class="location-info">
                <!--  坐标显示  -->
                <div  class="info-section">
                    <h3>坐标信息</h3>
                    <div  class="info-grid">
                        <div  class="info-item">
                            <label>纬度</label>
                            <span  class="value">{{  formatCoordinate(latitude)  }}</span>
                        </div>
                        <div  class="info-item">
                            <label>经度</label>
                            <span  class="value">{{  formatCoordinate(longitude)  }}</span>
                        </div>
                        <div  class="info-item">
                            <label>精度</label>
                            <span  class="value  accuracy"  :class="accuracyLevel">
                                {{  accuracy  }}  米  ({{  accuracyText  }})
                            </span>
                        </div>
                        <div  v-if="altitude"  class="info-item">
                            <label>海拔</label>
                            <span  class="value">{{  altitude.toFixed(0)  }}  米</span>
                        </div>
                    </div>
                </div>

                <!--  运动信息  -->
                <div  v-if="speed  ||  heading"  class="info-section">
                    <h3>运动信息</h3>
                    <div  class="info-grid">
                        <div  v-if="speed"  class="info-item">
                            <label>速度</label>
                            <span  class="value">{{  formatSpeed  }}</span>
                        </div>
                        <div  v-if="heading"  class="info-item">
                            <label>方向</label>
                            <span  class="value">{{  formatHeading  }}</span>
                        </div>
                    </div>
                </div>

                <!--  地图预览  -->
                <div  class="map-section">
                    <h3>地图位置</h3>
                    <div  class="map-placeholder">
                        <p>📍  位置：{{  formatCoordinate(latitude,  4)  }},  {{  formatCoordinate(longitude,  4)  }}</p>
                        <p  class="map-hint">
                            在实际应用中，可以集成  Google  Maps、高德地图等地图服务
                        </p>
                        <!--  可以在这里集成实际的地图组件  -->
                        <a
                            :href="`https://www.google.com/maps?q=${latitude},${longitude}`"
                            target="_blank"
                            class="map-link"
                        >
                            在  Google  Maps  中查看
                        </a>
                    </div>
                </div>

                <!--  位置详情  -->
                <div  class="position-details">
                    <details  open>
                        <summary>完整位置信息</summary>
                        <pre>{{  JSON.stringify(position,  null,  2)  }}</pre>
                    </details>
                </div>
            </div>

            <!--  等待获取位置  -->
            <div  v-else-if="!error"  class="waiting-state">
                <div  class="icon">📍</div>
                <p>点击"获取当前位置"按钮开始定位</p>
            </div>
        </div>
    </div>
</template>

<style  scoped>
.geolocation-demo  {
    max-width:  900px;
    margin:  0  auto;
    padding:  20px;
}

.not-supported,
.loading,
.waiting-state  {
    text-align:  center;
    padding:  60px  20px;
}

.icon  {
    font-size:  64px;
    margin-bottom:  20px;
}

.not-supported  h3  {
    margin:  0  0  12px  0;
    color:  #333;
}

.not-supported  p  {
    color:  #666;
}

.spinner  {
    width:  50px;
    height:  50px;
    border:  5px  solid  #f3f3f3;
    border-top:  5px  solid  #2196f3;
    border-radius:  50%;
    margin:  0  auto  20px;
    animation:  spin  1s  linear  infinite;
}

@keyframes  spin  {
    0%  {  transform:  rotate(0deg);  }
    100%  {  transform:  rotate(360deg);  }
}

.location-panel  {
    background:  white;
    border-radius:  16px;
    padding:  32px;
    box-shadow:  0  4px  16px  rgba(0,  0,  0,  0.1);
}

.controls  {
    display:  flex;
    gap:  12px;
    margin-bottom:  24px;
    flex-wrap:  wrap;
}

.btn  {
    padding:  12px  24px;
    border:  none;
    border-radius:  8px;
    font-size:  14px;
    font-weight:  600;
    cursor:  pointer;
    transition:  all  0.2s;
}

.btn:disabled  {
    opacity:  0.6;
    cursor:  not-allowed;
}

.btn-primary  {
    background:  #2196f3;
    color:  white;
}

.btn-primary:hover:not(:disabled)  {
    background:  #1976d2;
    transform:  translateY(-2px);
}

.btn-secondary  {
    background:  #4caf50;
    color:  white;
}

.btn-secondary:hover:not(:disabled)  {
    background:  #388e3c;
}

.btn-danger  {
    background:  #f44336;
    color:  white;
}

.btn-danger:hover  {
    background:  #d32f2f;
}

.tracking-indicator  {
    display:  flex;
    align-items:  center;
    gap:  12px;
    padding:  12px  20px;
    background:  #e8f5e9;
    border:  2px  solid  #4caf50;
    border-radius:  8px;
    margin-bottom:  24px;
    color:  #2e7d32;
    font-weight:  600;
}

.pulse  {
    width:  12px;
    height:  12px;
    background:  #4caf50;
    border-radius:  50%;
    animation:  pulse  1.5s  ease-in-out  infinite;
}

@keyframes  pulse  {
    0%,  100%  {
        opacity:  1;
        transform:  scale(1);
    }
    50%  {
        opacity:  0.5;
        transform:  scale(1.5);
    }
}

.error-message  {
    display:  flex;
    gap:  16px;
    padding:  20px;
    background:  #ffebee;
    border:  2px  solid  #f44336;
    border-radius:  8px;
    margin-bottom:  24px;
}

.error-icon  {
    font-size:  24px;
    flex-shrink:  0;
}

.error-content  strong  {
    display:  block;
    color:  #b71c1c;
    font-size:  16px;
    margin-bottom:  8px;
}

.error-content  p  {
    margin:  4px  0;
    color:  #c62828;
    font-size:  14px;
}

.error-hint  {
    font-size:  13px  !important;
    color:  #e57373  !important;
}

.location-info  {
    display:  flex;
    flex-direction:  column;
    gap:  24px;
}

.info-section  h3  {
    margin:  0  0  16px  0;
    font-size:  18px;
    color:  #333;
}

.info-grid  {
    display:  grid;
    grid-template-columns:  repeat(auto-fit,  minmax(200px,  1fr));
    gap:  16px;
}

.info-item  {
    background:  #f9f9f9;
    padding:  16px;
    border-radius:  8px;
}

.info-item  label  {
    display:  block;
    font-size:  13px;
    color:  #666;
    margin-bottom:  8px;
}

.info-item  .value  {
    display:  block;
    font-size:  16px;
    font-weight:  600;
    color:  #333;
}

.accuracy.excellent  {
    color:  #4caf50;
}

.accuracy.good  {
    color:  #8bc34a;
}

.accuracy.fair  {
    color:  #ff9800;
}

.accuracy.poor  {
    color:  #f44336;
}

.map-section  h3  {
    margin:  0  0  16px  0;
    font-size:  18px;
    color:  #333;
}

.map-placeholder  {
    background:  #f5f5f5;
    border:  2px  dashed  #ccc;
    border-radius:  8px;
    padding:  40px  20px;
    text-align:  center;
}

.map-placeholder  p  {
    margin:  8px  0;
    color:  #666;
}

.map-hint  {
    font-size:  13px;
    color:  #999;
}

.map-link  {
    display:  inline-block;
    margin-top:  16px;
    padding:  10px  20px;
    background:  #2196f3;
    color:  white;
    text-decoration:  none;
    border-radius:  6px;
    font-size:  14px;
    transition:  background  0.2s;
}

.map-link:hover  {
    background:  #1976d2;
}

.position-details  {
    margin-top:  24px;
}

.position-details  summary  {
    cursor:  pointer;
    font-weight:  600;
    color:  #333;
    padding:  12px;
    background:  #f9f9f9;
    border-radius:  8px;
}

.position-details  pre  {
    margin:  12px  0  0  0;
    padding:  16px;
    background:  #f5f5f5;
    border-radius:  8px;
    overflow-x:  auto;
    font-size:  13px;
    line-height:  1.6;
}

@media  (max-width:  768px)  {
    .location-panel  {
        padding:  20px;
    }

    .controls  {
        flex-direction:  column;
    }

    .btn  {
        width:  100%;
    }

    .info-grid  {
        grid-template-columns:  1fr;
    }
}
</style>
```

###  2.  距离计算工具

实现两点之间距离计算和附近搜索：

```vue
<script  setup  lang="ts">
import  {  ref,  computed,  onMounted  }  from  'vue'
import  {  useGeolocation  }  from  '@ldesign/device/vue'

const  {
    latitude,
    longitude,
    loadModule,
    getCurrentPosition,
}  =  useGeolocation()

//  目标位置列表（示例）
interface  Location  {
    id:  string
    name:  string
    lat:  number
    lng:  number
    type:  string
}

const  locations  =  ref<Location[]>([
    {  id:  '1',  name:  '北京天安门',  lat:  39.9042,  lng:  116.4074,  type:  '景点'  },
    {  id:  '2',  name:  '上海东方明珠',  lat:  31.2397,  lng:  121.4999,  type:  '景点'  },
    {  id:  '3',  name:  '广州塔',  lat:  23.1088,  lng:  113.3191,  type:  '景点'  },
    {  id:  '4',  name:  '深圳市民中心',  lat:  22.5455,  lng:  114.0570,  type:  '地标'  },
])

//  计算两点之间的距离（使用  Haversine  公式）
const  calculateDistance  =  (
    lat1:  number,
    lon1:  number,
    lat2:  number,
    lon2:  number,
):  number  =>  {
    const  R  =  6371  //  地球半径（公里）
    const  dLat  =  toRad(lat2  -  lat1)
    const  dLon  =  toRad(lon2  -  lon1)
    const  a
        =  Math.sin(dLat  /  2)  *  Math.sin(dLat  /  2)
        +  Math.cos(toRad(lat1))
            *  Math.cos(toRad(lat2))
            *  Math.sin(dLon  /  2)
            *  Math.sin(dLon  /  2)
    const  c  =  2  *  Math.atan2(Math.sqrt(a),  Math.sqrt(1  -  a))
    return  R  *  c
}

const  toRad  =  (value:  number):  number  =>  {
    return  (value  *  Math.PI)  /  180
}

//  格式化距离显示
const  formatDistance  =  (km:  number):  string  =>  {
    if  (km  <  1)  {
        return  `${Math.round(km  *  1000)}  米`
    }  else  if  (km  <  10)  {
        return  `${km.toFixed(1)}  公里`
    }  else  {
        return  `${Math.round(km)}  公里`
    }
}

//  计算所有位置的距离
const  locationsWithDistance  =  computed(()  =>  {
    if  (!latitude.value  ||  !longitude.value)  return  []

    return  locations.value
        .map(loc  =>  ({
            ...loc,
            distance:  calculateDistance(
                latitude.value!,
                longitude.value!,
                loc.lat,
                loc.lng,
            ),
        }))
        .sort((a,  b)  =>  a.distance  -  b.distance)
})

//  最近的位置
const  nearestLocation  =  computed(()  =>  {
    return  locationsWithDistance.value[0]  ||  null
})

//  附近的位置（50km  以内）
const  nearbyLocations  =  computed(()  =>  {
    return  locationsWithDistance.value.filter(loc  =>  loc.distance  <  50)
})

onMounted(async  ()  =>  {
    await  loadModule()
    await  getCurrentPosition()
})
</script>

<template>
    <div  class="distance-calculator">
        <div  class="calculator-panel">
            <h2>距离计算器</h2>

            <!--  当前位置  -->
            <div  v-if="latitude  &&  longitude"  class="current-location">
                <h3>当前位置</h3>
                <p>{{  latitude.toFixed(4)  }},  {{  longitude.toFixed(4)  }}</p>
            </div>

            <!--  最近位置  -->
            <div  v-if="nearestLocation"  class="nearest-location">
                <h3>离您最近的位置</h3>
                <div  class="location-card  featured">
                    <div  class="location-info">
                        <h4>{{  nearestLocation.name  }}</h4>
                        <span  class="location-type">{{  nearestLocation.type  }}</span>
                    </div>
                    <div  class="distance-badge">
                        {{  formatDistance(nearestLocation.distance)  }}
                    </div>
                </div>
            </div>

            <!--  附近位置列表  -->
            <div  v-if="nearbyLocations.length  >  0"  class="nearby-section">
                <h3>附近位置  (50km  以内)</h3>
                <div  class="locations-list">
                    <div
                        v-for="loc  in  nearbyLocations"
                        :key="loc.id"
                        class="location-card"
                    >
                        <div  class="location-info">
                            <h4>{{  loc.name  }}</h4>
                            <span  class="location-type">{{  loc.type  }}</span>
                        </div>
                        <div  class="distance-badge">
                            {{  formatDistance(loc.distance)  }}
                        </div>
                    </div>
                </div>
            </div>

            <!--  所有位置  -->
            <div  v-if="locationsWithDistance.length  >  0"  class="all-locations">
                <h3>所有位置（按距离排序）</h3>
                <div  class="locations-table">
                    <table>
                        <thead>
                            <tr>
                                <th>名称</th>
                                <th>类型</th>
                                <th>坐标</th>
                                <th>距离</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr  v-for="loc  in  locationsWithDistance"  :key="loc.id">
                                <td>{{  loc.name  }}</td>
                                <td>{{  loc.type  }}</td>
                                <td>{{  loc.lat.toFixed(4)  }},  {{  loc.lng.toFixed(4)  }}</td>
                                <td  class="distance">{{  formatDistance(loc.distance)  }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style  scoped>
.distance-calculator  {
    max-width:  900px;
    margin:  0  auto;
    padding:  20px;
}

.calculator-panel  {
    background:  white;
    border-radius:  16px;
    padding:  32px;
    box-shadow:  0  4px  16px  rgba(0,  0,  0,  0.1);
}

.calculator-panel  h2  {
    margin:  0  0  24px  0;
    color:  #333;
}

.calculator-panel  h3  {
    margin:  0  0  16px  0;
    font-size:  18px;
    color:  #333;
}

.current-location  {
    padding:  16px;
    background:  #e3f2fd;
    border-left:  4px  solid  #2196f3;
    border-radius:  8px;
    margin-bottom:  24px;
}

.current-location  p  {
    margin:  0;
    font-family:  monospace;
    font-size:  16px;
    color:  #1976d2;
}

.nearest-location  {
    margin-bottom:  32px;
}

.location-card  {
    display:  flex;
    justify-content:  space-between;
    align-items:  center;
    padding:  16px  20px;
    background:  #f9f9f9;
    border-radius:  12px;
    margin-bottom:  12px;
    transition:  all  0.2s;
}

.location-card:hover  {
    background:  #f5f5f5;
    transform:  translateY(-2px);
    box-shadow:  0  4px  12px  rgba(0,  0,  0,  0.1);
}

.location-card.featured  {
    background:  linear-gradient(135deg,  #667eea  0%,  #764ba2  100%);
    color:  white;
}

.location-card.featured  .location-type  {
    background:  rgba(255,  255,  255,  0.2);
    color:  white;
}

.location-card.featured  .distance-badge  {
    background:  rgba(255,  255,  255,  0.3);
    color:  white;
}

.location-info  h4  {
    margin:  0  0  8px  0;
    font-size:  16px;
}

.location-type  {
    display:  inline-block;
    padding:  4px  12px;
    background:  #e0e0e0;
    color:  #666;
    border-radius:  12px;
    font-size:  12px;
}

.distance-badge  {
    padding:  8px  16px;
    background:  #2196f3;
    color:  white;
    border-radius:  20px;
    font-weight:  600;
    font-size:  14px;
}

.nearby-section,
.all-locations  {
    margin-top:  32px;
}

.locations-list  {
    display:  flex;
    flex-direction:  column;
}

.locations-table  {
    overflow-x:  auto;
}

table  {
    width:  100%;
    border-collapse:  collapse;
}

thead  {
    background:  #f5f5f5;
}

th  {
    padding:  12px;
    text-align:  left;
    font-weight:  600;
    color:  #666;
    font-size:  14px;
}

td  {
    padding:  12px;
    border-bottom:  1px  solid  #e0e0e0;
    color:  #333;
}

tr:last-child  td  {
    border-bottom:  none;
}

.distance  {
    font-weight:  600;
    color:  #2196f3;
}

@media  (max-width:  768px)  {
    .calculator-panel  {
        padding:  20px;
    }

    .location-card  {
        flex-direction:  column;
        align-items:  flex-start;
        gap:  12px;
    }

    .distance-badge  {
        align-self:  flex-start;
    }

    .locations-table  {
        font-size:  14px;
    }

    th,  td  {
        padding:  8px;
    }
}
</style>
```

---

##  原生  JavaScript  实现方式

###  地理位置管理器

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

/**
  *  地理位置管理器
  */
class  GeolocationManager  {
    private  detector:  DeviceDetector
    private  geolocationModule:  any
    private  callbacks:  Map<string,  Set<Function>>  =  new  Map()
    private  watchId:  number  |  null  =  null

    constructor()  {
        this.detector  =  new  DeviceDetector()
        this.init()
    }

    private  async  init()  {
        try  {
            //  加载地理位置模块
            this.geolocationModule  =  await  this.detector.loadModule('geolocation')

            if  (!this.isSupported())  {
                throw  new  Error('设备不支持地理位置  API')
            }

            console.log('地理位置管理器初始化成功')
        }  catch  (error)  {
            console.error('地理位置模块加载失败:',  error)
            this.emit('error',  {  message:  '地理位置不可用'  })
        }
    }

    /**
      *  检查是否支持地理位置  API
      */
    isSupported():  boolean  {
        if  (!this.geolocationModule)  return  false
        return  this.geolocationModule.isSupported()
    }

    /**
      *  获取当前位置
      */
    async  getCurrentPosition(options?:  PositionOptions)  {
        if  (!this.geolocationModule)  {
            throw  new  Error('地理位置模块未初始化')
        }

        try  {
            const  position  =  await  this.geolocationModule.getCurrentPosition(options)
            this.emit('position',  position)
            return  position
        }  catch  (error)  {
            this.emit('error',  error)
            throw  error
        }
    }

    /**
      *  开始监听位置变化
      */
    startWatching(callback?:  Function,  options?:  PositionOptions)  {
        if  (!this.geolocationModule)  {
            throw  new  Error('地理位置模块未初始化')
        }

        if  (this.watchId  !==  null)  {
            console.warn('已经在监听位置变化')
            return
        }

        const  positionHandler  =  (position:  any)  =>  {
            this.emit('positionUpdate',  position)
            if  (callback)  {
                callback(position)
            }
        }

        this.geolocationModule.startWatching(positionHandler,  options)
        this.watchId  =  1  //  标记为正在监听

        console.log('开始监听位置变化')
    }

    /**
      *  停止监听位置变化
      */
    stopWatching()  {
        if  (!this.geolocationModule)  return

        if  (this.watchId  !==  null)  {
            this.geolocationModule.stopWatching()
            this.watchId  =  null
            console.log('停止监听位置变化')
        }
    }

    /**
      *  是否正在监听
      */
    isWatching():  boolean  {
        return  this.watchId  !==  null
    }

    /**
      *  计算两点之间的距离（Haversine  公式）
      */
    static  calculateDistance(
        lat1:  number,
        lon1:  number,
        lat2:  number,
        lon2:  number,
    ):  number  {
        const  R  =  6371  //  地球半径（公里）
        const  toRad  =  (value:  number)  =>  (value  *  Math.PI)  /  180

        const  dLat  =  toRad(lat2  -  lat1)
        const  dLon  =  toRad(lon2  -  lon1)

        const  a
            =  Math.sin(dLat  /  2)  *  Math.sin(dLat  /  2)
            +  Math.cos(toRad(lat1))
                *  Math.cos(toRad(lat2))
                *  Math.sin(dLon  /  2)
                *  Math.sin(dLon  /  2)

        const  c  =  2  *  Math.atan2(Math.sqrt(a),  Math.sqrt(1  -  a))
        return  R  *  c
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
        this.stopWatching()
        this.callbacks.clear()
        await  this.detector.destroy()
    }
}

//  使用示例
const  geoManager  =  new  GeolocationManager()

//  获取当前位置
geoManager.on('position',  (position)  =>  {
    console.log('当前位置:',  position)
    displayPosition(position)
})

//  监听位置更新
geoManager.on('positionUpdate',  (position)  =>  {
    console.log('位置更新:',  position)
    updatePosition(position)
})

//  监听错误
geoManager.on('error',  (error)  =>  {
    console.error('定位错误:',  error)
    showError(error)
})

//  获取位置
async  function  getLocation()  {
    try  {
        const  position  =  await  geoManager.getCurrentPosition({
            enableHighAccuracy:  true,
            timeout:  10000,
            maximumAge:  0,
        })
        console.log('位置获取成功:',  position)
    }  catch  (error)  {
        console.error('位置获取失败:',  error)
    }
}

//  开始追踪
function  startTracking()  {
    geoManager.startWatching((position:  any)  =>  {
        console.log('实时位置:',  position)
        updateMap(position)
    })
}

//  停止追踪
function  stopTracking()  {
    geoManager.stopWatching()
}

//  计算距离
function  calculateDistanceToTarget(targetLat:  number,  targetLng:  number)  {
    geoManager.getCurrentPosition().then((position)  =>  {
        const  distance  =  GeolocationManager.calculateDistance(
            position.latitude,
            position.longitude,
            targetLat,
            targetLng,
        )
        console.log(`距离目标:  ${distance.toFixed(2)}  公里`)
    })
}

//  辅助函数
function  displayPosition(position:  any)  {
    document.getElementById('latitude')!.textContent  =  position.latitude.toFixed(6)
    document.getElementById('longitude')!.textContent  =  position.longitude.toFixed(6)
    document.getElementById('accuracy')!.textContent  =  `${position.accuracy}  米`
}

function  updatePosition(position:  any)  {
    displayPosition(position)
    //  更新地图标记
}

function  updateMap(position:  any)  {
    //  在地图上更新用户位置标记
    console.log('更新地图位置:',  position)
}

function  showError(error:  any)  {
    alert(`定位错误:  ${error.message  ||  error}`)
}
```

---

##  代码解释

###  关键概念

1.  **地理位置  API**：使用  Web  Geolocation  API  获取位置信息
2.  **权限请求**：首次使用时浏览器会请求用户授权
3.  **位置追踪**：使用  `watchPosition`  实时监听位置变化
4.  **距离计算**：使用  Haversine  公式计算两点间距离
5.  **精度控制**：可以选择高精度模式或低精度模式

###  定位方式

-  **GPS**：最准确，但耗电且室内信号弱
-  **WiFi**：基于  WiFi  热点定位，准确度中等
-  **基站**：使用移动基站定位，准确度较低
-  **IP  地址**：最不准确，仅作为备选

---

##  扩展建议

1.  **地图集成**
      ```typescript
      //  集成  Google  Maps  或高德地图
      import  GoogleMap  from  'google-maps-api'

      function  showOnMap(lat:  number,  lng:  number)  {
          const  map  =  new  google.maps.Map(document.getElementById('map'),  {
              center:  {  lat,  lng  },
              zoom:  15,
          })

          new  google.maps.Marker({
              position:  {  lat,  lng  },
              map,
          })
      }
      ```

2.  **地理围栏**
      ```typescript
      //  检查用户是否进入特定区域
      function  isInGeofence(
          userLat:  number,
          userLng:  number,
          centerLat:  number,
          centerLng:  number,
          radiusKm:  number,
      ):  boolean  {
          const  distance  =  GeolocationManager.calculateDistance(
              userLat,
              userLng,
              centerLat,
              centerLng,
          )
          return  distance  <=  radiusKm
      }
      ```

3.  **位置缓存**
      ```typescript
      //  缓存最近的位置信息
      class  LocationCache  {
          private  cache:  any  =  null
          private  cacheTime:  number  =  0
          private  maxAge:  number  =  60000  //  1  分钟

          setPosition(position:  any)  {
              this.cache  =  position
              this.cacheTime  =  Date.now()
          }

          getPosition():  any  |  null  {
              if  (Date.now()  -  this.cacheTime  >  this.maxAge)  {
                  return  null
              }
              return  this.cache
          }
      }
      ```

---

##  最佳实践

1.  **请求权限时机**：在用户需要使用定位功能时再请求
2.  **错误处理**：妥善处理拒绝权限、超时等错误
3.  **精度选择**：根据应用需求选择合适的精度
4.  **省电考虑**：不需要时及时停止位置监听
5.  **隐私保护**：尊重用户隐私，明确告知定位用途

---

##  常见错误处理

```typescript
try  {
    const  position  =  await  getCurrentPosition()
}  catch  (error)  {
    if  (error.code  ===  1)  {
        //  用户拒绝了定位请求
        console.log('用户拒绝授权定位')
    }  else  if  (error.code  ===  2)  {
        //  位置信息不可用
        console.log('位置信息不可用')
    }  else  if  (error.code  ===  3)  {
        //  请求超时
        console.log('定位请求超时')
    }
}
```

---

##  相关链接

-  [基础使用示例](./index.md)  -  设备检测基础
-  [响应式设计示例](./responsive.md)  -  响应式布局
-  [网络状态监听示例](./network.md)  -  网络状态监控
-  [电池监控示例](./battery.md)  -  电池状态监控
-  [API  参考文档](../api/)  -  完整  API  文档
