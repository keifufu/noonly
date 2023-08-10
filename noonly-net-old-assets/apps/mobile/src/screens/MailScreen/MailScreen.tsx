import { Button, Text } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'

import MailRow from 'components/MailRow'
import React from 'react'
import { SCREEN_WIDTH } from 'utils/constants'
import StyledRefreshControl from 'components/StyledRefreshControl'
import { Swipeable } from 'react-native-gesture-handler'
import { View } from 'react-native'
import faker from 'faker'
import { useTheme } from 'providers/ThemeProvider'

function randomDate(start: any, end: any): any {
	return new Date(start.getTime() + (Math.random() * (end.getTime() - start.getTime())))
}

const getFakeMail = () => {
	const FakeMail = Array.from(Array(500), () => ({
		subject: faker.random.words(10),
		from: faker.random.word(),
		previewText: faker.random.words(25),
		id: faker.random.alphaNumeric(24),
		read: faker.datatype.boolean(),
		date: randomDate(new Date(2021, 12, 1), new Date())
	})).sort((a, b) => b.date - a.date)
	return FakeMail
}

const MailScreen: React.FC = () => {
	const theme = useTheme()
	const [isRefreshing, setIsRefreshing] = React.useState(false)
	const [dataProvider, setDataProvider] = React.useState(new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows(getFakeMail()))
	const [layoutProvider] = React.useState(new LayoutProvider(() => 0, (type, dim) => {
		dim.width = SCREEN_WIDTH
		dim.height = 100
	}))

	const onRefresh = () => {
		setIsRefreshing(true)
		setTimeout(() => {
			setDataProvider(dataProvider.cloneWithRows(getFakeMail()))
			setIsRefreshing(false)
		}, 1000)
	}

	const renderLeftSwipe = () => (
		<View style={{ width: SCREEN_WIDTH, height: 100 }}>
			<Button>
				Archive
			</Button>
		</View>
	)

	const renderRightSwipe = () => (
		<View style={{ width: SCREEN_WIDTH, height: 100 }}>
			<Button>
				Delete
			</Button>
		</View>
	)

	return (<>
		<Text
			style={{ color: theme.isDark ? theme.colors['whiteAlpha-800'] : theme.colors['blackAlpha-800'], margin: 10, marginLeft: 15, marginBottom: 5 }}
		>
			Inbox
		</Text>
		<RecyclerListView
			style={{ backgroundColor: theme.colors['gray-800'] }}
			rowRenderer={(type, data) => (
				<Swipeable
					renderLeftActions={renderLeftSwipe}
					renderRightActions={renderRightSwipe}
					friction={2}
					leftThreshold={40}
					rightThreshold={40}
				>
					<MailRow mail={data} />
				</Swipeable>
			)}
			dataProvider={dataProvider}
			layoutProvider={layoutProvider}
			// onScroll={checkRefetch}
			// renderFooter={renderFooter}
			scrollViewProps={{
				refreshControl: (
					<StyledRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
				)
			}}
		/>
		{/* <SwipeListView
			data={FakeMail}
			refreshControl={<StyledRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
			keyExtractor={(product) => product.id}
			renderItem={({ item }) => (
				<MailRow mail={item} />
			)}
			renderHiddenItem={() => (
				<HiddenMailItem />
			)}
			initialNumToRender={10}
			friction={100}
			swipeToOpenVelocityContribution={10}
			tension={250}
			leftOpenValue={Dimensions.get('window').width}
			rightOpenValue={-Dimensions.get('window').width}
			directionalDistanceChangeThreshold={10}
		/> */}
	</>)
}

export default MailScreen