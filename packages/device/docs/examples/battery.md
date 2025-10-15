#  电池监控示例

本文档展示如何使用  @ldesign/device  库监控设备电池状态，实现低电量提示、省电模式、性能降级等功能。

##  场景描述

电池状态监控可以帮助我们创建更加用户友好的应用：

-  **低电量提示**：当电池电量较低时提醒用户
-  **自动省电模式**：在低电量时自动降低性能和功能
-  **充电状态检测**：识别设备是否正在充电
-  **电池健康监控**：跟踪电池充放电时间
-  **智能优化**：根据电池状态调整应用行为

##  效果预览说明

实现本示例后，您的应用将能够：

1.  实时显示电池电量百分比和充电状态
2.  在电量低于  20%  时显示低电量警告
3.  在电量低于  10%  时自动启用省电模式
4.  充电时提供优化建议
5.  根据电池状态调整动画和性能

---

##  Vue  3  实现方式

###  1.  基础电池状态监控

使用  `useBattery`  composable  获取电池信息：

```vue
<script  setup  lang="ts">
import  {  onMounted,  computed  }  from  'vue'
import  {  useBattery  }  from  '@ldesign/device/vue'

//  获取电池状态信息
const  {
    batteryInfo,                //  完整的电池信息对象
    batteryLevel,              //  电池电量  (0-1)
    isCharging,                  //  是否正在充电
    batteryStatus,            //  电池状态
    isLoaded,                      //  模块是否已加载
    error,                            //  错误信息
    batteryPercentage,    //  电池电量百分比
    isLowBattery,              //  是否低电量  (<20%)
    isCriticalBattery,    //  是否严重低电量  (<10%)
    loadModule,                  //  加载电池模块
    refresh,                        //  刷新电池信息
}  =  useBattery()

//  加载电池模块
onMounted(async  ()  =>  {
    try  {
        await  loadModule()
        console.log('电池模块加载成功')
    }  catch  (err)  {
        console.warn('设备不支持电池  API  或加载失败:',  err)
    }
})

//  电池图标样式
const  batteryIconClass  =  computed(()  =>  {
    if  (isCharging.value)  return  'battery-charging'
    if  (isCriticalBattery.value)  return  'battery-critical'
    if  (isLowBattery.value)  return  'battery-low'
    if  (batteryPercentage.value  >  80)  return  'battery-full'
    return  'battery-normal'
})

//  电池颜色
const  batteryColor  =  computed(()  =>  {
    if  (isCharging.value)  return  '#4caf50'
    if  (isCriticalBattery.value)  return  '#f44336'
    if  (isLowBattery.value)  return  '#ff9800'
    return  '#2196f3'
})

//  格式化时间
const  formatTime  =  (seconds:  number)  =>  {
    if  (seconds  ===  Infinity)  return  '计算中...'
    const  hours  =  Math.floor(seconds  /  3600)
    const  minutes  =  Math.floor((seconds  %  3600)  /  60)
    if  (hours  >  0)  return  `${hours}  小时  ${minutes}  分钟`
    return  `${minutes}  分钟`
}

//  充电时间
const  chargingTime  =  computed(()  =>  {
    if  (!batteryInfo.value)  return  '-'
    return  formatTime(batteryInfo.value.chargingTime)
})

//  放电时间
const  dischargingTime  =  computed(()  =>  {
    if  (!batteryInfo.value)  return  '-'
    return  formatTime(batteryInfo.value.dischargingTime)
})
</script>

<template>
    <div  class="battery-monitor">
        <!--  加载状态  -->
        <div  v-if="!isLoaded  &&  !error"  class="loading">
            <div  class="spinner"></div>
            <p>正在加载电池模块...</p>
        </div>

        <!--  错误状态  -->
        <div  v-else-if="error"  class="error-state">
            <div  class="error-icon">🔋</div>
            <h3>电池信息不可用</h3>
            <p>{{  error  }}</p>
            <p  class="error-hint">
                该设备可能不支持电池  API，或浏览器未授权访问
            </p>
        </div>

        <!--  电池信息面板  -->
        <div  v-else  class="battery-panel">
            <!--  电池可视化  -->
            <div  class="battery-visualization">
                <div  :class="['battery-icon',  batteryIconClass]">
                    <div
                        class="battery-level-fill"
                        :style="{
                            width:  `${batteryPercentage}%`,
                            background:  batteryColor,
                        }"
                    >
                        <div  v-if="isCharging"  class="charging-animation"></div>
                    </div>
                </div>
                <div  class="battery-percentage">
                    {{  batteryPercentage  }}%
                </div>
            </div>

            <!--  状态卡片  -->
            <div  class="status-cards">
                <!--  充电状态  -->
                <div  class="status-card">
                    <div  class="status-icon">
                        {{  isCharging  ?  '⚡'  :  '🔋'  }}
                    </div>
                    <div  class="status-content">
                        <h4>充电状态</h4>
                        <p>{{  isCharging  ?  '充电中'  :  '未充电'  }}</p>
                    </div>
                </div>

                <!--  剩余时间  -->
                <div  class="status-card">
                    <div  class="status-icon">⏱️</div>
                    <div  class="status-content">
                        <h4>{{  isCharging  ?  '充满时间'  :  '剩余时间'  }}</h4>
                        <p>{{  isCharging  ?  chargingTime  :  dischargingTime  }}</p>
                    </div>
                </div>

                <!--  电池健康  -->
                <div  class="status-card">
                    <div  class="status-icon">💚</div>
                    <div  class="status-content">
                        <h4>电池健康</h4>
                        <p>{{  batteryStatus  }}</p>
                    </div>
                </div>
            </div>

            <!--  警告提示  -->
            <div  v-if="isCriticalBattery  &&  !isCharging"  class="alert  alert-critical">
                <span  class="alert-icon">🚨</span>
                <div  class="alert-content">
                    <strong>严重低电量警告</strong>
                    <p>电量仅剩  {{  batteryPercentage  }}%，请尽快充电！已自动启用省电模式。</p>
                </div>
            </div>

            <div  v-else-if="isLowBattery  &&  !isCharging"  class="alert  alert-warning">
                <span  class="alert-icon">⚠️</span>
                <div  class="alert-content">
                    <strong>低电量提醒</strong>
                    <p>电量剩余  {{  batteryPercentage  }}%，建议尽快充电。</p>
                </div>
            </div>

            <div  v-if="isCharging"  class="alert  alert-success">
                <span  class="alert-icon">⚡</span>
                <div  class="alert-content">
                    <strong>正在充电</strong>
                    <p>当前电量  {{  batteryPercentage  }}%，预计  {{  chargingTime  }}  充满。</p>
                </div>
            </div>

            <!--  操作按钮  -->
            <div  class="actions">
                <button  @click="refresh"  class="btn-primary">
                    刷新电池信息
                </button>
            </div>
        </div>
    </div>
</template>

<style  scoped>
.battery-monitor  {
    max-width:  800px;
    margin:  0  auto;
    padding:  20px;
}

.loading  {
    text-align:  center;
    padding:  60px  20px;
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

.error-state  {
    text-align:  center;
    padding:  60px  20px;
}

.error-icon  {
    font-size:  64px;
    margin-bottom:  20px;
}

.error-state  h3  {
    color:  #333;
    margin:  0  0  12px  0;
}

.error-state  p  {
    color:  #666;
    margin:  8px  0;
}

.error-hint  {
    font-size:  14px;
    color:  #999;
}

.battery-panel  {
    background:  white;
    border-radius:  16px;
    padding:  32px;
    box-shadow:  0  4px  16px  rgba(0,  0,  0,  0.1);
}

.battery-visualization  {
    text-align:  center;
    margin-bottom:  32px;
}

.battery-icon  {
    width:  200px;
    height:  100px;
    border:  4px  solid  #333;
    border-radius:  8px;
    position:  relative;
    margin:  0  auto  20px;
    overflow:  hidden;
}

.battery-icon::after  {
    content:  '';
    position:  absolute;
    right:  -20px;
    top:  50%;
    transform:  translateY(-50%);
    width:  16px;
    height:  40px;
    background:  #333;
    border-radius:  0  4px  4px  0;
}

.battery-level-fill  {
    position:  absolute;
    left:  0;
    top:  0;
    height:  100%;
    transition:  width  0.5s  ease,  background  0.3s  ease;
}

.battery-charging  .battery-level-fill  {
    background:  #4caf50  !important;
}

.charging-animation  {
    position:  absolute;
    inset:  0;
    background:  linear-gradient(
        90deg,
        transparent  0%,
        rgba(255,  255,  255,  0.3)  50%,
        transparent  100%
    );
    animation:  charging-flow  1.5s  ease-in-out  infinite;
}

@keyframes  charging-flow  {
    0%  {  transform:  translateX(-100%);  }
    100%  {  transform:  translateX(100%);  }
}

.battery-critical  {
    animation:  blink  1s  ease-in-out  infinite;
}

@keyframes  blink  {
    0%,  100%  {  opacity:  1;  }
    50%  {  opacity:  0.5;  }
}

.battery-percentage  {
    font-size:  48px;
    font-weight:  700;
    color:  #333;
}

.status-cards  {
    display:  grid;
    grid-template-columns:  repeat(auto-fit,  minmax(200px,  1fr));
    gap:  16px;
    margin-bottom:  24px;
}

.status-card  {
    background:  #f9f9f9;
    border-radius:  12px;
    padding:  20px;
    display:  flex;
    align-items:  center;
    gap:  16px;
}

.status-icon  {
    font-size:  32px;
}

.status-content  h4  {
    margin:  0  0  4px  0;
    font-size:  14px;
    color:  #666;
    font-weight:  500;
}

.status-content  p  {
    margin:  0;
    font-size:  16px;
    font-weight:  600;
    color:  #333;
}

.alert  {
    display:  flex;
    align-items:  flex-start;
    gap:  16px;
    padding:  16px  20px;
    border-radius:  8px;
    margin-bottom:  16px;
}

.alert-icon  {
    font-size:  24px;
    flex-shrink:  0;
}

.alert-content  strong  {
    display:  block;
    margin-bottom:  4px;
    font-size:  16px;
}

.alert-content  p  {
    margin:  0;
    font-size:  14px;
}

.alert-critical  {
    background:  #ffebee;
    border:  2px  solid  #f44336;
    color:  #b71c1c;
}

.alert-warning  {
    background:  #fff3e0;
    border:  2px  solid  #ff9800;
    color:  #e65100;
}

.alert-success  {
    background:  #e8f5e9;
    border:  2px  solid  #4caf50;
    color:  #2e7d32;
}

.actions  {
    text-align:  center;
}

.btn-primary  {
    padding:  12px  32px;
    background:  #2196f3;
    color:  white;
    border:  none;
    border-radius:  8px;
    font-size:  16px;
    font-weight:  600;
    cursor:  pointer;
    transition:  all  0.2s;
}

.btn-primary:hover  {
    background:  #1976d2;
    transform:  translateY(-2px);
    box-shadow:  0  4px  12px  rgba(33,  150,  243,  0.3);
}

.btn-primary:active  {
    transform:  translateY(0);
}

@media  (max-width:  768px)  {
    .battery-panel  {
        padding:  20px;
    }

    .battery-icon  {
        width:  150px;
        height:  75px;
    }

    .battery-percentage  {
        font-size:  36px;
    }

    .status-cards  {
        grid-template-columns:  1fr;
    }
}
</style>
```

