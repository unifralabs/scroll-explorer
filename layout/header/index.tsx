import { memo } from 'react'

import ArrowSvg from '@svgs/arrow.svg'
import { Select } from 'antd'

import SearchInput from '@/components/common/search-input'

const Header: React.FC = () => {
  return (
    <header className="w-full h-56px flex justify-between items-center shadow-transparent border-b-1px border-solid border-[#e7eaf3] px-24 py-6px bg-white">
      <SearchInput noBorder />
      <Select
        className="header-select-wrap"
        popupClassName="header-select-popup-wrap"
        defaultValue="Scroll Alpha Testnet"
        suffixIcon={<ArrowSvg />}
        options={[{ value: 'Scroll Alpha Testnet', label: 'Scroll Alpha Testnet' }]}
        bordered={false}
      />
    </header>
  )
}

export default memo(Header)
