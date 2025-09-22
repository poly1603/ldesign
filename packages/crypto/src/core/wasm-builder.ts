/**
 * WebAssembly 模块构建器
 * 用于生成优化的 WASM 字节码
 */

/**
 * WASM 指令集
 */
enum WasmOpcode {
  // 控制流
  UNREACHABLE = 0x00,
  NOP = 0x01,
  BLOCK = 0x02,
  LOOP = 0x03,
  IF = 0x04,
  ELSE = 0x05,
  END = 0x0B,
  BR = 0x0C,
  BR_IF = 0x0D,
  BR_TABLE = 0x0E,
  RETURN = 0x0F,
  CALL = 0x10,
  CALL_INDIRECT = 0x11,

  // 参数指令
  DROP = 0x1A,
  SELECT = 0x1B,

  // 变量指令
  LOCAL_GET = 0x20,
  LOCAL_SET = 0x21,
  LOCAL_TEE = 0x22,
  GLOBAL_GET = 0x23,
  GLOBAL_SET = 0x24,

  // 内存指令
  I32_LOAD = 0x28,
  I64_LOAD = 0x29,
  F32_LOAD = 0x2A,
  F64_LOAD = 0x2B,
  I32_LOAD8_S = 0x2C,
  I32_LOAD8_U = 0x2D,
  I32_LOAD16_S = 0x2E,
  I32_LOAD16_U = 0x2F,
  I64_LOAD8_S = 0x30,
  I64_LOAD8_U = 0x31,
  I64_LOAD16_S = 0x32,
  I64_LOAD16_U = 0x33,
  I64_LOAD32_S = 0x34,
  I64_LOAD32_U = 0x35,
  I32_STORE = 0x36,
  I64_STORE = 0x37,
  F32_STORE = 0x38,
  F64_STORE = 0x39,
  I32_STORE8 = 0x3A,
  I32_STORE16 = 0x3B,
  I64_STORE8 = 0x3C,
  I64_STORE16 = 0x3D,
  I64_STORE32 = 0x3E,
  MEMORY_SIZE = 0x3F,
  MEMORY_GROW = 0x40,

  // 常量
  I32_CONST = 0x41,
  I64_CONST = 0x42,
  F32_CONST = 0x43,
  F64_CONST = 0x44,

  // 数值操作 (i32)
  I32_EQZ = 0x45,
  I32_EQ = 0x46,
  I32_NE = 0x47,
  I32_LT_S = 0x48,
  I32_LT_U = 0x49,
  I32_GT_S = 0x4A,
  I32_GT_U = 0x4B,
  I32_LE_S = 0x4C,
  I32_LE_U = 0x4D,
  I32_GE_S = 0x4E,
  I32_GE_U = 0x4F,
  I32_CLZ = 0x67,
  I32_CTZ = 0x68,
  I32_POPCNT = 0x69,
  I32_ADD = 0x6A,
  I32_SUB = 0x6B,
  I32_MUL = 0x6C,
  I32_DIV_S = 0x6D,
  I32_DIV_U = 0x6E,
  I32_REM_S = 0x6F,
  I32_REM_U = 0x70,
  I32_AND = 0x71,
  I32_OR = 0x72,
  I32_XOR = 0x73,
  I32_SHL = 0x74,
  I32_SHR_S = 0x75,
  I32_SHR_U = 0x76,
  I32_ROTL = 0x77,
  I32_ROTR = 0x78,
}

/**
 * WASM 类型
 */
enum WasmType {
  I32 = 0x7F,
  I64 = 0x7E,
  F32 = 0x7D,
  F64 = 0x7C,
  FUNC = 0x60,
  VOID = 0x40,
}

/**
 * WASM 段类型
 */
enum WasmSection {
  CUSTOM = 0,
  TYPE = 1,
  IMPORT = 2,
  FUNCTION = 3,
  TABLE = 4,
  MEMORY = 5,
  GLOBAL = 6,
  EXPORT = 7,
  START = 8,
  ELEMENT = 9,
  CODE = 10,
  DATA = 11,
}

