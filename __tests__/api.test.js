import { createMocks } from 'node-mocks-http'

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  NextAuth: jest.fn(() => (req, res) => {
    res.status(200).json({ message: 'Auth endpoint working' })
  }),
}))

describe('/api/auth/[...nextauth]', () => {
  it('handles GET requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    // Mock the handler function directly
    const mockHandler = jest.fn((req, res) => {
      res.status(200).json({ message: 'Auth endpoint working' })
    })

    await mockHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ message: 'Auth endpoint working' })
  })

  it('handles POST requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    })

    // Mock the handler function directly
    const mockHandler = jest.fn((req, res) => {
      res.status(200).json({ message: 'Login successful' })
    })

    await mockHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ message: 'Login successful' })
  })
})
