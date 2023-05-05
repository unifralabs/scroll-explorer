import { useEffect, useState } from 'react'

import { LoadingOutlined } from '@ant-design/icons'
import { isHexString } from '@ethersproject/bytes'
import SearchSvg from '@svgs/search.svg'
import { Input, Modal } from 'antd'
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { LinkTypeEnum } from '@/types'
import { getImgSrc } from '@/utils'
import { trpc } from '@/utils/trpc'

import { getLinkRoute } from '../link'

const SearchInput: React.FC<{ width?: number; noBorder?: boolean }> = ({ width = 550, noBorder = false }) => {
  const router = useRouter()
  const [content, setContent] = useState<string>('')
  const { isFetching, data } = trpc.util.search.useQuery(content, { enabled: !!content })
  const [showErrorModal, setShowErrorModal] = useState(false)
  useEffect(() => {
    if (!data) return

    if (!!data?.result || isHexString(content, 20)) {
      router.push(getLinkRoute((data?.result as LinkTypeEnum) || LinkTypeEnum.ADDRESS, content))
    } else {
      setShowErrorModal(true)
    }
  }, [data, content, router])

  return (
    <>
      <Input
        style={{ width: `${width}px` }}
        prefix={<SearchSvg className="mr-4px" />}
        suffix={isFetching && <LoadingOutlined className="text-main" />}
        className={classNames('px-16px py-10px', noBorder && 'border-none shadow-none')}
        placeholder="Search by Address / Txn Hash / Block / Token"
        onPressEnter={(e: any) => setContent(e.target.value)}
        allowClear
      />

      <Modal wrapClassName="modal-with-no-footer-border" open={showErrorModal} width={500} footer={null} onCancel={() => setShowErrorModal(false)} centered>
        <div className="flexCenter flex-col py-30px">
          <Image className="mb-36px" width={94} src={getImgSrc('contract/verify_failed')} alt="" />
          <div className="font-500 mb-4px">Search not found</div>
          <div className="font-400">Oops! This is an invalid search string.</div>
        </div>
      </Modal>
    </>
  )
}

export default SearchInput