/**
 * WASM 模块构建器
 */
export class WasmModuleBuilder {
  private bytes: number[] = []
  private types: any[] = []
  private functions: any[] = []
  private exports: any[] = []
  private memory: { initial: number, maximum?: number } | null = null
  private data: any[] = []

  constructor() {
    // 添加 WASM 魔数和版本
    this.bytes.push(...[0x00, 0x61, 0x73, 0x6D]) // \0asm
    this.bytes.push(...[0x01, 0x00, 0x00, 0x00]) // version 1
  }

  /**
   * 添加函数类型
   */
  addType(params: WasmType[], results: WasmType[]): number {
    const type = { params, results }
    this.types.push(type)
    return this.types.length - 1
  }

  /**
   * 添加函数
   */
  addFunction(
    name: string,
    typeIndex: number,
    locals: WasmType[],
    body: number[],
  ): number {
    const func = { name, typeIndex, locals, body }
    this.functions.push(func)
    const funcIndex = this.functions.length - 1

    // 添加导出
    this.exports.push({
      name,
      kind: 0x00, // function export
      index: funcIndex,
    })

    return funcIndex
  }

  /**
   * 设置内存
   */
  setMemory(initial: number, maximum?: number): void {
    this.memory = { initial, maximum }
  }

  /**
   * 添加数据段
   */
  addData(offset: number, data: Uint8Array): void {
    this.data.push({ offset, data })
  }

  /**
   * 构建模块
   */
  build(): Uint8Array {
    const module: number[] = [...this.bytes]

    // Type section
    if (this.types.length > 0) {
      this.writeSection(module, WasmSection.TYPE, () => {
        const section: number[] = []
        this.writeVarUint(section, this.types.length)
        for (const type of this.types) {
          section.push(WasmType.FUNC)
          this.writeVarUint(section, type.params.length)
          section.push(...type.params)
          this.writeVarUint(section, type.results.length)
          section.push(...type.results)
        }
        return section
      })
    }

    // Function section
    if (this.functions.length > 0) {
      this.writeSection(module, WasmSection.FUNCTION, () => {
        const section: number[] = []
        this.writeVarUint(section, this.functions.length)
        for (const func of this.functions) {
          this.writeVarUint(section, func.typeIndex)
        }
        return section
      })
    }

    // Memory section
    if (this.memory) {
      this.writeSection(module, WasmSection.MEMORY, () => {
        const section: number[] = []
        this.writeVarUint(section, 1) // 1 memory
        const flags = this.memory!.maximum !== undefined ? 0x01 : 0x00
        section.push(flags)
        this.writeVarUint(section, this.memory!.initial)
        if (this.memory!.maximum !== undefined) {
          this.writeVarUint(section, this.memory!.maximum!)
        }
        return section
      })
    }

    // Export section
    if (this.exports.length > 0) {
      this.writeSection(module, WasmSection.EXPORT, () => {
        const section: number[] = []
        this.writeVarUint(section, this.exports.length)
        for (const exp of this.exports) {
          this.writeString(section, exp.name)
          section.push(exp.kind)
          this.writeVarUint(section, exp.index)
        }
        return section
      })
    }

    // Code section
    if (this.functions.length > 0) {
      this.writeSection(module, WasmSection.CODE, () => {
        const section: number[] = []
        this.writeVarUint(section, this.functions.length)
        for (const func of this.functions) {
          const funcBody: number[] = []

          // Locals
          if (func.locals.length > 0) {
            this.writeVarUint(funcBody, 1) // 1 local group
            this.writeVarUint(funcBody, func.locals.length)
            funcBody.push(func.locals[0]) // assuming all same type
          }
          else {
            this.writeVarUint(funcBody, 0) // no locals
          }

          // Body
          funcBody.push(...func.body)
          funcBody.push(WasmOpcode.END)

          this.writeVarUint(section, funcBody.length)
          section.push(...funcBody)
        }
        return section
      })
    }

    // Data section
    if (this.data.length > 0) {
      this.writeSection(module, WasmSection.DATA, () => {
        const section: number[] = []
        this.writeVarUint(section, this.data.length)
        for (const segment of this.data) {
          section.push(0x00) // active segment, memory index 0
          // Offset expression
          section.push(WasmOpcode.I32_CONST)
          this.writeVarInt(section, segment.offset)
          section.push(WasmOpcode.END)
          // Data
          this.writeVarUint(section, segment.data.length)
          section.push(...Array.from(segment.data as Uint8Array))
        }
        return section
      })
    }

    return new Uint8Array(module)
  }