###  2.  智能省电模式

根据电池状态自动调整应用性能：

```vue
<script  setup  lang="ts">
import  {  ref,  computed,  watch,  onMounted  }  from  'vue'
import  {  useBattery  }  from  '@ldesign/device/vue'

const  {
    batteryPercentage,
    isCharging,
    isLowBattery,
    isCriticalBattery,
    loadModule,
}  =  useBattery()

//  省电模式配置
interface  PowerSavingConfig  {
    reduceAnimations:  boolean        //  减少动画
    lowerQuality:  boolean                    //  降低质量
    disableAutoplay:  boolean        //  禁用自动播放
    limitRefresh:  boolean                    //  限制刷新频率
    dimScreen:  boolean                            //  降低屏幕亮度
}

//  省电模式状态
const  powerSavingMode  =  ref(false)
const  autoMode  =  ref(true)  //  自动省电模式

//  当前省电配置
const  currentConfig  =  ref<PowerSavingConfig>({
    reduceAnimations:  false,
    lowerQuality:  false,
    disableAutoplay:  false,
    limitRefresh:  false,
    dimScreen:  false,
})

//  省电建议
const  savingTips  =  computed(()  =>  {
    const  tips  =  []

    if  (currentConfig.value.reduceAnimations)  {
        tips.push('已减少动画效果以节省电量')
    }
    if  (currentConfig.value.lowerQuality)  {
        tips.push('已降低图片和视频质量')
    }
    if  (currentConfig.value.disableAutoplay)  {
        tips.push('已禁用媒体自动播放')
    }
    if  (currentConfig.value.limitRefresh)  {
        tips.push('已限制后台数据刷新')
    }
    if  (currentConfig.value.dimScreen)  {
        tips.push('建议降低屏幕亮度')
    }

    return  tips
})

//  预计节省的电量
const  estimatedSavings  =  computed(()  =>  {
    let  savings  =  0
    if  (currentConfig.value.reduceAnimations)  savings  +=  10
    if  (currentConfig.value.lowerQuality)  savings  +=  15
    if  (currentConfig.value.disableAutoplay)  savings  +=  20
    if  (currentConfig.value.limitRefresh)  savings  +=  15
    if  (currentConfig.value.dimScreen)  savings  +=  25
    return  savings
})

//  应用省电配置
const  applyPowerSaving  =  (enabled:  boolean)  =>  {
    powerSavingMode.value  =  enabled

    if  (enabled)  {
        //  根据电池状态选择省电级别
        if  (isCriticalBattery.value)  {
            //  严重低电量：启用所有省电措施
            currentConfig.value  =  {
                reduceAnimations:  true,
                lowerQuality:  true,
                disableAutoplay:  true,
                limitRefresh:  true,
                dimScreen:  true,
            }
        }  else  if  (isLowBattery.value)  {
            //  低电量：启用部分省电措施
            currentConfig.value  =  {
                reduceAnimations:  true,
                lowerQuality:  true,
                disableAutoplay:  true,
                limitRefresh:  false,
                dimScreen:  false,
            }
        }  else  {
            //  普通模式：基础省电
            currentConfig.value  =  {
                reduceAnimations:  true,
                lowerQuality:  false,
                disableAutoplay:  false,
                limitRefresh:  false,
                dimScreen:  false,
            }
        }

        //  应用到  DOM
        document.body.classList.add('power-saving-mode')

        if  (currentConfig.value.reduceAnimations)  {
            document.body.classList.add('reduce-animations')
        }
    }  else  {
        //  禁用省电模式
        currentConfig.value  =  {
            reduceAnimations:  false,
            lowerQuality:  false,
            disableAutoplay:  false,
            limitRefresh:  false,
            dimScreen:  false,
        }

        document.body.classList.remove('power-saving-mode',  'reduce-animations')
    }
}

//  手动切换省电模式
const  togglePowerSaving  =  ()  =>  {
    autoMode.value  =  false
    applyPowerSaving(!powerSavingMode.value)
}

//  启用自动模式
const  enableAutoMode  =  ()  =>  {
    autoMode.value  =  true
    //  立即根据当前电量决定是否启用省电模式
    if  (isLowBattery.value  &&  !isCharging.value)  {
        applyPowerSaving(true)
    }  else  {
        applyPowerSaving(false)
    }
}

//  监听电池状态变化
watch([isLowBattery,  isCriticalBattery,  isCharging],  ()  =>  {
    if  (autoMode.value)  {
        //  自动模式下根据电池状态调整
        if  ((isLowBattery.value  ||  isCriticalBattery.value)  &&  !isCharging.value)  {
            applyPowerSaving(true)
        }  else  if  (isCharging.value  ||  batteryPercentage.value  >  30)  {
            //  充电中或电量恢复时关闭省电模式
            applyPowerSaving(false)
        }
    }
})

onMounted(async  ()  =>  {
    await  loadModule()
    //  初始化时根据电量决定
    if  (autoMode.value  &&  isLowBattery.value  &&  !isCharging.value)  {
        applyPowerSaving(true)
    }
})
</script>

<template>
    <div  class="power-saving-manager">
        <div  class="manager-panel">
            <!--  标题  -->
            <div  class="panel-header">
                <h2>省电模式管理</h2>
                <p>智能调整应用性能，延长电池续航时间</p>
            </div>

            <!--  当前状态  -->
            <div  class="current-status">
                <div  class="status-indicator"  :class="{  active:  powerSavingMode  }">
                    <div  class="indicator-icon">
                        {{  powerSavingMode  ?  '🔋'  :  '⚡'  }}
                    </div>
                    <div  class="indicator-text">
                        <strong>{{  powerSavingMode  ?  '省电模式已启用'  :  '正常模式'  }}</strong>
                        <p  v-if="powerSavingMode">
                            预计可节省约  {{  estimatedSavings  }}%  的电量
                        </p>
                    </div>
                </div>
            </div>

            <!--  控制开关  -->
            <div  class="controls">
                <div  class="control-item">
                    <label  class="switch-label">
                        <input
                            type="checkbox"
                            :checked="autoMode"
                            @change="enableAutoMode"
                        />
                        <span  class="switch-slider"></span>
                    </label>
                    <div  class="control-text">
                        <strong>自动省电模式</strong>
                        <p>根据电池状态自动调整</p>
                    </div>
                </div>

                <div  v-if="!autoMode"  class="control-item">
                    <label  class="switch-label">
                        <input
                            type="checkbox"
                            :checked="powerSavingMode"
                            @change="togglePowerSaving"
                        />
                        <span  class="switch-slider"></span>
                    </label>
                    <div  class="control-text">
                        <strong>手动省电模式</strong>
                        <p>手动控制省电功能</p>
                    </div>
                </div>
            </div>

            <!--  配置详情  -->
            <div  v-if="powerSavingMode"  class="config-details">
                <h3>当前省电配置</h3>
                <div  class="config-list">
                    <div  v-for="(enabled,  key)  in  currentConfig"  :key="key"  class="config-item">
                        <div  class="config-icon">
                            {{  enabled  ?  '✓'  :  '○'  }}
                        </div>
                        <div  class="config-text">
                            {{  key  ===  'reduceAnimations'  ?  '减少动画'  :
                                        key  ===  'lowerQuality'  ?  '降低质量'  :
                                        key  ===  'disableAutoplay'  ?  '禁用自动播放'  :
                                        key  ===  'limitRefresh'  ?  '限制刷新'  :
                                        '降低亮度'  }}
                        </div>
                        <div  :class="['config-status',  {  enabled  }]">
                            {{  enabled  ?  '已启用'  :  '未启用'  }}
                        </div>
                    </div>
                </div>
            </div>

            <!--  省电建议  -->
            <div  v-if="savingTips.length  >  0"  class="tips-section">
                <h3>省电提示</h3>
                <ul  class="tips-list">
                    <li  v-for="(tip,  index)  in  savingTips"  :key="index">
                        {{  tip  }}
                    </li>
                </ul>
            </div>

            <!--  额外建议  -->
            <div  v-if="isLowBattery  &&  !isCharging"  class="additional-tips">
                <h4>更多省电建议：</h4>
                <ul>
                    <li>关闭不必要的后台应用</li>
                    <li>降低屏幕亮度</li>
                    <li>关闭蓝牙和  WiFi（如不需要）</li>
                    <li>启用飞行模式（极端情况）</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style  scoped>
.power-saving-manager  {
    max-width:  800px;
    margin:  0  auto;
    padding:  20px;
}

.manager-panel  {
    background:  white;
    border-radius:  16px;
    padding:  32px;
    box-shadow:  0  4px  16px  rgba(0,  0,  0,  0.1);
}

.panel-header  h2  {
    margin:  0  0  8px  0;
    color:  #333;
    font-size:  24px;
}

.panel-header  p  {
    margin:  0;
    color:  #666;
    font-size:  14px;
}

.current-status  {
    margin:  24px  0;
}

.status-indicator  {
    display:  flex;
    align-items:  center;
    gap:  20px;
    padding:  24px;
    background:  #f5f5f5;
    border-radius:  12px;
    border:  2px  solid  transparent;
    transition:  all  0.3s;
}

.status-indicator.active  {
    background:  #e8f5e9;
    border-color:  #4caf50;
}

.indicator-icon  {
    font-size:  48px;
}

.indicator-text  strong  {
    display:  block;
    font-size:  18px;
    color:  #333;
    margin-bottom:  4px;
}

.indicator-text  p  {
    margin:  0;
    color:  #666;
    font-size:  14px;
}

.controls  {
    display:  flex;
    flex-direction:  column;
    gap:  16px;
    margin:  24px  0;
}

.control-item  {
    display:  flex;
    align-items:  center;
    gap:  16px;
    padding:  16px;
    background:  #f9f9f9;
    border-radius:  8px;
}

.switch-label  {
    position:  relative;
    display:  inline-block;
    width:  50px;
    height:  28px;
    flex-shrink:  0;
}

.switch-label  input  {
    opacity:  0;
    width:  0;
    height:  0;
}

.switch-slider  {
    position:  absolute;
    cursor:  pointer;
    top:  0;
    left:  0;
    right:  0;
    bottom:  0;
    background:  #ccc;
    transition:  0.4s;
    border-radius:  28px;
}

.switch-slider::before  {
    position:  absolute;
    content:  '';
    height:  20px;
    width:  20px;
    left:  4px;
    bottom:  4px;
    background:  white;
    transition:  0.4s;
    border-radius:  50%;
}

input:checked  +  .switch-slider  {
    background:  #4caf50;
}

input:checked  +  .switch-slider::before  {
    transform:  translateX(22px);
}

.control-text  {
    flex:  1;
}

.control-text  strong  {
    display:  block;
    color:  #333;
    font-size:  16px;
    margin-bottom:  4px;
}

.control-text  p  {
    margin:  0;
    color:  #666;
    font-size:  13px;
}

.config-details  {
    margin:  24px  0;
    padding:  20px;
    background:  #f9f9f9;
    border-radius:  8px;
}

.config-details  h3  {
    margin:  0  0  16px  0;
    font-size:  18px;
    color:  #333;
}

.config-list  {
    display:  flex;
    flex-direction:  column;
    gap:  12px;
}

.config-item  {
    display:  flex;
    align-items:  center;
    gap:  12px;
}

.config-icon  {
    width:  24px;
    height:  24px;
    border-radius:  50%;
    background:  white;
    display:  flex;
    align-items:  center;
    justify-content:  center;
    font-size:  14px;
    font-weight:  bold;
    color:  #4caf50;
}

.config-text  {
    flex:  1;
    color:  #333;
}

.config-status  {
    font-size:  13px;
    padding:  4px  12px;
    border-radius:  12px;
    background:  #e0e0e0;
    color:  #666;
}

.config-status.enabled  {
    background:  #c8e6c9;
    color:  #2e7d32;
}

.tips-section  {
    margin:  24px  0;
}

.tips-section  h3  {
    margin:  0  0  12px  0;
    font-size:  16px;
    color:  #333;
}

.tips-list  {
    margin:  0;
    padding-left:  24px;
    color:  #666;
    line-height:  1.8;
}

.additional-tips  {
    padding:  20px;
    background:  #fff3e0;
    border-radius:  8px;
    border-left:  4px  solid  #ff9800;
    margin-top:  24px;
}

.additional-tips  h4  {
    margin:  0  0  12px  0;
    color:  #e65100;
    font-size:  16px;
}

.additional-tips  ul  {
    margin:  0;
    padding-left:  24px;
    color:  #e65100;
    line-height:  1.8;
}

/*  省电模式全局样式  */
:global(body.power-saving-mode)  {
    /*  可以在这里添加全局省电样式  */
}

:global(body.reduce-animations)  *  {
    animation-duration:  0.01ms  !important;
    animation-iteration-count:  1  !important;
    transition-duration:  0.01ms  !important;
}

@media  (max-width:  768px)  {
    .manager-panel  {
        padding:  20px;
    }

    .status-indicator  {
        flex-direction:  column;
        text-align:  center;
    }
}
</style>
```

