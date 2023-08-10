// eslint-disable-next-line max-len
import { Badge, Button, Card, Checkbox, ClickAwayListener, Divider, FormControlLabel, Grid, makeStyles, Popper, Slider, Typography, useMediaQuery } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Colorize } from '@material-ui/icons'
import { ChromePicker } from 'react-color'
import { useState } from 'react'
import Helmet from 'react-helmet'

import { defaultColors } from 'library/common/theme'
import storage from 'library/utilities/storage'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2)
	},
	card: {
		padding: theme.spacing(1),
		flexDirection: 'column',
		display: 'flex'
	},
	cardTitle: {
		alignSelf: 'center'
	},
	cardContent: {
		padding: theme.spacing(0, 2, 0, 2),
		flexDirection: 'column',
		display: 'flex'
	},
	cardContentRow: {
		padding: theme.spacing(0, 2, 0, 2),
		flexDirection: 'row',
		display: 'flex',
		justifyContent: 'space-between',
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column'
		}
	},
	contentHighlighted: {
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing(1, 1, 1, 2),
		borderRadius: 4
	},
	flex: {
		display: 'flex',
		flexDirection: 'column',
		width: '50%',
		[theme.breakpoints.down('xs')]: {
			width: '50%'
		}
	},
	saveButton: {
		width: '30%',
		alignSelf: 'flex-end',
		margin: theme.spacing(1, 0, 1, 0)
	}
}))

function ColorPickerCircle({ type, color, section, selected, settings, setSettings }) {
	const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null)
	return (<>
		<Badge onClick={(e) => setColorPickerAnchorEl(e.target)} badgeContent={ <Colorize /> }>
			<div style={{
				border: selected && 'solid 3px #fafafa',
				borderRadius: '50%',
				height: 32,
				width: 32,
				backgroundColor: color,
				cursor: 'pointer'
			}} />
		</Badge>
		<Popper style={{ zIndex: 99999999999 }} open={Boolean(colorPickerAnchorEl)} anchorEl={colorPickerAnchorEl}>
			<ClickAwayListener onClickAway={() => setColorPickerAnchorEl(null)}>
				<ChromePicker
					color={color}
					onChange={(color) => {
						setSettings({
							...settings,
							themes: {
								...settings.themes,
								[type]: {
									...settings.themes[type],
									[section]: color.hex
								}
							}
						})
					}}
				/>
			</ClickAwayListener>
		</Popper>
	</>)
}

function ThemeCircle({ type, section, color, colorName, selected, settings, setSettings }) {
	return (
		<div onClick={() => {
			setSettings({
				...settings,
				themes: {
					...settings.themes,
					[type]: {
						...settings.themes[type],
						[section]: colorName
					}
				}
			})
		}} style={{
			border: selected && 'solid 3px #fafafa',
			borderRadius: '50%',
			height: 32,
			width: 32,
			backgroundColor: color,
			marginRight: 10,
			cursor: 'pointer'
		}} />
	)
}

function PrimaryThemeSection({ type, settings, setSettings }) {
	const theme = type === 'dark' ? defaultColors.dark : defaultColors.light
	const classes = useStyles()

	return (
		<div className={classes.flex}>
			<Typography gutterBottom className={classes.cardTitle}>
				Primary
			</Typography>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<ThemeCircle
					type={type}
					color={theme.primary}
					colorName='PRIMARY'
					section='primary'
					selected={settings.themes[type].primary === 'PRIMARY'}
					settings={settings}
					setSettings={setSettings}
				/>
				<ThemeCircle
					type={type}
					color={theme.secondary}
					colorName='SECONDARY'
					section='primary'
					selected={settings.themes[type].primary === 'SECONDARY'}
					settings={settings}
					setSettings={setSettings}
				/>
				<ColorPickerCircle
					type={type}
					color={
						['PRIMARY', 'SECONDARY'].includes(settings.themes[type].primary)
							? '#000'
							: settings.themes[type].primary
					}
					section='primary'
					selected={!['PRIMARY', 'SECONDARY'].includes(settings.themes[type].primary)}
					settings={settings}
					setSettings={setSettings}
				/>
			</div>
		</div>
	)
}

