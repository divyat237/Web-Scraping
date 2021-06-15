let req = require("request");
let ch = require("cheerio");
let path = require("path");
let xlsx = require("xlsx");
const fs = require("fs");

function processMatch(url) {
    req(url, cb);
}

function cb(error, response, data) {
    if (response.statusCode == 404) {
        console.log("Page not found");
    } else if (response.statusCode == 200) {
        parseHTML(data);
    } else {
        console.log(err);
    }
}

function parseHTML(data) {

    let fTool = ch.load(data);
    let elems = fTool(".Collapsible");
    for (let i = 0; i < elems.length; i++) {
        let InningElement = ch(elems[i]);
        let teamName = InningElement.find("h5").text();
        let stringArr = teamName.split("INNINGS")
        teamName = stringArr[0].trim();
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("TeamName: ", teamName);
        // player deatils
        let playerRows = InningElement.find(".table.batsman tbody tr");
        // player
        for (let j = 0; j < playerRows.length; j++) {
            let cols = ch(playerRows[j]).find("td");
            // eliminating commentary rows
            let isAllowed = ch(cols[0]).hasClass("batsman-cell");
            if (isAllowed) {
                // console.log("valid row");
                let playerName = ch(cols[0]).text().trim();
                let runs = ch(cols[2]).text().trim();
                let balls = ch(cols[3]).text().trim();
                let fours = ch(cols[5]).text().trim();
                let sixes = ch(cols[6]).text().trim();
                let sr = ch(cols[7]).text().trim();
                console.log(`${playerName} played for ${teamName} and scored ${runs} runs in ${balls} balls with SR : ${sr}`)
                // data -> required folder ,required file data add 
                processPlayer(playerName, runs, balls, sixes, fours, sr, teamName);
            }
        }
        console.log("``````````````````````````````````````````");
    }
}
function processPlayer(playerName, runs, balls, sixes, fours, sr, teamName) {
    // data -> 
    let playerObject = {
        playerName: playerName,
        runs: runs,
        balls: balls, sixes,
        fours: fours,
        sr: sr, teamName
    }
    // check -> task 
    // check -> folder exist ? (check file ? data append: file create data add):create folder -> create file data enter 
    let dirExist = checkExistence(teamName);
    if (dirExist) {

    } else {
        createFolder(teamName);
    }
    // file check 
    let playerFileName = path.join(__dirname, teamName, playerName + ".xlsx");
    // data exist 
    let fileExist = checkExistence(playerFileName);
    let playerEntries = [];
    if (fileExist) {
        let JSONdata = excelReader(playerFileName, playerName)
        playerEntries = JSONdata;
        playerEntries.push(playerObject);
        excelWriter(playerFileName, playerEntries, playerName);
    } else {
        // create file and add data
        playerEntries.push(playerObject);
        excelWriter(playerFileName, playerEntries, playerName);
    }
}
function checkExistence(teamName) {
    return fs.existsSync(teamName);
}
function createFolder(teamName) {
    fs.mkdirSync(teamName);
}

function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    } else {
        // workbook => excel
        let wt = xlsx.readFile(filePath);
        // csk -> msd
        // get data from workbook
        let excelData = wt.Sheets[name];
        // convert excel format to json => array of obj
        let ans = xlsx.utils.sheet_to_json(excelData);
        // console.log(ans);
        return ans;
    }
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    // console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    // msd.xlsx-> msd
    xlsx.utils.book_append_sheet(newWB, newWS, name);  //workbook name as parameter
    //   file => create , replace
    xlsx.writeFile(newWB, filePath);
}
module.exports = {
    pm: processMatch
}
