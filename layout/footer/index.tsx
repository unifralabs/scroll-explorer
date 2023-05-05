import { FacebookFilled, MediumSquareFilled, RedditSquareFilled, TwitterSquareFilled } from '@ant-design/icons'
import Image from 'next/image'

import { BROWSER_TITLE } from '@/constants'
import { getImgSrc } from '@/utils'

import style from './index.module.scss'

const iconData = [
  { href: 'https://twitter.com/UnifraPlatform', icon: <TwitterSquareFilled /> },
  // { href: '', icon: <FacebookFilled /> },
  { href: 'https://discord.com/EPwDVewaSd', icon: <RedditSquareFilled /> },
  { href: 'https://medium.com/@unifra', icon: <MediumSquareFilled /> }
]

const Footer: React.FC = () => {
  return (
    <footer className={style.footerWrap}>
      <div className="text-white">
        <div className="w-full">
          <div className="flex items-center text-24px mb-20px">
            <Image height={40} src={getImgSrc('token')} alt="" />
            <div className="ml-20px">Powered by {BROWSER_TITLE}</div>
          </div>
          <div>{BROWSER_TITLE} is a Block Explorer and Analytics Platform for</div>
          <div>A decentralized smart contracts platform.</div>
        </div>
        <div className="w-full border-t-1px border-solid border-[#e7eaf3] pt-30px mt-50px flex justify-between items-center">
          <div>
            {BROWSER_TITLE} © {new Date().getFullYear()}
          </div>
          <div className={style.iconWrap}>
            {iconData.map(({ href, icon }, index) => (
              <a key={index} href={href} target="_blank" rel="noreferrer">
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