function SecondaryThemeSection({ type, settings, setSettings }) {
	const theme = type === 'dark' ? defaultColors.dark : defaultColors.light
	const classes = useStyles()

	return (
		<div className={classes.flex}>
			<Typography gutterBottom className={classes.cardTitle}>
				Secondary
			</Typography>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<ThemeCircle
					type={type}
					color={theme.primary}
					colorName='PRIMARY'
					section='secondary'
					selected={settings.themes[type].secondary === 'PRIMARY'}
					settings={settings}
					setSettings={setSettings}
				/>
				<ThemeCircle
					type={type}
					color={theme.secondary}
					colorName='SECONDARY'
					section='secondary'
					selected={settings.themes[type].secondary === 'SECONDARY'}
					settings={settings}
					setSettings={setSettings}
				/>
				<ColorPickerCircle
					type={type}
					color={
						['PRIMARY', 'SECONDARY'].includes(settings.themes[type].secondary)
							? '#000'
							: settings.themes[type].secondary
					}
					section='secondary'
					selected={!['PRIMARY', 'SECONDARY'].includes(settings.themes[type].secondary)}
					settings={settings}
					setSettings={setSettings}
				/>
			</div>
		</div>
	)
}

function BackgroundThemeSection({ type, settings, setSettings }) {
	const theme = type === 'dark' ? defaultColors.dark : defaultColors.light
	const classes = useStyles()

	return (
		<div className={classes.flex}>
			<Typography gutterBottom className={classes.cardTitle}>
				Background
			</Typography>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<ThemeCircle
					type={type}
					color={theme.background}
					colorName='BACKGROUND'
					section='background'
					selected={settings.themes[type].background === 'BACKGROUND'}
					settings={settings}
					setSettings={setSettings}
				/>
				<ColorPickerCircle
					type={type}
					color={
						['BACKGROUND'].includes(settings.themes[type].background)
							? '#000'
							: settings.themes[type].background
					}
					section='background'
					selected={!['BACKGROUND'].includes(settings.themes[type].background)}
					settings={settings}
					setSettings={setSettings}
				/>
			</div>
		</div>
	)
}

function PaperThemeSection({ type, settings, setSettings }) {
	const theme = type === 'dark' ? defaultColors.dark : defaultColors.light
	const classes = useStyles()

	return (
		<div className={classes.flex}>
			<Typography gutterBottom className={classes.cardTitle}>
				Paper
			</Typography>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<ThemeCircle
					type={type}
					color={theme.paper}
					colorName='PAPER'
					section='paper'
					selected={settings.themes[type].paper === 'PAPER'}
					settings={settings}
					setSettings={setSettings}
				/>
				<ColorPickerCircle
					type={type}
					color={
						['PAPER'].includes(settings.themes[type].paper)
							? '#000'
							: settings.themes[type].paper
					}
					section='paper'
					selected={!['PAPER'].includes(settings.themes[type].paper)}
					settings={settings}
					setSettings={setSettings}
				/>
			</div>
		</div>
	)
}

function ThemeCard({ type, settings, setSettings }) {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const classes = useStyles()

	return (
		<div className={classes.contentHighlighted} style={{
			width: isMobile ? '100%' : '49%',
			display: 'flex',
			flexDirection: 'column',
			marginBottom: isMobile && type === 'dark' && 16
		}}>
			<Typography gutterBottom className={classes.cardTitle}>
				{type[0].toUpperCase() + type.slice(1)} Theme
			</Typography>
			<Divider style={{ marginBottom: 4 }} />
			<div style={{ display: 'flex', flexDirection: isMobile && 'column' }}>
				<div style={{ display: 'flex', width: !isMobile && '50%' }}>
					<PrimaryThemeSection
						type={type}
						settings={settings}
						setSettings={setSettings}
					/>
					<Divider orientation='vertical' style={{ marginLeft: 10, marginRight: 10 }} />
					<SecondaryThemeSection
						type={type}
						settings={settings}
						setSettings={setSettings}
					/>
				</div>
				<Divider orientation='vertical' style={{ marginLeft: 10, marginRight: 10 }} />
				<div style={{ display: 'flex', width: !isMobile && '50%' }}>
					<BackgroundThemeSection
						type={type}
						settings={settings}
						setSettings={setSettings}
					/>
					<Divider orientation='vertical' style={{ marginLeft: 10, marginRight: 10 }} />
					<PaperThemeSection
						type={type}
						settings={settings}
						setSettings={setSettings}
					/>
				</div>
			</div>
		</div>
	)
}

