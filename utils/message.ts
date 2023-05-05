import { message } from 'antd'

interface MessageInterface {
  success: (params: any) => void
  error: (params: any) => void
  warn: (params: any) => void
}

class Message implements MessageInterface {
  private invokeAntdMessage(method, params): void {
    message.destroy()
    message[method](params)
  }

  success(...params: any): void {
    this.invokeAntdMessage('success', params)
  }

  error(...params: any): void {
    this.invokeAntdMessage('error', params)
  }

  warn(...params: any): void {
    this.invokeAntdMessage('warn', params)
  }
}

export default new Message()
