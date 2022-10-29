# DGT Test Scraper
This tool scraps a <a href="https://revista.dgt.es/es/test">DGT website containing multiple driving tests</a> and outputs them as JSON or as an Anki deck (.apkg)

<a href="https://server.raine.page/dgt_tests">
	<img src="https://server.raine.page/dgt_tests/image.cgi#d">
</a>

## CLI Help
```
DGT test scraper
Usage: node index.js [options]

Options:
  -h, --help     Show help
  -V, --version  Show version number
  -v, --verbose  Make the program verbose
  -l, --latest   Get the id and date of the latest test
  -t, --test     <test id>   Test to scrap
  -r, --range    <first test id> <last test id>   Range of tests to scrap
  -o, --output   <filename>   Output file path
      --anki     Export the questions as an anki deck
  -u, --ugly     Do not prettify the JSON
```
## How to run
* Install node.js (v17.6.0 is recommended) and npm
* Clone or download this repository
* Open a terminal and navigate to this project's main folder (which you downloaded in the last step)
* Run `npm i` to install the dependencies
* Now run `node .` to start the program, or `node . -h` to see its help
## More
Screenshot of a card from an Anki deck which was generated with this tool

<img width="400" src="https://user-images.githubusercontent.com/25404214/198780485-178c1fc5-b114-4ec5-8efd-0d9112daa27b.png">
