/**
 * 简单的 TypeScript 测试文件
 */

export interface User {
  id: number
  name: string
  email: string
}

export class UserManager {
  private users: User[] = []

  addUser(user: User): void {
    this.users.push(user)
  }

  getUser(id: number): User | undefined {
    return this.users.find(user => user.id === id)
  }

  getAllUsers(): User[] {
    return [...this.users]
  }

  removeUser(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
      return true
    }
    return false
  }
}

export function createUser(id: number, name: string, email: string): User {
  return { id, name, email }
}

export const DEFAULT_USER: User = {
  id: 0,
  name: 'Anonymous',
  email: 'anonymous@example.com'
}

// 默认导出
export default UserManager
