var MARK_UNREAD = true; //Set to true, this marks all snoozed and unsnoozed unread so it is easy to find
var NR_DAYS = 6; //Number of days. Do not use 7 since that will be a week.
var NR_WEEKS = 26; //Randomly chosen, will not postpone a mail for more than this number of weeks.

// This function gets the label name used for snoozing days
function getDayLabelName(i) {
  if (i==1){
    return "Zday/Snooze " + i + " day";
  } else {  
    return "Zday/Snooze " + i + " days";
  }  
}

// This function gets the label name used for snoozing weeks
function getWeekLabelName(i) {
  if (i==1){
    return "Zweek/Snooze " + i + " week";
  }else {  
    return "Zweek/Snooze " + i + " weeks";
  }  
}

function daySetup() {
  // Create the labels we’ll need for snoozing
  // I choose to name the main label "Zday" so it is short and gets last of the labels :)
  GmailApp.createLabel("Zday");
  GmailApp.createLabel(getDayLabelName(1));
  for (var i = 2; i <= NR_DAYS; ++i) {
    GmailApp.createLabel(getDayLabelName(i));
  }
}

function weekSetup() {
  // Create the labels we’ll need for snoozing
  // I choose to name the main label "Zweek" so it is short and gets last of the labels :)
  GmailApp.createLabel("Zweek");
  GmailApp.createLabel(getWeekLabelName(1));
  for (var i = 2; i <= NR_WEEKS; ++i) {
    GmailApp.createLabel(getWeekLabelName(i));
  }
}

function getSnoozeThreads(){
  var gmailSearchString = "label:zweek-snooze-1-week"
  for (var weekNr = 2; weekNr<=NR_WEEKS; weekNr++){
    gmailSearchString = gmailSearchString + " OR label:zweek-snooze-" + weekNr + "-weeks";
  }
  gmailSearchString = gmailSearchString + " OR label:zday-snooze-1-day";
  for (var dayNr = 2; dayNr<=NR_DAYS; dayNr++){
    gmailSearchString = gmailSearchString + " OR label:zday-snooze-" + dayNr +"-days";
  }
  Logger.log(gmailSearchString);
  return GmailApp.search(gmailSearchString);
}

function moveSnoozes(){
  var snoozeThreads = getSnoozeThreads();
  
  // Test to see if we have the correct threads
  Logger.log("Pre-scan of threads to see if we have the correct threads extracted.");
  for (var i=0; i<snoozeThreads.length; i++){
    var subject = snoozeThreads[i].getFirstMessageSubject();
    Logger.log("Thread subject snoozeThreads[" + i + "].getFirstMessageSubject() = " + subject);
  }
  
  Logger.log("Number of threads are " + snoozeThreads.length);
  Logger.log("");
  
  // Scan through the threads and set correct labels.
  for (var i=0; i<snoozeThreads.length; i++){
    var thread = snoozeThreads[i];
    var labels = thread.getLabels();
    var weekLabel = "";
    var dayLabel = "";
    var newWeekLabel = "";
    var newDayLabel = "";
    var dayNr = 0;
    var weekNr = 0;
    
    // Information about the thread
    var subject = thread.getFirstMessageSubject();
    Logger.log("Thread subject snoozeThreads[" + i + "].getFirstMessageSubject() = " + subject);
    for (var j=0; j<labels.length; j++){
      var label = labels[j];
      var labelName = label.getName();
      Logger.log("Label " + j + " is called " + labelName);
      if (labelName.search("week") > -1){
        weekNr = labelName.match(/\d+/g)[0];
        weekLabel = label;
        Logger.log("Week label name is " + weekLabel.getName());
      }
      if (labelName.search("day") > -1){
        dayNr = labelName.match(/\d+/g)[0];
        dayLabel = label;
        Logger.log("Day label name is " + dayLabel.getName());
      } 
    }
    
    // Move down one day
    // If one day left, move to inbox
    if ((weekNr == 0) && (dayNr == 1)){
      GmailApp.moveThreadToInbox(thread);
      dayLabel.removeFromThread(thread);
      if (MARK_UNREAD == true) {
        var messages = thread.getMessages();
        var lastMessage = messages[messages.length - 1];
        lastMessage.markUnread();
      }
      Logger.log("weekNr == 0 and dayNr == 1. Moved to inbox and removed dayLabel from thread");
    } else if (dayNr > 1){
      newDayLabel = GmailApp.getUserLabelByName(getDayLabelName(dayNr - 1));
      newDayLabel.addToThread(thread);
      dayLabel.removeFromThread(thread);
      Logger.log("dayNr > 1. Added new day label and removed old day label");
      Logger.log("newDayLabel.getName() = " + newDayLabel.getName());
    } else if ((weekNr == 1) && (dayNr == 0)){
      newDayLabel = GmailApp.getUserLabelByName(getDayLabelName(NR_DAYS));
      newDayLabel.addToThread(thread);
      weekLabel.removeFromThread(thread);
      Logger.log("weekNr == 1 and dayNr == 0. Week is removed and daylabel for 6 days added");
      Logger.log("newDayLabel.getName() = " + newDayLabel.getName());
    } else if ((weekNr > 0) && (dayNr == 1)){
      dayLabel.removeFromThread(thread);
      Logger.log("weekNr > 0 and dayNr == 1. DayLabel is removed from thread");
    } else if ((weekNr > 1) && (dayNr == 0)){
      newDayLabel = GmailApp.getUserLabelByName(getDayLabelName(NR_DAYS));
      newWeekLabel = GmailApp.getUserLabelByName(getWeekLabelName(weekNr - 1));
      newDayLabel.addToThread(thread);
      newWeekLabel.addToThread(thread);
      weekLabel.removeFromThread(thread);
      Logger.log("Week > 1 and dayNr == 0. Week down one and day up to six");
      Logger.log("newDayLabel.getName() = " + newDayLabel.getName());
      Logger.log("newWeekLabel.getName() = " + newWeekLabel.getName());
    }
    Logger.log("");
  }
}
  
function test(){
  var string = "Test/bla bla 123hei-45";
  var nr = string.match(/\d+/g)[0];
  Logger.log(nr);
}
               