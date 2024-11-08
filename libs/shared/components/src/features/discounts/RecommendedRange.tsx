import Loading from '../../ui-common/loading/Loading'
import styles from './RecommendedRange.module.scss'
import { TypoCaption } from '@element/react-typography'

export const RecommendedRange = (props: {
  recommendedRange: string | undefined
  uom: string | undefined
  recommendedRangeLabel: string
}) => {
  const { recommendedRange, recommendedRangeLabel, uom } = props
  const labelPrefix = `${recommendedRangeLabel}:`
  if (!recommendedRange && recommendedRange !== '') {
    return (
      <div className={styles.recommended_range}>
        <TypoCaption>{labelPrefix}</TypoCaption>
        &nbsp;
        <div className={styles.recommended_range_loading}>
          <Loading />
        </div>
      </div>
    )
  } else {
    return (
      <TypoCaption>
        {labelPrefix} {recommendedRange ? `${recommendedRange} /${uom}` : '--'}
      </TypoCaption>
    )
  }
}

export default RecommendedRange
