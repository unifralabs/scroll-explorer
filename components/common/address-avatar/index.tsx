import { CSSProperties, useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { renderIcon } from '@/utils/blockies'

const AddressAvatar: React.FC<{ style?: CSSProperties; className?: string; address: string | undefined; size?: number }> = ({
  style = {},
  className = '',
  address,
  size = 20
}) => {
  const [imgSrc, setImgSrc] = useState()
  const canvasRef = useRef(null)

  useEffect(() => {
    if (address) {
      const canvas: any = canvasRef.current
      renderIcon({ seed: address.toLowerCase() }, canvas)
      const updatedDataUrl = canvas?.toDataURL()

      if (updatedDataUrl !== imgSrc) {
        setImgSrc(updatedDataUrl)
      }
    }
  }, [imgSrc, address])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!!imgSrc && <Image style={style} className={className} src={imgSrc} width={size} height={size} alt="" />}
    </>
  )
}

export default AddressAvatar
