import { ReactNode, useMemo } from 'react'

import { Card } from 'antd'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import PageTitle from '@/components/common/page-title'
import { ContractCompilerTypeEnum } from '@/pages/verifyContract'

const VerifyContractPage: React.FC<{ step?: number; children: ReactNode; footer: ReactNode }> = ({ step = 1, children, footer }) => {
  const { query } = useRouter()
  const { contractCompilerType } = query

  const verifyContractCardHeaderStepsData = useMemo(
    () => [
      { title: 'Verify & Publish Contract Source Code', subTitle: 'COMPILER TYPE AND VERSION SELECTION' },
      {
        title: 'Verify & Publish Contract Source Code',
        subTitle: undefined === contractCompilerType ? 'FILE UPLOAD' : ContractCompilerTypeEnum[contractCompilerType]
      }
    ],
    [contractCompilerType]
  )

  const verifyContractCardHeader = useMemo(
    () => (
      <div className="px-[4%] py-26px flex justify-center">
        {verifyContractCardHeaderStepsData.map(({ title, subTitle }, index) => (
          <div className="flex justify-center" key={index}>
            <div>
              <div className="flex items-center">
                <div
                  className={classNames(
                    'w-24px h-24px font-500 text-16px rounded-full flexCenter mr-10px',
                    index < step ? 'bg-main text-white' : 'border-1px border-solid border-[#999] text-[#999]'
                  )}>
                  {index + 1}
                </div>
                <div className={index < step ? 'text-main' : 'text-[#999]'}>{title}</div>
              </div>
              <div className="text-14 pl-36px text-[#999] font-400 mt-10px uppercase">{subTitle}</div>
            </div>
            {index < verifyContractCardHeaderStepsData.length - 1 && <div className={'w-150px h-1px mt-12px mx-[8%] bg-main'}></div>}
          </div>
        ))}
      </div>
    ),
    [step, verifyContractCardHeaderStepsData]
  )

  return (
    <>
      <PageTitle title="Verify Contract" />
      <Card className="w-full" title={verifyContractCardHeader} bodyStyle={{ paddingBottom: 0 }}>
        <div className="px-[4%] pb-40px">{children}</div>
        <div className="w-[calc(100%+48px)] flexCenter ml-[-24px] h-80px border-t-1px border-solid border-border flexCenter">{footer}</div>
      </Card>
    </>
  )
}

export default VerifyContractPage
