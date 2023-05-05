import { ReactNode } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/router'

import { getImgSrc } from '@/utils'

type PageTitleProps = {
  title: ReactNode | string
  showBack?: boolean
}

const PageTitle: React.FC<PageTitleProps> = ({ title, showBack = false }) => {
  const router = useRouter()

  return (
    <div className="w-full flex items-center text-24px font-500 mb-24px">
      {showBack && (
        <Image
          className="mr-16px cursor-pointer transition-all duration-300 hover:opacity-70"
          height={18}
          src={getImgSrc('back')}
          alt=""
          onClick={() => router.back()}
        />
      )}
      <div>{title}</div>
    </div>
  )
}

export default PageTitle
