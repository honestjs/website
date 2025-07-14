import fs from 'node:fs'
import { glob } from 'node:fs/promises'
import path from 'node:path'

const frontmatterRegex = /^\n*---(\n.+)*?\n---\n/

const docsDir = path.resolve('docs')

const sliceExt = (file: string) => {
	return file.split('.').slice(0, -1).join('.')
}

const extractLabel = (file: string) => {
	return sliceExt(file.split('/').pop() || '')
}

function capitalizeDelimiter(str: string) {
	return str
		.split('-')
		.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
		.join('-')
}

async function generateLLMDocs() {
	const outputListFile = path.resolve('public/llms.txt')

	const optionalFiles = await glob('**/*.md', { cwd: docsDir })

	const optionals: string[] = []

	for await (const file of optionalFiles) {
		optionals.push(
			`- [${capitalizeDelimiter(extractLabel(file)).replace(/-/, ' ')}](https://honestjs.dev/docs/${sliceExt(
				file
			)})`
		)
	}

	fs.writeFileSync(
		outputListFile,
		[
			'# HonestJS',
			'',
			'> HonestJS is a small, simple, and ultrafast web framework built on Web Standards. It works on any JavaScript runtime: Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, Netlify, AWS Lambda, Lambda@Edge, and Node.js.',
			'',
			'## Docs',
			'',
			'- [Full Docs](https://honestjs.dev/llms-full.txt) Full documentation of HonestJS.',
			'- [Tiny Docs](https://honestjs.dev/llms-small.txt): Tiny documentation of HonestJS. (includes only desciption of core)',
			'',
			'## Optional',
			'',
			...optionals,
		].join('\n'),
		'utf-8'
	)
	console.log(`< Output '${outputListFile}' `)

	const outputFullFile = path.resolve('public/llms-full.txt')
	const files = await glob('**/*.md', { cwd: docsDir })

	const fullContent = await generateContent(
		files,
		docsDir,
		'<SYSTEM>This is the full developer documentation for HonestJS.</SYSTEM>\n\n'
	)

	fs.writeFileSync(outputFullFile, fullContent, 'utf-8')
	console.log(`< Output '${outputFullFile}' `)

	const outputTinyFile = path.resolve('public/llms-small.txt')

	const tinyExclude = ['concepts', 'helpers', 'middleware']
	const tinyFiles = await glob('**/*.md', {
		cwd: docsDir,
		exclude: (filename: string) => tinyExclude.includes(filename),
	})

	const tinyContent = await generateContent(
		tinyFiles,
		docsDir,
		'<SYSTEM>This is the tiny developer documentation for HonestJS.</SYSTEM>\n\n'
	)

	fs.writeFileSync(outputTinyFile, tinyContent, 'utf-8')
	console.log(`< Output '${outputTinyFile}' `)
}

async function generateContent(files: NodeJS.AsyncIterator<string>, docsDir: string, header: string): Promise<string> {
	let content = header + '# Start of HonestJS documentation\n'

	for await (const file of files) {
		console.log(`> Writing '${file}' `)
		const fileContent = fs.readFileSync(path.resolve(docsDir, file), 'utf-8')
		content += fileContent.replace(frontmatterRegex, '') + '\n\n'
	}

	return content
}

generateLLMDocs().catch(console.error)
