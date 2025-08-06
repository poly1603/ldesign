import { Action, BaseStore, Getter, State } from '@ldesign/store'

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

export class TodoStore extends BaseStore {
  @State({ default: [] })
  todos: Todo[] = []

  @State({ default: '' })
  filter: 'all' | 'active' | 'completed' = 'all'

  constructor(id: string = 'todo') {
    super(id)
  }

  @Action()
  addTodo(text: string) {
    if (text.trim()) {
      this.todos.push({
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
      })
    }
  }

  @Action()
  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  @Action()
  removeTodo(id: number) {
    const index = this.todos.findIndex(t => t.id === id)
    if (index > -1) {
      this.todos.splice(index, 1)
    }
  }

  @Action()
  setFilter(filter: 'all' | 'active' | 'completed') {
    this.filter = filter
  }

  @Action()
  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed)
  }

  @Getter()
  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
  }

  @Getter()
  get totalCount() {
    return this.todos.length
  }

  @Getter()
  get activeCount() {
    return this.todos.filter(todo => !todo.completed).length
  }

  @Getter()
  get completedCount() {
    return this.todos.filter(todo => todo.completed).length
  }

  @Getter()
  get hasCompleted() {
    return this.completedCount > 0
  }
}
