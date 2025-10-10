'use client'
// import { useParams } from 'react-router-dom'
import { PresentationPlaylistCards } from '@/app/(layout)/playlist/[guid]/prezentace/PresentationPlaylistCards'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'

export default SmartPage(PresentationPlaylistCards, ['fullWidth'])