---

##  原生  JavaScript  实现方式

###  电池监控管理器

```typescript
import  {  DeviceDetector  }  from  '@ldesign/device'

/**
  *  电池监控管理器
  */
class  BatteryMonitor  {
    private  detector:  DeviceDetector
    private  batteryModule:  any
    private  callbacks:  Map<string,  Set<Function>>  =  new  Map()
    private  updateInterval:  number  |  null  =  null

    constructor()  {
        this.detector  =  new  DeviceDetector()
        this.init()
    }

    private  async  init()  {
        try  {
            //  加载电池模块
            this.batteryModule  =  await  this.detector.loadModule('battery')

            //  立即获取初始状态
            const  initialInfo  =  this.batteryModule.getData()
            this.emit('update',  initialInfo)

            //  定期更新电池信息（每  30  秒）
            this.startPeriodicUpdate()

            console.log('电池监控器初始化成功')
        }  catch  (error)  {
            console.error('电池模块加载失败:',  error)
            this.emit('error',  {  message:  '设备不支持电池  API'  })
        }
    }

    /**
      *  开始定期更新
      */
    private  startPeriodicUpdate()  {
        this.updateInterval  =  window.setInterval(()  =>  {
            if  (this.batteryModule)  {
                const  info  =  this.batteryModule.getData()
                this.emit('update',  info)

                //  检查电量变化
                this.checkBatteryLevel(info.level)
            }
        },  30000)  //  每  30  秒更新一次
    }

    /**
      *  检查电池电量并触发相应事件
      */
    private  checkBatteryLevel(level:  number)  {
        const  percentage  =  Math.round(level  *  100)

        if  (percentage  <=  10)  {
            this.emit('critical',  {  level,  percentage  })
        }  else  if  (percentage  <=  20)  {
            this.emit('low',  {  level,  percentage  })
        }  else  if  (percentage  >=  80)  {
            this.emit('high',  {  level,  percentage  })
        }
    }

    /**
      *  获取当前电池信息
      */
    getBatteryInfo()  {
        if  (!this.batteryModule)  return  null
        return  this.batteryModule.getData()
    }

    /**
      *  获取电池电量百分比
      */
    getBatteryPercentage():  number  {
        const  info  =  this.getBatteryInfo()
        if  (!info)  return  100
        return  Math.round(info.level  *  100)
    }

    /**
      *  是否正在充电
      */
    isCharging():  boolean  {
        if  (!this.batteryModule)  return  false
        return  this.batteryModule.isCharging()
    }

    /**
      *  是否低电量
      */
    isLowBattery():  boolean  {
        return  this.getBatteryPercentage()  <  20
    }

    /**
      *  是否严重低电量
      */
    isCriticalBattery():  boolean  {
        return  this.getBatteryPercentage()  <  10
    }

    /**
      *  获取电池状态描述
      */
    getBatteryStatus():  string  {
        if  (!this.batteryModule)  return  'unknown'
        return  this.batteryModule.getBatteryStatus()
    }

    /**
      *  手动刷新电池信息
      */
    refresh()  {
        if  (this.batteryModule)  {
            const  info  =  this.batteryModule.getData()
            this.emit('update',  info)
            return  info
        }
        return  null
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
      *  销毁监控器
      */
    async  destroy()  {
        if  (this.updateInterval)  {
            clearInterval(this.updateInterval)
            this.updateInterval  =  null
        }
        this.callbacks.clear()
        await  this.detector.destroy()
    }
}

//  使用示例
const  batteryMonitor  =  new  BatteryMonitor()

//  监听电池信息更新
batteryMonitor.on('update',  (info)  =>  {
    console.log('电池信息更新:',  info)
    updateBatteryUI(info)
})

//  监听低电量
batteryMonitor.on('low',  ({  percentage  })  =>  {
    console.warn(`低电量警告:  ${percentage}%`)
    showLowBatteryWarning(percentage)
})

//  监听严重低电量
batteryMonitor.on('critical',  ({  percentage  })  =>  {
    console.error(`严重低电量警告:  ${percentage}%`)
    enableEmergencyMode()
})

//  监听错误
batteryMonitor.on('error',  ({  message  })  =>  {
    console.error('电池监控错误:',  message)
    showErrorMessage(message)
})

//  辅助函数
function  updateBatteryUI(info:  any)  {
    const  percentage  =  Math.round(info.level  *  100)
    const  batteryEl  =  document.getElementById('battery-level')
    if  (batteryEl)  {
        batteryEl.textContent  =  `${percentage}%`
        batteryEl.style.width  =  `${percentage}%`
    }
}

function  showLowBatteryWarning(percentage:  number)  {
    alert(`电量不足：${percentage}%，请尽快充电`)
}

function  enableEmergencyMode()  {
    document.body.classList.add('emergency-mode')
    //  禁用非必要功能
    disableAnimations()
    lowerMediaQuality()
}

function  disableAnimations()  {
    document.body.classList.add('no-animations')
}

function  lowerMediaQuality()  {
    //  降低媒体质量逻辑
    console.log('已降低媒体质量以节省电量')
}

function  showErrorMessage(message:  string)  {
    console.error(message)
}
```