function Settings() {
	const [settings, setSettings] = useState(storage.getSettings())
	const [passwordError, setPasswordError] = useState(false)
	const theme = useSelector((state) => state.theme)
	const dispatch = useDispatch()
	const classes = useStyles()

	const saveSettings = () => {
		if (!settings.passwordGenerator.lowercase
			&& !settings.passwordGenerator.uppercase
			&& !settings.passwordGenerator.numbers
			&& !settings.passwordGenerator.symbols)
			return setPasswordError(true)
		storage.setItem('settings', settings)
		/* Set the Theme twice to re-render components with new settings */
		dispatch.theme.set(theme === 'dark' ? 'light' : 'dark')
		dispatch.theme.set(theme)
		dispatch.theme.sync()
		dispatch.passwords.sync()
		dispatch.notifications.add('Saved Settings')
	}

	return (<>
		<Helmet>
			<title>Settings - Aspire</title>
		</Helmet>
		<div className={classes.root}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
					<Card className={classes.card}>
						<Typography className={classes.cardTitle}>Theme Settings</Typography>
						<div className={classes.cardContentRow}>
							<ThemeCard
								type='dark'
								settings={settings}
								setSettings={setSettings}
							/>
							<ThemeCard
								type='light'
								settings={settings}
								setSettings={setSettings}
							/>
						</div>
						<Button
							className={classes.saveButton}
							onClick={saveSettings}
							color='primary'
							variant='contained'
						>
							Save
						</Button>
					</Card>
				</Grid>
				<Grid item xs={12} sm={12}>
					<Card className={classes.card}>
						<Typography className={classes.cardTitle}>Password Generator Settings</Typography>
						<div className={classes.cardContent}>
							<Typography gutterBottom>
								Length
							</Typography>
							<Slider
								defaultValue={settings.passwordGenerator.length}
								key={`slider-${settings.passwordGenerator.length}`}
								valueLabelDisplay='auto'
								min={7}
								max={256}
								onChangeCommitted={(e, x) => {
									setSettings({
										...settings,
										passwordGenerator: {
											...settings.passwordGenerator,
											length: x
										}
									})
									setPasswordError(false)
								}}
							/>
							<div className={classes.contentHighlighted}>
								<Typography gutterBottom>
									Characters
								</Typography>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.passwordGenerator.lowercase}
											color='primary'
											onChange={(e, x) => {
												setSettings({
													...settings,
													passwordGenerator: {
														...settings.passwordGenerator,
														lowercase: x
													}
												})
												setPasswordError(false)
											}}
										/>
									}
									label='Lowercase'
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.passwordGenerator.uppercase}
											color='primary'
											onChange={(e, x) => {
												setSettings({
													...settings,
													passwordGenerator: {
														...settings.passwordGenerator,
														uppercase: x
													}
												})
												setPasswordError(false)
											}}
										/>
									}
									label='Uppercase'
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.passwordGenerator.numbers}
											color='primary'
											onChange={(e, x) => {
												setSettings({
													...settings,
													passwordGenerator: {
														...settings.passwordGenerator,
														numbers: x
													}
												})
												setPasswordError(false)
											}}
										/>
									}
									label='Numbers'
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.passwordGenerator.symbols}
											color='primary'
											onChange={(e, x) => {
												setSettings({
													...settings,
													passwordGenerator: {
														...settings.passwordGenerator,
														symbols: x
													}
												})
												setPasswordError(false)
											}}
										/>
									}
									label='Symbols'
								/>
								{
									passwordError
									&& <Typography style={{ color: 'tomato' }} variant='subtitle2'>You need to select at least one</Typography>
								}
							</div>
							<Button
								className={classes.saveButton}
								onClick={saveSettings}
								color='primary'
								variant='contained'
							>
								Save
							</Button>
						</div>
					</Card>
				</Grid>
			</Grid>
		</div>
	</>)
}

export default Settings