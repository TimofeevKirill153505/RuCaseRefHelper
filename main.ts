import { Plugin, App } from 'obsidian';
import axios from 'axios'
import { read } from 'fs';



export default class MyCaseHelper extends Plugin {
	onload(): void {
		// this.app.vault.on("create", doYourThing);
		// this.app.vault.on("rename", doYourThing);
		const app: App = this.app;
		const command = {
			id: 'id',
			name: 'Generate Aliases',

			callback: async function () {
				// const app: App = this.app;
				const file = app.workspace.getActiveFile();
				if (file != null) {
					const aliasesString = await doYourThing(file?.name)
					app.vault.process(file, (content) => {

						//let content = await app.vault.read(file)
						console.log(`content : ${content}`);
						const pattern = /(?<=---[\s\w:\-]*)(?:aliases:(?:\s+ - [\w\sА-Яа-я]*)*)(?=[\s\w:\-]*---)/gmu
						// if there is pattern, than replace
						const searchResult = content.search(pattern)
						if (searchResult != -1) {
							console.log(`SearchResult ${searchResult}. There is aliases in file properties`)
							content = content.replace(pattern, aliasesString);
						}
						// otherwise add it
						else {
							console.log(`SearchResult ${searchResult}. There is no aliases in file properties`)
							const propertiesPattern = /---[\wА-Яа-я:\-\s]+---/gmu
							const ind = content.search(propertiesPattern);
							if (ind != -1) {
								console.log(`Index of properties ${searchResult}. There is properties in file`)

								content = content.slice(0, ind + 3 + 1) + `\n${aliasesString}\n` + content.slice(ind + 3 + 1);
							}
							else {
								console.log(`Index of properties ${searchResult}. There is no properties in file`)

								content = `---\n${aliasesString}\n---\n` + content;
							}
						}

						return content;
					})
				}
			}
		}

		this.addCommand(command);
	}
}

async function doYourThing(filename: string) {
	// const filename: string = file.name;
	//const re = /(?:[\s+]|\.md)/;
	//const words = filename.split(re);
	// for (const word of words) {
	// 	console.log(word)
	// 	console.log(JSON.stringify(await getWordInfo(word)))
	// }

	let name = filename.slice(0, -3);
	name = name.replace(/\s+/, "%20");

	console.log('marker')
	console.log(name)
	const obj = (await getWordInfo(name));
	console.log(JSON.stringify(obj));
	const res = generateAliases(obj)
	console.log(res);
	return res;

}

async function getWordInfo(word: string) {
	const url = `https://ws3.morpher.ru/russian/declension?s=${word}&format=json`
	console.log(url);
	return ((await axios.get(url)).data)
}

function generateAliases(obj: any): string {
	let result = 'aliases:\n';
	for (const prop in obj) {
		if (prop != 'множественное') {
			result += ` - ${obj[prop]}\n`;
			result += ` - ${obj[prop].toLowerCase()}\n`
		}
		else {
			for (const mprop in obj[prop]) {
				result += ` - ${obj[prop][mprop]}\n`
				result += ` - ${obj[prop][mprop].toLowerCase()}\n`
			}
		}
	}
	return result;
}