  /**
   * 写入段
   */
  private writeSection(
    module: number[],
    type: WasmSection,
    contentBuilder: () => number[],
  ): void {
    const content = contentBuilder()
    module.push(type)
    this.writeVarUint(module, content.length)
    module.push(...content)
  }

  /**
   * 写入变长无符号整数
   */
  private writeVarUint(bytes: number[], value: number): void {
    while (value >= 0x80) {
      bytes.push((value & 0x7F) | 0x80)
      value >>>= 7
    }
    bytes.push(value)
  }

  /**
   * 写入变长有符号整数
   */
  private writeVarInt(bytes: number[], value: number): void {
    const negative = value < 0
    while (true) {
      const byte = value & 0x7F
      value >>= 7
      if (negative) {
        value |= -(1 << 25)
      }
      if ((value === 0 && (byte & 0x40) === 0)
        || (value === -1 && (byte & 0x40) !== 0)) {
        bytes.push(byte)
        break
      }
      bytes.push(byte | 0x80)
    }
  }

  /**
   * 写入字符串
   */
  private writeString(bytes: number[], str: string): void {
    const encoded = new TextEncoder().encode(str)
    this.writeVarUint(bytes, encoded.length)
    bytes.push(...Array.from(encoded))
  }
}

/**
 * 创建 SHA256 WASM 模块
 */
export function createSHA256WasmModule(): Uint8Array {
  const builder = new WasmModuleBuilder()

  // 设置内存 (1 页 = 64KB)
  builder.setMemory(1, 2)

  // 添加类型：allocate(size: i32) -> i32
  const allocateType = builder.addType([WasmType.I32], [WasmType.I32])

  // 添加类型：free(ptr: i32) -> void
  const freeType = builder.addType([WasmType.I32], [])

  // 添加类型：sha256(input: i32, len: i32, output: i32) -> void
  const sha256Type = builder.addType(
    [WasmType.I32, WasmType.I32, WasmType.I32],
    [],
  )

  // 简单的内存分配器（示例）
  const memoryOffset = 0

  // allocate 函数
  builder.addFunction('allocate', allocateType, [], [
    WasmOpcode.I32_CONST,
    ...encodeI32(memoryOffset),
    WasmOpcode.LOCAL_GET,
    0, // size
    WasmOpcode.I32_ADD,
    WasmOpcode.I32_CONST,
    ...encodeI32(memoryOffset),
    WasmOpcode.RETURN,
  ])

  // free 函数（空实现）
  builder.addFunction('free', freeType, [], [
    WasmOpcode.RETURN,
  ])

  // sha256 函数（简化实现）
  builder.addFunction('sha256', sha256Type, [WasmType.I32], [
    // 这里应该是完整的 SHA256 实现
    // 为了示例，只是简单复制输入到输出

    // 循环 32 次（SHA256 输出 32 字节）
    WasmOpcode.I32_CONST,
    0,
    WasmOpcode.LOCAL_SET,
    3, // i = 0

    WasmOpcode.BLOCK,
    WasmType.VOID,
    WasmOpcode.LOOP,
    WasmType.VOID,
    // 检查 i < 32
    WasmOpcode.LOCAL_GET,
    3,
    WasmOpcode.I32_CONST,
    32,
    WasmOpcode.I32_GE_U,
    WasmOpcode.BR_IF,
    1,

    // 从输入读取字节
    WasmOpcode.LOCAL_GET,
    0, // input ptr
    WasmOpcode.LOCAL_GET,
    3, // i
    WasmOpcode.I32_ADD,
    WasmOpcode.I32_LOAD8_U,
    0,
    0,

    // 写入到输出
    WasmOpcode.LOCAL_GET,
    2, // output ptr
    WasmOpcode.LOCAL_GET,
    3, // i
    WasmOpcode.I32_ADD,
    WasmOpcode.I32_STORE8,
    0,
    0,

    // i++
    WasmOpcode.LOCAL_GET,
    3,
    WasmOpcode.I32_CONST,
    1,
    WasmOpcode.I32_ADD,
    WasmOpcode.LOCAL_SET,
    3,

    WasmOpcode.BR,
    0,
    WasmOpcode.END,
    WasmOpcode.END,
  ])

  return builder.build()
}

