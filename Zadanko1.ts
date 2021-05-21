const sample = {
	blocks: [
		{
			key: 'cppid',
			text: 'Jak każdej konferencji online czasu pandemii, wystąpieniom towarzyszyły problemy techniczne, z których najzabawniejszym okazało się nagłe zniknięcie z wizji prezydenta Francji Emmanuela Macrona. Zamiast niego na ekranach pojawił się Władimir Putin – najwyraźniej nieświadomy, że ogląda go cały świat. Po kilku minutach wszystko wróciło do normy i mogliśmy usłyszeć, że również Rosja przejmuje się globalnym ociepleniem…',
			type: 'unstyled',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
			data: {},
		},
	],
	entityMap: {},
}

interface InputObject {
	blocks: {
		key: string
		text: string
		type: string
		depth: number
		inlineStyleRanges?: any[]
		entityRanges?: ERanges[]
		data: {}
	}[]

	entityMap: EMap | {}
}

interface ERanges {
	offset: number
	length: number
	key: number
}

interface EMap {
	type: string
	mutability: string
	data: {
		href: string
		url: string
	}
}

const addLinks = (input: InputObject): InputObject => {
	const pattern = '(Joe[a-z]* Biden[a-z]*)|(Władimir[a-z]* Putin[a-z]*)'
	const content = input

	content.blocks.forEach((e) => {
		const matches = [...e.text.matchAll(new RegExp(pattern, 'g'))]
		console.log(matches)

		matches.forEach((match, key) => {
			let link = 'https://oko.press/ludzie'

			if (match[0].startsWith('J')) link += '/joe-biden'
			else if (match[0].startsWith('W')) link += '/wladimir-putin'

			e.entityRanges.push({
				offset: match.index,
				length: match[0].length,
				key: key,
			})
			content.entityMap[key] = {
				type: 'LINK',
				mutability: 'MUTABLE',
				data: {
					href: link,
					url: link,
				},
			}
		})
	})

	return content
}

const ret = addLinks(sample)

console.log(ret.entityMap, ret.blocks[0].entityRanges)
