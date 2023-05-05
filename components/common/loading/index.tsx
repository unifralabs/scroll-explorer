import style from './index.module.scss'

const Loading: React.FC = () => {
  return (
    <div className={style.loadingWrap}>
      <div className={style.loading}>
        {new Array(5).fill('').map((_, index) => (
          <span key={index}></span>
        ))}
      </div>
    </div>
  )
}

export default Loading
