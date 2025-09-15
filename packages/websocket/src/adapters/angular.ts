/**
 * Angular适配器
 * 为Angular提供WebSocket集成的服务和RxJS支持
 */

import { Injectable, OnDestroy, NgZone } from '@angular/core'
import { BehaviorSubject, Observable, Subject, fromEvent } from 'rxjs'
import { takeUntil, map, filter } from 'rxjs/operators'
import { BaseAdapter, type AdapterState, type AdapterConfig, type AdapterEvents } from './base'
import type { WebSocketClient } from '../core/websocket-client'
import type { WebSocketConfig, WebSocketMessage, WebSocketState } from '../types'
import { createWebSocketClient } from '../factory'

/**
 * Angular WebSocket服务配置接口
 */
export interface AngularWebSocketConfig extends AdapterConfig {
  /** WebSocket配置 */
  websocketConfig?: Partial<WebSocketConfig>
  /** 是否在NgZone外运行 */
  runOutsideAngular?: boolean
}

/**
 * Angular WebSocket服务
 * 提供基于RxJS的WebSocket功能
 * 
 * @example
 * ```typescript
 * import { Component, OnInit, OnDestroy } from '@angular/core'
 * import { AngularWebSocketService } from '@ldesign/websocket/adapters/angular'
 * 
 * @Component({
 *   selector: 'app-websocket',
 *   template: `
 *     <div>
 *       <p>状态: {{ (state$ | async) }}</p>
 *       <p>已连接: {{ (connected$ | async) ? '是' : '否' }}</p>
 *       <button (click)="connect()" [disabled]="connecting$ | async">连接</button>
 *       <button (click)="disconnect()" [disabled]="!(connected$ | async)">断开</button>
 *       <button (click)="sendMessage()" [disabled]="!(connected$ | async)">发送消息</button>
 *       <div *ngIf="lastMessage$ | async as message">
 *         <h3>最后收到的消息:</h3>
 *         <pre>{{ message | json }}</pre>
 *       </div>
 *     </div>
 *   `
 * })
 * export class WebSocketComponent implements OnInit, OnDestroy {
 *   state$ = this.wsService.state$
 *   connected$ = this.wsService.connected$
 *   connecting$ = this.wsService.connecting$
 *   lastMessage$ = this.wsService.lastMessage$
 * 
 *   constructor(private wsService: AngularWebSocketService) {}
 * 
 *   ngOnInit() {
 *     this.wsService.connect('ws://localhost:8080')
 *     
 *     // 订阅消息
 *     this.wsService.messages$.subscribe(message => {
 *       console.log('收到消息:', message)
 *     })
 *   }
 * 
 *   ngOnDestroy() {
 *     this.wsService.disconnect()
 *   }
 * 
 *   connect() {
 *     this.wsService.connect()
 *   }
 * 
 *   disconnect() {
 *     this.wsService.disconnect()
 *   }
 * 
 *   sendMessage() {
 *     this.wsService.send({ type: 'hello', data: 'world' })
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AngularWebSocketService implements OnDestroy {
  private adapter: AngularAdapter | null = null
  private destroy$ = new Subject<void>()

  // 状态流
  private stateSubject = new BehaviorSubject<WebSocketState>('disconnected')
  private connectedSubject = new BehaviorSubject<boolean>(false)
  private connectingSubject = new BehaviorSubject<boolean>(false)
  private reconnectingSubject = new BehaviorSubject<boolean>(false)
  private lastErrorSubject = new BehaviorSubject<Error | null>(null)
  private lastMessageSubject = new BehaviorSubject<WebSocketMessage | null>(null)
  private reconnectCountSubject = new BehaviorSubject<number>(0)
  private messagesSubject = new Subject<WebSocketMessage>()

  // 公开的Observable
  public readonly state$ = this.stateSubject.asObservable()
  public readonly connected$ = this.connectedSubject.asObservable()
  public readonly connecting$ = this.connectingSubject.asObservable()
  public readonly reconnecting$ = this.reconnectingSubject.asObservable()
  public readonly lastError$ = this.lastErrorSubject.asObservable()
  public readonly lastMessage$ = this.lastMessageSubject.asObservable()
  public readonly reconnectCount$ = this.reconnectCountSubject.asObservable()
  public readonly messages$ = this.messagesSubject.asObservable()

  constructor(private ngZone: NgZone) { }

  /**
   * 连接WebSocket
   * @param url WebSocket服务器URL
   * @param config 配置选项
   */
  public async connect(url?: string, config: AngularWebSocketConfig = {}): Promise<void> {
    if (this.adapter && url && this.adapter.getClient().getConfig().url !== url) {
      // URL变化，需要重新创建适配器
      this.disconnect()
      this.adapter = null
    }

    if (!this.adapter && url) {
      const client = createWebSocketClient({ url, ...config.websocketConfig })
      this.adapter = new AngularAdapter(client, config, this.ngZone)
      this.setupSubscriptions()
    }

    if (this.adapter) {
      return this.adapter.connect()
    }

    throw new Error('WebSocket适配器未初始化，请提供URL')
  }

  /**
   * 断开WebSocket连接
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  public disconnect(code?: number, reason?: string): void {
    if (this.adapter) {
      this.adapter.disconnect(code, reason)
    }
  }

  /**
   * 发送消息
   * @param data 消息数据
   */
  public async send(data: unknown): Promise<void> {
    if (this.adapter) {
      return this.adapter.send(data)
    }
    throw new Error('WebSocket未连接')
  }

  /**
   * 获取当前状态
   */
  public getState(): AdapterState | null {
    return this.adapter ? this.adapter.getState() : null
  }

  /**
   * 获取WebSocket客户端实例
   */
  public getClient(): WebSocketClient | null {
    return this.adapter ? this.adapter.getClient() : null
  }

  /**
   * 设置事件订阅
   */
  private setupSubscriptions(): void {
    if (!this.adapter) return

    // 订阅状态变化
    this.adapter.on('stateChange', (state: WebSocketState) => {
      this.ngZone.run(() => {
        this.stateSubject.next(state)
      })
    })

    // 订阅连接状态
    this.adapter.on('connected', () => {
      this.ngZone.run(() => {
        this.connectedSubject.next(true)
        this.connectingSubject.next(false)
        this.lastErrorSubject.next(null)
      })
    })

    // 订阅断开连接
    this.adapter.on('disconnected', () => {
      this.ngZone.run(() => {
        this.connectedSubject.next(false)
        this.connectingSubject.next(false)
        this.reconnectingSubject.next(false)
      })
    })

    // 订阅消息
    this.adapter.on('message', (message: WebSocketMessage) => {
      this.ngZone.run(() => {
        this.lastMessageSubject.next(message)
        this.messagesSubject.next(message)
      })
    })

    // 订阅错误
    this.adapter.on('error', (error: Error) => {
      this.ngZone.run(() => {
        this.lastErrorSubject.next(error)
      })
    })

    // 订阅重连
    this.adapter.on('reconnecting', (attempt: number) => {
      this.ngZone.run(() => {
        this.reconnectingSubject.next(true)
        this.reconnectCountSubject.next(attempt)
      })
    })
  }

  /**
   * 组件销毁时清理资源
   */
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()

    if (this.adapter) {
      this.adapter.destroy()
      this.adapter = null
    }

    // 完成所有Subject
    this.stateSubject.complete()
    this.connectedSubject.complete()
    this.connectingSubject.complete()
    this.reconnectingSubject.complete()
    this.lastErrorSubject.complete()
    this.lastMessageSubject.complete()
    this.reconnectCountSubject.complete()
    this.messagesSubject.complete()
  }

  /**
   * 过滤特定类型的消息
   * @param messageType 消息类型
   */
  public filterMessages<T = unknown>(messageType?: string): Observable<T> {
    return this.messages$.pipe(
      filter(message => !messageType || (message.data as any)?.type === messageType),
      map(message => message.data as T)
    )
  }

  /**
   * 等待连接建立
   */
  public waitForConnection(): Observable<boolean> {
    return this.connected$.pipe(
      filter(connected => connected),
      takeUntil(this.destroy$)
    )
  }
}

/**
 * Angular适配器类
 * 扩展基础适配器，提供Angular特定的功能
 */
export class AngularAdapter extends BaseAdapter {
  constructor(
    client: WebSocketClient,
    config: AngularWebSocketConfig = {},
    private ngZone: NgZone
  ) {
    super(client, config)
  }

  /**
   * 同步状态（Angular中通过服务的Subject处理）
   */
  protected syncState(): void {
    // Angular中的状态同步通过服务的Subject处理
    // 这里不需要额外的同步逻辑
  }

  /**
   * 在Angular Zone中执行函数
   * @param fn 要执行的函数
   */
  private runInZone(fn: () => void): void {
    if (this.ngZone) {
      this.ngZone.run(fn)
    } else {
      fn()
    }
  }
}

// 导出类型
export type { AngularWebSocketConfig }
