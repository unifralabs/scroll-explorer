import type { AppType } from 'next/app'

import '@/styles/global.css'

import { trpc } from '../utils/trpc'

import 'antd/dist/reset.css'
import 'windi.css'

const App: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

export default trpc.withTRPC(App)
