import fs from 'fs'

type File = { file: string; contents: string }

export const deduplicator = async () => {
	// find any files with duplicate contents in the directory `./out`
	const files = fs.readdirSync('./out')
	console.log(`Found ${files.length} files`)

	const metadata = fs
		.readFileSync('./out/metadata.jsonl', 'utf8')
		.split('\n')
		.filter(Boolean)
		.map(line => JSON.parse(line))

	const fileContents = files.map(file => {
		return { file, contents: fs.readFileSync(`./out/${file}`).toString() }
	}) as File[]
	console.log(`Read ${fileContents.length} files`)

	const duplicates = [] as string[]

	fileContents.reduce((acc: File[], file: File) => {
		const index = acc.findIndex(f => f.contents === file.contents)

		if (index === -1) acc.push(file)
		else duplicates.push(file.file)

		return acc
	}, [])
	console.log(`Found ${duplicates.length} duplicates`)

	duplicates.forEach(duplicate => {
		fs.unlinkSync(`./out/${duplicate}`)
	})

	const dedupedMeta = metadata.filter(meta => !duplicates.includes(meta.file_name))
	fs.writeFileSync('./out/metadata.jsonl', dedupedMeta.map(meta => JSON.stringify(meta)).join('\n'))

	console.log(`Deleted ${duplicates.length} duplicates, meta now has ${dedupedMeta.length} entries.`)
}
