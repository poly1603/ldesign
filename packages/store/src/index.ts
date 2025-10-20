/**
  *  @ldesign/store  -  现代化的  Vue  状态管理库
  *
  *  基于  Pinia  构建，提供装饰器、Hooks、类型安全等现代化特性
  *  支持多种使用方式：装饰器、函数式、Composition  API
  */

import  'reflect-metadata'

//  ============================================
//  核心模块导出
//  ============================================

//  核心功能（包含  BaseStore,  性能优化器,  Store工厂等）
export  *  from  './core'

//  装饰器
export  *  from  './decorators'

//  DevTools（额外导出，方便直接使用）
export  {
        ConsoleFormatter,
        DevToolsConnection,
        StoreDevTools,
        VisualInspector
}  from  './DevTools'

//  Engine  集成
export  *  from  './engine'

//  Hooks
export  *  from  './hooks'

//  ============================================
//  工具函数导出
//  ============================================

//  性能监控（额外导出，方便直接使用）
export  {
        PerformanceMonitor
}  from  './PerformanceMonitoring'
export  type  {
        ActionContext,
        ActionDefinition,
        //  配置类型
        CacheOptions,
        //  元数据类型
        DecoratorMetadata,
        GetterDefinition,
        //  Store  接口
        IBaseStore,

        MutationCallback,
        PersistOptions,
        //  基础类型
        StateDefinition,

        StoreOptions,
        StrictActionDefinition,
        StrictGetterDefinition,

        StrictStateDefinition,
}  from  './types'

// Type exports - 明确导出以避免重复
export type {
  CacheStrategy,
  InferActions,
  InferGetters,
  InferState,
  ProviderOptions,
  SafeActionDefinition,
  SafeGetterDefinition,
  SafeStateDefinition,
  UseStoreReturn,
} from './types'

//  实用类型定义导出
export  type  {
        AbstractClass,
        //  函数类型
        AnyFunction,
        //  对象类型
        AnyObject,
        //  数组类型
        ArrayElement,
        ArrayType,

        AsyncFunction,
        Class,
        DeepMerge,

        DeepMutable,
        DeepPartial,
        //  深度类型
        DeepReadonly,
        DeepRequired,

        EmptyObject,
        Equals,
        Flatten,
        FunctionArgs,

        FunctionKeys,
        FunctionReturn,
        //  条件类型
        If,

        JSONArray,
        JSONObject,

        //  JSON  类型
        JSONValue,
        KeyOf,

        KeysOfType,
        Maybe,
        Merge,
        //  修饰类型
        Mutable,
        NonFunctionKeys,
        NonPrimitive,
        //  可空类型
        Nullable,
        NullableBy,
        Optional,

        OptionalBy,
        OptionalKeys,
        Override,
        PartialBy,

        //  路径类型
        PathsOf,
        PathValue,
        //  其他实用类型
        Primitive,
        ReadonlyBy,
        RequiredBy,
        RequiredKeys,
        Serializable,
        ValueOf,
        WritableBy,
}  from  './types/utility-types'

//  高级缓存
export  {
        AdaptiveCache,
        CacheAnalyzer,
        CacheWarmer,
        MultiLevelCache,
}  from  './utils/advanced-cache'

export  type  {
        CacheStats,
}  from  './utils/advanced-cache'

//  缓存工具
export  {
        fastHash,
        LRUCache,
        ObjectPool,
}  from  './utils/cache'

//  缓存接口
export  type  {
  ICache,
  IStatisticalCache,
  IWarmableCache,
}  from  "./utils/cache-interface"

// 快速序列化工具（性能优化）
export {
  fastEqual,
  fastParse,
  fastStringify,
  safeCopy,
  shallowCopy,
} from './utils/fast-serializer'

//  辅助工具函数
export  {
        batch,
        chunk,
        debounce,
        deepClone,
        deepEqual,
        deepFreeze,
        deepMerge,
        delay,
        deleteDeepValue,
        flattenObject,
        formatBytes,
        formatDuration,
        generateId,
        getDeepValue,
        groupBy,
        memoize,
        omit,
        pick,
        pLimit,
        retry,
        safeEntries,
        safeKeys,
        safeValues,
        setDeepValue,
        throttle,
        unflattenObject,
        unique,
}  from  './utils/helpers'

//  ============================================
//  类型定义导出
//  类型定义导出

//  验证和错误处理工具
export  {
        Assert,
        AssertionError,
        ErrorHandler,
        safeJsonParse,
        safeJsonStringify,
        StoreConfigValidator,
        TypeGuards,
        ValidationError,
        Validator,
}  from  './utils/validation'

export  type  {
        ValidationResult,
        ValidationRule,
}  from  './utils/validation'

//  版本信息
export  const  version  =  '0.1.0'


//  Vue  集成
export  *  from  './vue'
