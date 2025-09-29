import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  isConnected: false
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // 连接到后端 Socket.IO 服务器（使用当前页面的主机和端口）
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setConnected(true)
      toast.success('已连接到服务器')
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)
      if (reason === 'io server disconnect') {
        // 服务器主动断开连接，需要手动重连
        socketInstance.connect()
      }
      toast.error('与服务器断开连接')
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
      toast.error('连接服务器失败')
    })

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setConnected(true)
      toast.success('已重新连接到服务器')
    })

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber)
    })

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
    })

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket reconnection failed')
      toast.error('重连失败，请刷新页面')
    })

    // 监听配置变化
    socketInstance.on('config:changed', (data) => {
      toast(`配置文件已更改: ${data.path}`)
    })

    // 监听文件变化
    socketInstance.on('file:changed', (data) => {
      console.log('File changed:', data.path)
    })

    // 监听清理所有数据事件
    socketInstance.on('clear-all-data', () => {
      console.log('收到清理所有数据事件')
      toast('正在清理历史数据...', { icon: 'ℹ️' })
      // 发送自定义事件给应用程序处理
      window.dispatchEvent(new CustomEvent('clear-all-data'))
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected, isConnected: connected }}>
      {children}
    </SocketContext.Provider>
  )
}
