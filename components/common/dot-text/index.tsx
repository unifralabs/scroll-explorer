import { useEffect, useState } from 'react'

import classNames from 'classnames'

import style from './index.module.scss'

const DotText: React.FC<{ text: string; time?: number; className?: string }> = ({ text, time = 500, className = '' }) => {
  const [dot, setDot] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      text &&
        setDot(pre => {
          if (pre.length < 3) {
            return (pre += '.')
          }
          return ''
        })
    }, time)
    return () => {
      timer && clearInterval(timer)
    }
  }, [text, time])

  return (
    <div className={classNames(className, style.dotWrap)}>
      <div>{text}</div>
      <div>{dot}</div>
    </div>
  )
}

export default DotText
