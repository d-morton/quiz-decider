var settings = {
    slackWebhookURL: SECRET
};

// Get the sheets
var ss = SpreadsheetApp.getActiveSpreadsheet();
var s_quizzes = ss.getSheetByName('decided');

function getLatestQuiz() {
  // Get the last quiz details
  var lastQuiz = {}
  lastQuiz.row = s_quizzes.getDataRange().getLastRow()
  var range = s_quizzes.getRange(lastQuiz.row, 1, 1, 3).getValues()
  lastQuiz.date = new Date(range[0][0])
  lastQuiz.person = range[0][1]
  lastQuiz.theme = range[0][2]
  return lastQuiz
}

function showLatestQuiz() {
  var lastQuiz = getLatestQuiz()
  talk("The latest quiz is on " + lastQuiz.theme + " by " + lastQuiz.person + " and was started on " + lastQuiz.date.toLocaleDateString() + ".")
  return
}

function doGet(e) {
  if(e.parameter["action"] == "setquiz") {
    setQuiz()
  } else if(e.parameter["action"] == "currentquiz") {
    showLatestQuiz()
  }
  return ContentService.createTextOutput(e.parameter["action"]);
}

function setQuiz() {
  // Get the last quiz details
  var lastQuiz = getLatestQuiz()
  
  // Get the next Quiz Date
  var nextQuizDate;
  if(lastQuiz.date) {
    nextQuizDate = new Date(lastQuiz.date.getTime() + (7 * 24 * 3600 * 1000))
  } else {
    nextQuizDate = findNextQuizDate();
  }
  
  //Gets the themes already done
  var themes = ss.getSheetByName('themes').getDataRange().getValues().flat();
  var doneThemes = s_quizzes.getRange(1, 3, lastQuiz.row).getValues().flat();
  // Removes already done themes from the list of themes
  themes = themes.filter(theme => !doneThemes.includes(theme))
  if(!checkThemes(themes)) { return }  
  
  // Gets list of people and removes last quiz setter from list of possibles
  var people = ss.getSheetByName('people')
                 .getDataRange()
                 .getValues()
                 .flat()
                 .filter(person => person != lastQuiz.person);  
  if(!checkPeople(people, lastQuiz.person)) { return }
  
  // Check if it's time for a new quiz
  setQuizTime = new Date(setQuizTime(nextQuizDate))
  
  if((new Date()) < setQuizTime.getTime()) {
    talk("The next quiz can be set in " + (Math.floor((setQuizTime - new Date()) / 36000) / 100).toString() + " hours.")
  } else {
    // Choose a random person
    person_selected = people[Math.floor(Math.random() * people.length)].toString();
  
    // Choose a random theme
    theme_selected = themes[Math.floor(Math.random() * themes.length)].toString();

    //Write to completed quizzes
    s_quizzes.getRange(lastQuiz.row + 1, 1).getCell(1, 1).setValue(nextQuizDate.toLocaleDateString())
    s_quizzes.getRange(lastQuiz.row + 1, 2).getCell(1, 1).setValue(person_selected)
    s_quizzes.getRange(lastQuiz.row + 1, 3).getCell(1, 1).setValue(theme_selected)
    
    talk("The next quiz will be by " + person_selected + " on " + theme_selected + ".");
    return
  }
}

var payload = {
}

var opts = {
  'method': 'post',
  'contentType': 'application/json'
}

// Sends a message
function talk(msg) {
  payload.text = msg.toString();
  opts.payload = JSON.stringify(payload);
  result = UrlFetchApp.fetch(settings.slackWebhookURL, opts);
}

function findNextQuizDate() {
  
  var date = new Date()
  var day = date.getDay()
  var dateAdjust;
    
  //Find next quiz date
  switch(day) {
    case(0):
      dateAdjust = 1;
      break;
    case(1):
      dateAdjust = 0;
      break;
    default:
      dateAdjust = 8 - day;
    }
    
  date.setDate(date.getDate() + dateAdjust)
  date.setHours(0,0,0,0);
  return date
}

function setQuizTime(nextQuiz) {
  return nextQuiz - (57 * 3600 * 1000)  
}

function checkPeople(people, lastPerson) {
  // Check if people are listed
  if(people.length == 1 && people[0] == '') {
    talk('Error: No people found to set the quiz.')
    return false
  } else if(people.length == 0) {
    talk('Error: Only ' + lastPerson + ' is listed as available for setting quizzes and they did it last time.')
    return false
  } else {
    return true
  }
}

function checkThemes(themes) {
  // Check if there are themes available
  if(themes.length == 1 && themes[0] == '') {
    talk('Error: No themes found for the quiz.')
    return false
  } else if(themes.length == 0) {
    talk('Error: All the themes listed have already been done.')
    return false
  } else {
    return true
  }
}
