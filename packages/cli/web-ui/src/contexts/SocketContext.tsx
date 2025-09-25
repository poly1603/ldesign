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
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setConnected(true)
      toast.success('已连接到服务器')
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
      toast.error('与服务器断开连接')
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
      toast.error('连接服务器失败')
    })

    // 监听配置变化
    socketInstance.on('config:changed', (data) => {
      toast(`配置文件已更改: ${data.path}`)
    })

    // 监听文件变化
    socketInstance.on('file:changed', (data) => {
      console.log('File changed:', data.path)
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
