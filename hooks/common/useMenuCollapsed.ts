import { useEffect, useState } from 'react'

export const useMenuCollapsed = (): [boolean, (value: boolean) => void] => {
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMenuCollapsed(true)
      } else {
        setMenuCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return [menuCollapsed, setMenuCollapsed]
}
