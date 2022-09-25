import fs from 'fs'
import sharp from 'sharp'
import { buildSVG } from '@nouns/sdk'
import { deduplicator } from './deduplicator'
import { NounData } from '@nouns/assets/dist/types'
import { getNounData, getRandomNounSeed, ImageData } from '@nouns/assets'

const GENERATE_AMOUNT = 50_000
type Metadata = { file_name: string; text: string }

const getNextIndex = (): number => {
	const files = fs.readdirSync('./out')

	const indices = files.map(file => {
		const match = file.match(/noun-(\d+)\.jpg/)

		return match ? parseInt(match[1]) : 0
	})

	return Math.max(0, ...indices) + 1
}

const coolOrWarm = (hex: string): string => (hex == 'd5d7e1' ? 'cool' : 'warm')

const describeGlasses = (parts: NounData['parts']): string => {
	const glasses = parts.find(part => part.filename.startsWith('glasses'))!.filename.split('glasses-')[1]

	switch (glasses) {
		case 'square-black-eyes-red':
			return 'square glasses with black frames and red eyes'
		case 'hip-rose':
			return 'square pink glasses'
		case 'square-black-rgb':
			return 'square black sunglasses'
		case 'square-black':
			return 'square black glasses'
		case 'square-blue':
			return 'square blue glasses'
		case 'square-blue-med-saturated':
			return 'square blue glasses'
		case 'square-blue-med':
			return 'square purple glasses'
		case 'square-frog-green':
			return 'square light green glasses'
		case 'square-fullblack':
			return 'square black sunglasses'
		case 'square-green-blue-multi':
			return 'square green and blue glasses'
		case 'square-grey-light':
			return 'square dark gray glasses'
		case 'square-guava':
			return 'square orange glasses'
		case 'square-honey':
			return 'square brown glasses'
		case 'square-magenta':
			return 'square dark red glasses'
		case 'square-orange':
			return 'square orange glasses'
		case 'square-pink-purple-multi':
			return 'square pink and red glasses'
		case 'square-red':
			return 'square red glasses'
		case 'square-smoke':
			return 'square light gray glasses'
		case 'square-teal':
			return 'square light green glasses'
		case 'square-watermelon':
			return 'square orange glasses'
		case 'square-yellow-orange-multi':
			return 'square yellow and orange glasses'
		case 'square-yellow-saturated':
			return 'square yellow glasses'
		case 'deep-teal':
			return 'square dark green glasses'
		case 'grass':
			return 'square green glasses'
		case 'deep-grass':
			return 'square green glasses'

		default:
			throw new Error(`Unknown glasses: ${glasses}`)
	}
}

const describeHead = (parts: NounData['parts']): string => {
	const head = parts.find(part => part.filename.startsWith('head'))!.filename.split('head-')[1]

	switch (head) {
		case 'baseball-gameball':
			return 'baseball ball'
		case 'bigfoot-yeti':
			return 'yeti'
		case 'boxingglove':
			return 'boxing glove'
		case 'chefhat':
			return 'chef hat'
		case 'bubble-speech':
			return 'speech bubble'
		case 'burger-dollarmenu':
			return 'burger'
		case 'cannedham':
			return 'canned ham'
		case 'cash-register':
			return 'cash register'
		case 'cassettetape':
			return 'cassette tape'
		case 'chart-bars':
			return 'bar chart'
		case 'console-handheld':
			return 'gameboy'
		case 'cordlessphone':
			return 'cordless phone'
		case 'croc-hat':
			return 'crocodile'
		case 'crt-bsod':
			return 'old monitor'
		case 'diamond-blue':
			return 'blue diamond'
		case 'diamond-red':
			return 'red diamond'
		case 'factory-dark':
			return 'factory'
		case 'film-35mm':
			return 'film roll'
		case 'film-strip':
			return 'film strip'
		case 'firehydrant':
			return 'fire hydrant'
		case 'ghost-b':
			return 'ghost'
		case 'glasses-big':
			return 'glasses'
		case 'goldcoin':
			return 'medal'
		case 'hardhat':
			return 'construction helmet'
		case 'hockeypuck':
			return 'hockey puck'
		case 'horse-deepfried':
			return 'yellow horse'
		case 'icepop-b':
			return 'icepop'
		case 'lightning-bolt':
			return 'lightning bolt'
		case 'lipstick-2':
			return 'lipstick'
		case 'mountain-snowcap':
			return 'snowy mountain'
		case 'pencil-tip':
			return 'pencil'
		case 'queencrown':
			return 'crown'
		case 'rangefinder':
			return 'camera'
		case 'rgb':
			return 'color circle'
		case 'ruler-triangular':
			return 'squadron ruler'
		case 'saguaro':
			return 'cactus'
		case 'skilift':
			return 'tram wagon'
		case 'snowglobe':
			return 'snow globe'
		case 'star-sparkles':
			return 'star'
		case 'taco-classic':
			return 'taco'
		case 'toilerpaper-full':
			return 'toilet paper'
		case 'toothbrush-fresh':
			return 'toothbrush'
		case 'undead':
			return 'zombie-hand'
		case 'washingmachine':
			return 'washing machine'
		case 'whale-alive':
			return 'whale'
		case 'wizardhat':
			return 'wizard hat'
		case 'lipstick2':
			return 'lipstick'
		case 'index-card':
			return 'empty notebook page'
		case 'treasurechest':
			return 'treasure chest'
		case 'vending-machine':
			return 'vending machine'
		case 'wine-barrel':
			return 'wine barrel'

		default:
			return head
	}
}

const getBodyColor = (parts: NounData['parts']): string => {
	const body = parts.find(part => part.filename.startsWith('body'))!.filename.split('body-')[1]

	return `${body.split('-')[0]}-colored`
}

const generateNounDescription = (data: NounData): string => {
	const { parts, background } = data

	return `a pixel art character with ${describeGlasses(parts)}, a ${describeHead(
		parts
	)}-shaped head and a ${getBodyColor(parts)} body on a ${coolOrWarm(background)} background`
}

const saveNounImage = async (noun: NounData, path: string): Promise<void> => {
	const svg = buildSVG(noun.parts, ImageData.palette, noun.background)

	await sharp(Buffer.from(svg)).jpeg().toFile(path)
}

const main = async () => {
	const metadata: Metadata[] = fs
		.readFileSync('./out/metadata.jsonl', 'utf8')
		.split('\n')
		.filter(Boolean)
		.map(line => JSON.parse(line))

	const nextIndex = getNextIndex()
	console.log(`Starting at index ${nextIndex}`)

	for (let i = nextIndex; i < nextIndex + GENERATE_AMOUNT; i++) {
		const noun = getNounData(getRandomNounSeed())

		await saveNounImage(noun, `./out/noun-${i}.jpg`)
		metadata.push({ file_name: `noun-${i}.jpg`, text: generateNounDescription(noun) })
		console.log(`Generated noun-${i}.jpg`)
	}

	fs.writeFileSync('./out/metadata.jsonl', metadata.map(meta => JSON.stringify(meta)).join('\n'))
	console.log(`Wrote ${metadata.length} entries to metadata.jsonl`)

	await deduplicator()
}

main().catch(e => {
	console.error(e)
	process.exit(1)
})
