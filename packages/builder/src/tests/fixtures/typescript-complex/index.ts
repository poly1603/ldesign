export interface User {
  id: number
  name: string
  email?: string
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
}

export function createUser(name: string, email?: string): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email: email || undefined
  }
}

export default UserManager