/**
 * 创建 AES WASM 模块
 */
export function createAESWasmModule(): Uint8Array {
  const builder = new WasmModuleBuilder()

  // 设置内存
  builder.setMemory(2, 4)

  // 添加类型
  const allocateType = builder.addType([WasmType.I32], [WasmType.I32])
  const freeType = builder.addType([WasmType.I32], [])
  const aesEncryptType = builder.addType(
    [
      WasmType.I32,
      WasmType.I32, // data, data_len
      WasmType.I32,
      WasmType.I32, // key, key_len
      WasmType.I32,
      WasmType.I32, // iv, iv_len
      WasmType.I32, // output
    ],
    [WasmType.I32], // return length
  )

  // allocate 函数
  const memoryOffset = 0
  builder.addFunction('allocate', allocateType, [], [
    WasmOpcode.I32_CONST,
    ...encodeI32(memoryOffset),
    WasmOpcode.LOCAL_GET,
    0,
    WasmOpcode.I32_ADD,
    WasmOpcode.I32_CONST,
    ...encodeI32(memoryOffset),
    WasmOpcode.RETURN,
  ])

  // free 函数
  builder.addFunction('free', freeType, [], [
    WasmOpcode.RETURN,
  ])

  // aes_encrypt 函数（简化实现）
  builder.addFunction('aes_encrypt', aesEncryptType, [], [
    // 返回输入长度 + 16（假设一个块的填充）
    WasmOpcode.LOCAL_GET,
    1, // data_len
    WasmOpcode.I32_CONST,
    16,
    WasmOpcode.I32_ADD,
    WasmOpcode.RETURN,
  ])

  return builder.build()
}

/**
 * 编码 i32 常量
 */
function encodeI32(value: number): number[] {
  const bytes: number[] = []
  const negative = value < 0
  while (true) {
    const byte = value & 0x7F
    value >>= 7
    if (negative) {
      value |= -(1 << 25)
    }
    if ((value === 0 && (byte & 0x40) === 0)
      || (value === -1 && (byte & 0x40) !== 0)) {
      bytes.push(byte)
      break
    }
    bytes.push(byte | 0x80)
  }
  return bytes
}

/**
 * 创建优化的 WASM 模块集合
 */
export class WasmModuleCollection {
  private modules: Map<string, Uint8Array> = new Map()

  constructor() {
    this.initializeModules()
  }

  /**
   * 初始化所有模块
   */
  private initializeModules(): void {
    // SHA256 模块
    this.modules.set('sha256', createSHA256WasmModule())

    // AES 模块
    this.modules.set('aes', createAESWasmModule())

    // 可以添加更多模块...
  }

  /**
   * 获取模块
   */
  getModule(name: string): Uint8Array | undefined {
    return this.modules.get(name)
  }

  /**
   * 获取所有模块名称
   */
  getModuleNames(): string[] {
    return Array.from(this.modules.keys())
  }

  /**
   * 添加自定义模块
   */
  addModule(name: string, wasmBytes: Uint8Array): void {
    this.modules.set(name, wasmBytes)
  }
}
