import Skeleton from 'library/components/Skeleton'
import styles from './AccountCard.skeleton.module.scss'

const AccountCardSkeleton: React.FC = () => (
	<Skeleton className={styles.skeleton} />
)

export default AccountCardSkeleton