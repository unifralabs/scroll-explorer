import { ReactNode } from 'react'
import Scrollbars from 'react-custom-scrollbars'

import { configureChains } from '@wagmi/core'
import { scrollTestnet } from '@wagmi/core/chains'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { publicProvider } from '@wagmi/core/providers/public'
import { ConfigProvider } from 'antd'
import Head from 'next/head'
import { WagmiConfig, createClient } from 'wagmi'

import { BROWSER_TITLE, CONTENT_MIN_WIDTH } from '@/constants'
import ANTD_THEME_CONFIG from '@/constants/antd-theme-tokens'
import Header from '@/layout/header'
import Menu from '@/layout/menu'

const { chains, provider } = configureChains([scrollTestnet], [publicProvider()])

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider
})

const Container: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiConfig client={client}>
      <ConfigProvider prefixCls="unifrascan" theme={ANTD_THEME_CONFIG}>
        <Head>
          <link rel="icon" href="/imgs/logo.png" />
          <title>{BROWSER_TITLE}</title>
        </Head>
        <section className="flex">
          <Menu />
          <section className="flex-1">
            <Header />
            <main className="w-full h-[calc(100vh-56px)] bg-page">
              <Scrollbars universal={true} autoHide>
                <section style={{ minWidth: `${CONTENT_MIN_WIDTH}px` }} className="p-24">
                  {children}
                </section>
              </Scrollbars>
            </main>
          </section>
        </section>
      </ConfigProvider>
    </WagmiConfig>
  )
}

export default Container
