/**
    *    统一缓存接口
    *    为所有缓存实现提供统一的接口定义
    */

/**
    *    基础缓存接口
    */
export    interface    ICache<K    =    string,    V    =    any>    {
                /**    设置缓存    */
                set: (key:    K,    value:    V,    ttl?:    number) => void

                /**    获取缓存    */
                get: (key:    K) => V    |    undefined

                /**    检查缓存是否存在    */
                has: (key:    K) => boolean

                /**    删除缓存    */
                delete: (key:    K) => boolean

                /**    清空缓存    */
                clear: () => void

                /**    获取缓存大小    */
                size: () => number

                /**    销毁缓存    */
                dispose: () => void
}

/**
    *    可统计的缓存接口
    */
export    interface    IStatisticalCache<K    =    string,    V    =    any>    extends    ICache<K,    V>    {
                /**    获取统计信息    */
                getStats: () => {
                                hits:    number
                                misses:    number
                                hitRate:    number
                                size:    number
                                evictions:    number
                                operations:    number
                }

                /**    获取热门键    */
                getHotKeys: (limit?:    number) => K[]
}

/**
    *    可预热的缓存接口
    */
export    interface    IWarmableCache<K    =    string,    V    =    any>    extends    ICache<K,    V>    {
                /**    注册预热任务    */
                registerWarmup: (key:    K,    loader:    ()    =>    Promise<V>    |    V) => void

                /**    执行预热    */
                warmup: (keys?:    K[]) => Promise<void>
}
