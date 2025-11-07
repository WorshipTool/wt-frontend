'use client'
import { BasicVariantPack } from '@/api/dtos'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import Popup from '@/common/components/Popup/Popup'
import SongSelectPopup from '@/common/components/SongSelectPopup/SongSelectPopup'
import {
	Box,
	Button,
	Card,
	Checkbox,
	Chip,
	Divider,
	IconButton,
	LinearProgress,
	Typography,
} from '@/common/ui'
import { SongVariantCard } from '@/common/ui/SongCard'
import useFamilyMatcherTrain from '@/hooks/bridge/useFamilyMatcherTrain'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import ErrorIcon from '@mui/icons-material/Error'
import PendingIcon from '@mui/icons-material/Pending'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import UploadIcon from '@mui/icons-material/Upload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useSnackbar } from 'notistack'
import { useRef, useState } from 'react'

export default SmartPage(Page, [
	'fullWidth',
	'hideFooter',
	'hideMiddleNavigation',
	'darkToolbar',
])

interface TrainingPair {
	id: string
	song1: BasicVariantPack
	song2: BasicVariantPack
	isFamily: boolean
	status: 'pending' | 'training' | 'success' | 'error'
	error?: string
}

function Page() {
	const { enqueueSnackbar } = useSnackbar()
	const { trainFamilyMatcher } = useFamilyMatcherTrain()

	// Form state for adding new pairs
	const [song1, setSong1] = useState<BasicVariantPack | null>(null)
	const [song2, setSong2] = useState<BasicVariantPack | null>(null)
	const [isFamily, setIsFamily] = useState(true)

	// Training pairs list
	const [trainingPairs, setTrainingPairs] = useState<TrainingPair[]>([])

	// Training progress
	const [isTraining, setIsTraining] = useState(false)
	const [currentTrainingIndex, setCurrentTrainingIndex] = useState<number>(-1)

	// Song preview popup
	const [previewSong, setPreviewSong] = useState<BasicVariantPack | null>(null)

	const [openPopup1, setOpenPopup1] = useState(false)
	const [openPopup2, setOpenPopup2] = useState(false)

	const anchorRef1 = useRef<HTMLButtonElement>(null)
	const anchorRef2 = useRef<HTMLButtonElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Add pair to the list
	const handleAddPair = () => {
		if (!song1 || !song2) {
			enqueueSnackbar('Prosím vyberte obě písně', { variant: 'error' })
			return
		}

		const newPair: TrainingPair = {
			id: `${Date.now()}-${Math.random()}`,
			song1,
			song2,
			isFamily,
			status: 'pending',
		}

		setTrainingPairs((prev) => [...prev, newPair])
		enqueueSnackbar('Pár písní přidán do seznamu', { variant: 'success' })

		// Reset form
		setSong1(null)
		setSong2(null)
		setIsFamily(true)
	}

	// Remove pair from the list
	const handleRemovePair = (id: string) => {
		setTrainingPairs((prev) => prev.filter((pair) => pair.id !== id))
	}

	// Export pairs to JSON file
	const handleExportPairs = () => {
		if (trainingPairs.length === 0) {
			enqueueSnackbar('Seznam je prázdný', { variant: 'warning' })
			return
		}

		const exportData = trainingPairs.map((pair) => ({
			song1: pair.song1, // Export complete song1 object
			song2: pair.song2, // Export complete song2 object
			isFamily: pair.isFamily,
		}))

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `ml-training-pairs-${
			new Date().toISOString().split('T')[0]
		}.json`
		link.click()
		URL.revokeObjectURL(url)

		enqueueSnackbar('Seznam exportován', { variant: 'success' })
	}

	// Import pairs from JSON file
	const handleImportPairs = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string
				const importedData = JSON.parse(content)

				if (!Array.isArray(importedData)) {
					throw new Error('Neplatný formát souboru')
				}

				const newPairs: TrainingPair[] = importedData.map((item: any) => {
					// Reconstruct BasicVariantPack objects with proper types
					const song1 = {
						...item.song1,
						createdAt: new Date(item.song1.createdAt),
						updatedAt: new Date(item.song1.updatedAt),
						publishedAt: item.song1.publishedAt
							? new Date(item.song1.publishedAt)
							: null,
					} as BasicVariantPack

					const song2 = {
						...item.song2,
						createdAt: new Date(item.song2.createdAt),
						updatedAt: new Date(item.song2.updatedAt),
						publishedAt: item.song2.publishedAt
							? new Date(item.song2.publishedAt)
							: null,
					} as BasicVariantPack

					return {
						id: `${Date.now()}-${Math.random()}`,
						song1,
						song2,
						isFamily: item.isFamily,
						status: 'pending' as const,
					}
				})

				setTrainingPairs((prev) => [...prev, ...newPairs])
				enqueueSnackbar(`Importováno ${newPairs.length} párů`, {
					variant: 'success',
				})
			} catch (error) {
				console.error('Import error:', error)
				enqueueSnackbar('Chyba při importu souboru', { variant: 'error' })
			}
		}
		reader.readAsText(file)

		// Reset input
		event.target.value = ''
	}

	// Train all pairs sequentially
	const handleTrainAll = async () => {
		if (trainingPairs.length === 0) {
			enqueueSnackbar('Seznam je prázdný', { variant: 'warning' })
			return
		}

		setIsTraining(true)
		let successCount = 0
		let errorCount = 0

		// Reset all statuses
		setTrainingPairs((prev) =>
			prev.map((pair) => ({
				...pair,
				status: 'pending' as const,
				error: undefined,
			}))
		)

		// Phase 1: Add all pairs to dataset without training
		for (let i = 0; i < trainingPairs.length; i++) {
			setCurrentTrainingIndex(i)
			const pair = trainingPairs[i]

			// Update status to training
			setTrainingPairs((prev) =>
				prev.map((p, idx) =>
					idx === i ? { ...p, status: 'training' as const } : p
				)
			)

			try {
				await trainFamilyMatcher({
					packGuid1: pair.song1.packGuid,
					packGuid2: pair.song2.packGuid,
					label: pair.isFamily ? 1 : 0,
					skipTraining: true, // Only add to dataset, don't train yet
				})

				// Update status to success
				setTrainingPairs((prev) =>
					prev.map((p, idx) =>
						idx === i ? { ...p, status: 'success' as const } : p
					)
				)
				successCount++
			} catch (error) {
				console.error(`Training error for pair ${i}:`, error)
				const errorMessage =
					error instanceof Error ? error.message : 'Neznámá chyba'

				// Update status to error
				setTrainingPairs((prev) =>
					prev.map((p, idx) =>
						idx === i
							? { ...p, status: 'error' as const, error: errorMessage }
							: p
					)
				)
				errorCount++
			}
		}

		// Phase 2: Trigger actual training after all data is added
		if (successCount > 0) {
			try {
				enqueueSnackbar('Spouštím trénink modelu...', { variant: 'info' })

				// Call with skip_training=false to trigger training
				// Use the first successful pair's data, but what matters is skip_training=false
				const firstPair = trainingPairs[0]
				await trainFamilyMatcher({
					packGuid1: firstPair.song1.packGuid,
					packGuid2: firstPair.song2.packGuid,
					label: firstPair.isFamily ? 1 : 0,
					skipTraining: false, // Trigger actual training
				})

				enqueueSnackbar('Model úspěšně natrénován!', { variant: 'success' })
			} catch (error) {
				console.error('Final training error:', error)
				enqueueSnackbar('Chyba při finálním tréninku modelu', {
					variant: 'error',
				})
			}
		}

		setIsTraining(false)
		setCurrentTrainingIndex(-1)

		enqueueSnackbar(
			`Trénink dokončen: ${successCount} úspěšných, ${errorCount} chyb`,
			{ variant: successCount > 0 ? 'success' : 'error' }
		)
	}

	const getStatusIcon = (status: TrainingPair['status']) => {
		switch (status) {
			case 'pending':
				return <PendingIcon color="disabled" />
			case 'training':
				return <PendingIcon color="primary" />
			case 'success':
				return <CheckCircleIcon color="success" />
			case 'error':
				return <ErrorIcon color="error" />
		}
	}

	const getStatusColor = (status: TrainingPair['status']) => {
		switch (status) {
			case 'pending':
				return 'default'
			case 'training':
				return 'primary'
			case 'success':
				return 'success'
			case 'error':
				return 'error'
		}
	}

	const pendingCount = trainingPairs.filter(
		(p) => p.status === 'pending'
	).length
	const successCount = trainingPairs.filter(
		(p) => p.status === 'success'
	).length
	const errorCount = trainingPairs.filter((p) => p.status === 'error').length

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				maxWidth: 1400,
				position: 'relative',
			}}
		>
			<Typography variant="h4">Trénink ML modelu - Family Matcher</Typography>

			{/* Section 1: Create pairs */}
			<Card sx={{ p: 3 }}>
				<Typography variant="h5" sx={{ mb: 1 }}>
					1. Vytvoření párů písní
				</Typography>
				<Typography
					sx={{ mb: 3, fontSize: '0.875rem', color: 'text.secondary' }}
				>
					Vyberte dvě písně a označte, zda patří do stejné rodiny
				</Typography>

				<Divider sx={{ my: 2 }} />

				{/* Dvě písně vedle sebe */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: 3,
						mb: 3,
					}}
				>
					{/* Levá píseň */}
					<Box
						sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
					>
						<Typography variant="h6">Píseň 1</Typography>
						<Button
							ref={anchorRef1}
							variant="outlined"
							onClick={() => setOpenPopup1(true)}
							disabled={isTraining}
							sx={{
								minHeight: 100,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								textAlign: 'center',
								p: 2,
							}}
						>
							{song1 ? (
								<>
									<Typography sx={{ fontWeight: 'bold' }}>
										{song1.title}
									</Typography>
									<Typography
										sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
									>
										Klikněte pro změnu
									</Typography>
								</>
							) : (
								<Typography>Klikněte pro výběr písně</Typography>
							)}
						</Button>
					</Box>

					{/* Pravá píseň */}
					<Box
						sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
					>
						<Typography variant="h6">Píseň 2</Typography>
						<Button
							ref={anchorRef2}
							variant="outlined"
							onClick={() => setOpenPopup2(true)}
							disabled={isTraining}
							sx={{
								minHeight: 100,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								textAlign: 'center',
								p: 2,
							}}
						>
							{song2 ? (
								<>
									<Typography sx={{ fontWeight: 'bold' }}>
										{song2.title}
									</Typography>
									<Typography
										sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
									>
										Klikněte pro změnu
									</Typography>
								</>
							) : (
								<Typography>Klikněte pro výběr písně</Typography>
							)}
						</Button>
					</Box>
				</Box>

				{/* Checkbox a tlačítko */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Checkbox
						checked={isFamily}
						onChange={(e) => setIsFamily(e.target.checked)}
						disabled={isTraining}
						label="Jsou tyto písně ve stejné rodině? (překlady/verze)"
					/>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<Button
							variant="contained"
							onClick={handleAddPair}
							disabled={!song1 || !song2 || isTraining}
							startIcon={<AddIcon />}
						>
							Přidat do seznamu
						</Button>
					</Box>
				</Box>
			</Card>

			{/* Section 2: Manage pairs list */}
			<Card sx={{ p: 3 }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 2,
					}}
				>
					<Box>
						<Typography variant="h5">
							2. Seznam párů ({trainingPairs.length})
						</Typography>
						{trainingPairs.length > 0 && (
							<Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
								<Chip
									label={`Čeká: ${pendingCount}`}
									size="small"
									color="default"
								/>
								<Chip
									label={`Úspěšné: ${successCount}`}
									size="small"
									color="success"
								/>
								{errorCount > 0 && (
									<Chip
										label={`Chyby: ${errorCount}`}
										size="small"
										color="error"
									/>
								)}
							</Box>
						)}
					</Box>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							style={{ display: 'none' }}
							onChange={handleImportPairs}
						/>
						<Button
							variant="outlined"
							startIcon={<UploadIcon />}
							onClick={() => fileInputRef.current?.click()}
							disabled={isTraining}
						>
							Importovat
						</Button>
						<Button
							variant="outlined"
							startIcon={<DownloadIcon />}
							onClick={handleExportPairs}
							disabled={trainingPairs.length === 0 || isTraining}
						>
							Exportovat
						</Button>
					</Box>
				</Box>

				{trainingPairs.length === 0 ? (
					<Box
						sx={{
							p: 3,
							bgcolor: '#e3f2fd',
							borderRadius: 1,
							border: '1px solid #2196f3',
						}}
					>
						<Typography sx={{ color: '#1976d2' }}>
							ℹ️ Seznam je prázdný. Přidejte páry písní pomocí formuláře výše.
						</Typography>
					</Box>
				) : (
					<Box
						sx={{
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: 1,
							overflow: 'hidden',
						}}
					>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: '60px 2fr 2fr 120px 140px',
								bgcolor: 'grey.100',
								fontWeight: 'bold',
								p: 2,
								borderBottom: '1px solid',
								borderColor: 'divider',
								gap: 1,
							}}
						>
							<Box>Stav</Box>
							<Box>Píseň 1</Box>
							<Box>Píseň 2</Box>
							<Box>Rodina</Box>
							<Box>Akce</Box>
						</Box>
						{trainingPairs.map((pair, index) => (
							<Box
								key={pair.id}
								sx={{
									display: 'grid',
									gridTemplateColumns: '60px 2fr 2fr 120px 140px',
									p: 2,
									borderBottom: '1px solid',
									borderColor: 'divider',
									bgcolor:
										currentTrainingIndex === index
											? 'action.selected'
											: undefined,
									alignItems: 'center',
									gap: 1,
									'&:last-child': {
										borderBottom: 'none',
									},
								}}
							>
								<Box>{getStatusIcon(pair.status)}</Box>
								<Box
									sx={{
										fontSize: '0.875rem',
										display: 'flex',
										alignItems: 'center',
										gap: 1,
									}}
								>
									<Typography
										sx={{
											flex: 1,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{pair.song1.title}
									</Typography>
									<IconButton
										size="small"
										onClick={() => setPreviewSong(pair.song1)}
										disabled={isTraining}
										sx={{ color: 'primary.main' }}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</Box>
								<Box
									sx={{
										fontSize: '0.875rem',
										display: 'flex',
										alignItems: 'center',
										gap: 1,
									}}
								>
									<Typography
										sx={{
											flex: 1,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{pair.song2.title}
									</Typography>
									<IconButton
										size="small"
										onClick={() => setPreviewSong(pair.song2)}
										disabled={isTraining}
										sx={{ color: 'primary.main' }}
									>
										<VisibilityIcon fontSize="small" />
									</IconButton>
								</Box>
								<Box>
									<Chip
										label={pair.isFamily ? 'ANO' : 'NE'}
										size="small"
										color={pair.isFamily ? 'success' : 'default'}
									/>
								</Box>
								<Box sx={{ display: 'flex', gap: 0.5 }}>
									<IconButton
										size="small"
										onClick={() => handleRemovePair(pair.id)}
										disabled={isTraining}
										color="error"
									>
										<DeleteIcon />
									</IconButton>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Card>

			{/* Section 3: Training */}
			<Card sx={{ p: 3 }}>
				<Typography variant="h5" sx={{ mb: 2 }}>
					3. Spuštění trénování
				</Typography>

				{isTraining && (
					<Box sx={{ mb: 3 }}>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								mb: 1,
							}}
						>
							<Typography sx={{ fontSize: '0.875rem' }}>
								Probíhá trénink: {currentTrainingIndex + 1} /{' '}
								{trainingPairs.length}
							</Typography>
							<Typography sx={{ fontSize: '0.875rem' }}>
								{Math.round(
									((currentTrainingIndex + 1) / trainingPairs.length) * 100
								)}
								%
							</Typography>
						</Box>
						<LinearProgress
							variant="determinate"
							value={((currentTrainingIndex + 1) / trainingPairs.length) * 100}
						/>
					</Box>
				)}

				<Button
					variant="contained"
					color="primary"
					size="large"
					startIcon={<PlayArrowIcon />}
					onClick={handleTrainAll}
					disabled={trainingPairs.length === 0 || isTraining}
					sx={{ minWidth: 200 }}
				>
					{isTraining ? 'Probíhá trénink...' : 'Spustit trénink'}
				</Button>

				{trainingPairs.length > 0 && !isTraining && (
					<Typography
						sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}
					>
						Bude zpracováno {trainingPairs.length} párů písní postupně
					</Typography>
				)}
			</Card>

			{/* Popupy pro výběr písní */}
			<SongSelectPopup
				open={openPopup1}
				onClose={() => setOpenPopup1(false)}
				anchorRef={anchorRef1}
				onSubmit={(packs) => {
					if (packs.length > 0) {
						setSong1(packs[0])
					}
				}}
				filterFunc={(p) => p.packGuid !== song2?.packGuid}
				disableMultiselect
				submitLabel="Vybrat píseň"
			/>

			<SongSelectPopup
				open={openPopup2}
				onClose={() => setOpenPopup2(false)}
				anchorRef={anchorRef2}
				onSubmit={(packs) => {
					if (packs.length > 0) {
						setSong2(packs[0])
					}
				}}
				filterFunc={(p) => p.packGuid !== song1?.packGuid}
				disableMultiselect
				submitLabel="Vybrat píseň"
			/>

			{/* Popup pro náhled písně */}
			<Popup
				open={!!previewSong}
				onClose={() => setPreviewSong(null)}
				title={previewSong?.title || 'Náhled písně'}
			>
				{previewSong && (
					<Box sx={{ maxWidth: 400 }}>
						{previewSong.sheetData ? (
							<SongVariantCard data={previewSong} flexibleHeight={true} />
						) : (
							<Box sx={{ p: 3 }}>
								<Typography variant="h6" sx={{ mb: 2 }}>
									{previewSong.title}
								</Typography>
								<Typography sx={{ color: 'text.secondary' }}>
									Náhled písně není dostupný - chybí data o písni.
								</Typography>
								<Typography sx={{ mt: 1, fontSize: '0.875rem' }}>
									PackGuid: {previewSong.packGuid}
								</Typography>
							</Box>
						)}
					</Box>
				)}
			</Popup>
		</Box>
	)
}
