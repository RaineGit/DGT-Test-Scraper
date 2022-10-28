const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");
const fs = require("fs");
const yargs = require("yargs/yargs");
const yargsHelpers = require("yargs/helpers");

const argv = yargs(yargsHelpers.hideBin(process.argv))
	.usage("\nDGT test scraper\nUsage: $0 [options]")
	.help("help").alias("help", "h")
	.version("version", "1.0.0").alias("version", "V")
	.options({
		verbose: {
			alias: "v",
			description: "Make the program verbose",
			type: "boolean",
			required: false
		},
		latest: {
			alias: "l",
			description: "Get the id and date of the latest test",
			type: "boolean",
			required: false
		},
		test: {
			alias: "t",
			description: "<test id>   Test to scrap",
			type: "number",
			requiresArg: true,
			required: false
		},
		range: {
			alias: "r",
			description: "<first test id> <last test id>   Range of tests to scrap",
			type: "array",
			requiresArg: true,
			required: false
		},
		output: {
			alias: "o",
			description: "<filename>   Output file path",
			type: "string",
			requiresArg: true,
			required: false
		},
		ugly: {
			alias: "u",
			description: "Do not prettify the JSON",
			type: "boolean",
			required: false
		},
	})
	.argv;
const outputToFile = argv.output !== undefined;
const verbose = argv.verbose || outputToFile;
var startNum = argv.test || (argv.range ? argv.range[0] : undefined);
var endNum = argv.test || (argv.range ? argv.range[1] : undefined);

main();

async function main() {
	const results = [];
	const server = "https://revista.dgt.es";
	if((startNum === undefined && endNum === undefined) || argv.latest) {
		const url = server + "/es/test/";
		const response = await fetch(url);
		if(response.status != 200) {
			console.error("Unable to load test list");
			if(!argv.latest)
				console.error("You must manually specify what test must be scraped");
			process.exit(1);
		}
		const rawHtml = await response.text();
		const { document } = (new JSDOM(rawHtml)).window;
		const latestTestElem = document.querySelector(".bloque_9 > #enlaces_relacionados > ul > li > a");
		const latestTest = Number(latestTestElem.href.split("Test-num-")[1].split(".")[0]);
		if(argv.latest) {
			const latestTestDate = latestTestElem.textContent;
			console.log("ID: " + latestTest);
			console.log("Date: " + latestTestDate);
			process.exit(0);
		}
		else {
			endNum = latestTest;
			startNum = latestTest - 19;
		}
	}
	else if(startNum === undefined)
		startNum = endNum - 19;
	else if(endNum === undefined) {
		endNum = startNum + 19;
	}
	if(isNaN(startNum) || isNaN(endNum)) {
		console.error("The start id and the end id must be numbers");
		process.exit(1);
	}
	if(verbose) {
		if(startNum == endNum)
			console.error("Scraping test " + startNum + "...");
		else
			console.error("Scraping tests " + startNum + " to " + endNum + "...");
	}
	for(var i=startNum; i<=endNum; i++) {
		const percentage = Math.round((i - startNum + 1) / (endNum - startNum + 1) * 100);
		const url = server + "/es/test/Test-num-" + i + ".shtml";
		const response = await fetch(url);
		if(response.status != 200) {
			if(verbose)
				console.error(percentage + "%: Unable to fetch test " + i + ", skipping...");
			continue;
		}
		const rawHtml = await response.text();
		const { document } = (new JSDOM(rawHtml)).window;
		const date = document.querySelector("section.conjunto > header > h3.tit_general").textContent.replace("-", " ");
		for(const questionElem of document.querySelectorAll("article.test")) {
			const question = questionElem.querySelector(".tit_not").textContent.split(".").slice(1).join(".").trim();
			const image = server + questionElem.querySelector("figure img").src;
			const correctAnswer = questionElem.querySelector(".content_respuesta > p > span.opcion").textContent.toLowerCase();
			const answers = [];
			for(const answer of questionElem.querySelectorAll(".content_test > ul > li")) {
				const answerLetter = answer.querySelector("span.opcion").textContent[0].toLowerCase();
				const answerText = answer.textContent.split(".").slice(1).join(".").trim();
				answers.push({
					text: answerText,
					correct: answerLetter == correctAnswer
				});
			}
			results.push({
				question,
				image,
				answers,
				date
			});
		}
		if(verbose)
			console.error(percentage + "%: Scraped \"" + date + "\" test (num " + i + ")");
	}
	const json = (argv.ugly ? JSON.stringify(results) : JSON.stringify(results, null, 2));
	if(outputToFile)
		fs.writeFileSync(argv.output, json);
	else
		console.log(json);
}