import { create } from 'zustand'
import type { Todo, TodoStatus } from '@/types'

interface TodoStore {
  todos: Todo[]
  isLoading: boolean
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, patch: Partial<Todo>) => void
  removeTodo: (id: string) => void
  setStatus: (id: string, status: TodoStatus) => void
  toggleImportant: (id: string) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  isLoading: false,

  setTodos: (todos) => set({ todos }),

  addTodo: (todo) =>
    set((state) => ({ todos: [todo, ...state.todos] })),

  updateTodo: (id, patch) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

  setStatus: (id, status) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  toggleImportant: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, important: !t.important } : t,
      ),
    })),
}))
