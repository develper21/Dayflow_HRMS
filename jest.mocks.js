import { jest } from '@jest/globals'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: '',
    asPath: '',
    route: '/',
  }),
}))

// Mock Next.js navigation (app router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }),
  usePathname: () => '/',
  redirect: jest.fn(),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ 
    data: { 
      user: { 
        name: 'Test User', 
        email: 'test@example.com',
        role: 'admin'
      } 
    }, 
    status: 'authenticated' 
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock NextAuth core
jest.mock('next-auth', () => ({
  NextAuth: jest.fn(() => jest.fn()),
}))
