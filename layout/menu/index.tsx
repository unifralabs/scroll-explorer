import { memo, useCallback, useState } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'

import ArrowSvg from '@svgs/arrow.svg'
import LogoText from '@svgs/logo_text.svg'
import ToggleMenuSvg from '@svgs/toggle_menu.svg'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useMenuCollapsed } from '@/hooks/common/useMenuCollapsed'
import { ROUTES_MENUS } from '@/layout/menu/config'

import style from './index.module.scss'

const Menu: React.FC = () => {
  const router = useRouter()
  const [menuCollapsed, setMenuCollapsed] = useMenuCollapsed()

  const [menuToggleData, setMenuToggleData] = useState(ROUTES_MENUS.map(() => true))

  const onMenuClick = useCallback(
    (route: string | undefined, index?: number) => {
      if (!!route) {
        router.push(route)
      } else if (undefined !== index) {
        menuCollapsed && setMenuCollapsed(false) // Use setMenuCollapsed here
        setMenuToggleData(pre => {
          const data = [...pre]
          data[index] = menuCollapsed ? true : !pre[index]
          return data
        })
      }
    },
    [router, menuCollapsed, setMenuCollapsed]
  )

  return (
    <section className={classNames(style.menuWrap, menuCollapsed && style.collapsedMenuWrap)}>
      <Link href="https://unifra.io" className="w-full h-100px absolute top-0 left-0 flex items-center">
        <LogoText className={menuCollapsed ? 'mx-auto' : 'ml-38px'} width={menuCollapsed ? 30 : 120} height={30} alt="" />
      </Link>
      <Scrollbars universal={true} autoHide>
        <div className={style.menu}>
          {ROUTES_MENUS.map(({ label, icon, route, children }, index) => (
            <div key={route || label}>
              {!!index && <div className="w-full h-1px bg-[#564b50] my-24"></div>}
              <div
                className={classNames(
                  style.menuItem,
                  router?.pathname === route && style.activeItem,
                  children?.some(({ route: data }) => router?.pathname === data) && `${style.activeItem} !bg-[#32242B]`
                )}
                onClick={() => onMenuClick(route || undefined, index)}>
                <div className="flex-1 flex items-center">
                  <div className="w-20px flex items-center text-14px font-bold">{icon}</div>
                  {!menuCollapsed && <div className="ml-8px flex-1 min-w-0 ellipsis">{label}</div>}
                </div>
                {!menuCollapsed && !!children && <ArrowSvg className={classNames(style.arrow, !!!menuToggleData[index] && style.closed)} />}
              </div>
              {!menuCollapsed &&
                !!menuToggleData[index] &&
                children?.map(({ label: childLabel, route: childRoute }) => (
                  <div
                    className={classNames(style.menuItem, style.clickableMenuItem, router?.pathname === childRoute && style.activeItem, '!pl-40px my-6px')}
                    key={childRoute}
                    onClick={() => onMenuClick(childRoute)}>
                    {childLabel}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </Scrollbars>
      <div className={style.collapsedIconWrap}>
        <ToggleMenuSvg className={classNames(style.toggleIcon, menuCollapsed && style.menuCollapsed)} onClick={() => setMenuCollapsed(!menuCollapsed)} />
      </div>
    </section>
  )
}

export default memo(Menu)