---

##  代码解释

###  关键概念

1.  **电池  API**：使用  Web  Battery  API  获取电池信息
2.  **实时监控**：定期更新电池状态，及时响应变化
3.  **智能省电**：根据电池电量自动调整应用性能
4.  **优雅降级**：在不支持电池  API  的设备上提供默认行为

###  浏览器兼容性

-  Chrome  38+  (部分支持)
-  Firefox  43+  (部分支持)
-  Safari:  不支持
-  Edge  79+  (部分支持)

注意：电池  API  在许多浏览器中已被限制或移除，使用时需要做好兼容处理。

---

##  扩展建议

1.  **电池历史记录**
      ```typescript
      //  记录电池使用历史
      class  BatteryHistory  {
          private  history:  BatteryRecord[]  =  []

          addRecord(info:  BatteryInfo)  {
              this.history.push({  ...info,  timestamp:  Date.now()  })
          }

          getUsageTrend()  {
              //  分析电量使用趋势
          }
      }
      ```

2.  **智能充电提醒**
      ```typescript
      //  根据使用习惯提醒充电
      function  shouldRemindCharging()  {
          const  currentHour  =  new  Date().getHours()
          const  batteryLevel  =  batteryMonitor.getBatteryPercentage()

          //  例如：晚上  10  点且电量低于  30%
          return  currentHour  >=  22  &&  batteryLevel  <  30
      }
      ```

3.  **电量预测**
      ```typescript
      //  预测电池耗尽时间
      function  predictBatteryLife(currentLevel:  number,  dischargingTime:  number)  {
          //  基于当前电量和放电速率预测
          return  (currentLevel  *  dischargingTime)  /  (1  -  currentLevel)
      }
      ```

---

##  最佳实践

1.  **做好兼容处理**：始终检查  API  可用性
2.  **合理更新频率**：避免频繁检查电池状态
3.  **提供用户控制**：让用户选择是否启用省电模式
4.  **渐进增强**：在不支持的设备上提供基础功能
5.  **尊重用户选择**：不要过度干预用户体验

---

##  相关链接

-  [基础使用示例](./index.md)  -  设备检测基础
-  [响应式设计示例](./responsive.md)  -  响应式布局
-  [网络状态监听示例](./network.md)  -  网络状态监控
-  [地理位置示例](./geolocation.md)  -  地理位置获取
-  [API  参考文档](../api/)  -  完整  API  文档
