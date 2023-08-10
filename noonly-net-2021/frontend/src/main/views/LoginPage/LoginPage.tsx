import Card from 'library/components/Card'
import Link from 'library/components/Link'
import LoginForm from './LoginForm'
import Logo from 'library/components/Logo'
import styles from './LoginPage.module.scss'

const LoginPage: React.FC = () => (<>
	<div className={styles.root}>
		<div className={styles['root-inner']}>
			<Logo mx='auto' h='8' mb={{ base: '10', md: '10' }} />
			<div className={styles.heading}>
				Sign in to your account
			</div>
			<div className={styles.text}>
				<span>Don&apos;t have an account?</span>
				<Link to='/register'>Start free trial</Link>
			</div>
			<Card>
				<LoginForm />
			</Card>
		</div>
	</div>
</>)

export default LoginPage