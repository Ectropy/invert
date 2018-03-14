//(function (global) { //An Immediately Invoked Function Expression (IIFE) that contains the app's main code. This breaks onclick events!
//'use strict'; //This code isn't ready to be subjected to "strict"

//Set up the selectize.
$('#itemName').selectize({
  create: true,
  //lockOptgroupOrder: true,
  onChange:function(value){
      $("#purchaseLimit").text("Purchase Limit: " + getItemBuyLimit(value));
  }
});


onload = function(){
  var flips = loadFlips();
  console.log(flips);
  var index = localStorage.getItem("INVERTindex");
  if (index !== null){
      for (var i=1; i <= index; i++){
          if (flips[i] !== null){ //skip if this flip has been deleted and has no info.
          displayFlip(flips[i], i); //otherwise display it.
          }
      }
  }


  var txtBuyFor = document.getElementById('buyFor');
  txtBuyFor.oninput = recalculateMargins;
  txtBuyFor.onpropertychange = txtBuyFor.oninput; // for IE8
  // txtBuyFor.onchange = txtBuyFor.oninput; // FF needs this in <select><option>...

  var txtSellFor = document.getElementById('sellFor');
  txtSellFor.oninput = recalculateMargins;
  txtSellFor.onpropertychange = txtSellFor.oninput; // for IE8
  // txtSellFor.onchange = txtSellFor.oninput; // FF needs this in <select><option>...

  var txtQuantity = document.getElementById('quantity');
  txtQuantity.oninput = recalculateMargins;
  txtQuantity.onpropertychange = txtQuantity.oninput; // for IE8
  // txtSellFor.onchange = txtSellFor.oninput; // FF needs this in <select><option>...
};

function recalculateMargins() {
  var buy = $('#buyFor').val();
  var sell = $('#sellFor').val();
  var profit = sell-buy;
  $('#profit').text(profit + " gp");
  var quantity = $('#quantity').val();
  var totalCost = buy*quantity;
  var totalRevenue = sell*quantity;
  var totalProfit = profit*quantity;
  $('#cost').text(totalCost.toLocaleString() + " gp");
  $('#revenue').text(totalRevenue.toLocaleString() + " gp");
  $('#totalProfit').text(totalProfit.toLocaleString() + " gp");
}

//A list of items and their buy limits. A selectize can't store data- in itself, so we use this function instead,
//and lookup the info via known itemAbbreviations.
function getItemBuyLimit(value) {
  switch (value){
  //BLINE - Bandos Line
  case "bh": return "1/4";
  case "bcp": return "1/4";
  case "tass": return "1/4";
  case "bg": return "1/4";
  case "bb": return "1/4";
  case "bws": return "1/4";
  //ALINE - Armadyl Line
  case "ah": return "1/4";
  case "acp": return "1/4";
  case "acs": return "1/4";
  case "ag": return "1/4";
  case "ab": return "1/4";
  case "acb": return "1/4";
  case "oacb": return "1/4";
  case "buck": return "1/4";
  //SLINE - Subjugation Line
  case "sh": return "1/4";
  case "garb": return "1/4";
  case "gown": return "1/4";
  case "sg": return "1/4";
  case "sb": return "1/4";
  case "ward": return "1/4";
  //T LINE - Tetsu Line
  case "tth": return "2/4";
  case "ttb": return "2/4";
  case "ttl": return "2/4";
  //"DL LINE - Death Lotus Line
  case "blh": return "2/4";
  case "dlcp": return "2/4";
  case "dlc": return "2/4";
  // SS LINE - Seasinger's Line
  case "ssh": return "2/4";
  case "sst": return "2/4";
  case "ssb": return "2/4";
  //AMULETS - Amulets Line
  case "hiss": return "1/4";
  case "murm": return "1/4";
  case "whisp": return "1/4";
  //MISC LINE - Miscellaneous Line
  case "sss": return "1/4";
  case "rhh": return "2/4";
  case "rb": return "2/4";
  case "blood": return "2/4";
  //KITES - Kites Line
  case "male": return "1/4";
  case "merc": return "1/4";
  case "veng": return "1/4";
  default: return "Unknown";
  }
}

//Functions for storage and reading of flips _________________________________
function addFlipClick() {
  toggleTabs("current"); //switch to view the current tab in case we're viewing a different one.

  var itemName = $('#itemName option:selected').text();
  var itemAbbreviation = $('#itemName option:selected').val();
  var itemBuyLimit = getItemBuyLimit(itemAbbreviation);
  var buy = $('#buyFor').val();
  var sell = $('#sellFor').val();
  var quantity = $('#quantity').val();
  var buyStartedTime = new Date();
  var timerDuration = $('#timerDuration').val();
  var timerEnd = addMinutes(buyStartedTime, timerDuration);
  var buyTimesRuleApplied = 0;
  var sellTimesRuleApplied = 0;

  //ensure that all required fields are filled out.

  //create an object storing flip info.
  var flip = {itemName: itemName, itemAbbreviation: itemAbbreviation, itemBuyLimit: itemBuyLimit, buy: buy, sell: sell, quantity: quantity, buyStartedTime: buyStartedTime, timerDuration: timerDuration, timerEnd: timerEnd, buyTimesRuleApplied: buyTimesRuleApplied, sellTimesRuleApplied: sellTimesRuleApplied, buyCompleted: "no", sellCompleted: "no", archived: false};
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(flip);

  if(typeof(Storage) !== "undefined") {
      if (localStorage.getItem("INVERTindex") === null) //if there isn't an index yet
      {
          console.log("no index");
          localStorage.setItem("INVERTindex", "1"); //set up the index with an intital value
          storeFlipInfo(stringFlip, "1");
          clearNewFlipForm();
          $.notify({message: "Flip added."},
           {type: "success",
           placement:
              {align: "center"}
           });
      }
      else
      {
          var currIndex = parseInt(localStorage.getItem("INVERTindex")) + 1; //otherwise increment it's current value by 1
          console.log("index of " + currIndex);
          localStorage.setItem("INVERTindex",currIndex);
          storeFlipInfo(stringFlip, currIndex);
          clearNewFlipForm();
          $.notify({message: "Flip added."},
           {type: "success",
           placement:
              {align: "center"}
           });
      }
  } else {
      alert("We can't store this info in localStorage, because your browser doesn't support it. Please, update to a modern browser to take advantage of Invert's full capabilities.");
  }
}

function storeFlipInfo(stringFlip, index) {
  console.log("storing in " + index);
  localStorage.setItem("INVERTf"+index,stringFlip);

  //clear old info, then write updated info
  $("#flipsPanels").html("");
  var flips = loadFlips();
  console.log(flips);
  var pointer = localStorage.getItem("INVERTindex");

  if (pointer !== null){
      for (var i=1; i <= pointer; i++){
          if (flips[i] !== null){ //skip if this flip has been deleted and has no info.
          displayFlip(flips[i], i); //otherwise display it.
          }
      }
  }
}

function clearNewFlipForm() {
  $('#itemName').selectize()[0].selectize.clear();//reset selectize
  $('#newFlipForm').trigger("reset"); //reset most other fields
  recalculateMargins(); //adjust margins based on resetted form fields.
}

function loadFlips() {
  var index = localStorage.getItem("INVERTindex");
  var arrayOfFlips = [];
  if (index !== null){ //don't bother loading if there is no index set up. That means there shouldn't be any flips either.

      var foundAnArchivedFlip = false;
      var foundACurrentFlip = false;
      for (var i=1; i <= index; i++) {
          arrayOfFlips[i] = getFlip(i); //parse the string back into an object.
          if (getFlip(i) !== null)
          {
              if (getFlip(i).archived === false){
              foundACurrentFlip = true;
              }
              if (getFlip(i).archived === true){
              foundAnArchivedFlip = true;
              }
          }
      }
      //There are cases where no flips of certain types were found. These ifs are how we handle those cases.
      if (foundAnArchivedFlip === false && foundACurrentFlip === false){
          $("#flipsPanels").append("<h3>It's lonely in here.</h3><p>It looks like you haven't created any flips yet.</p><p>Try adding a new one and it will be displayed in this area.</p>");
      }
      else
          {
          if (foundACurrentFlip === false) {
              $("#flipsPanels").append("<span class=\"current currentNotification\"><h3>It's lonely in here.</h3><p>It looks like there aren't any current flips.</p><p>Try checking the \"All\" tab to see every flip in the system.</p></span>");
          }
          if (foundAnArchivedFlip === false){
              $("#flipsPanels").append("<span class=\"archived archivedNotification\"><h3>It's lonely in here.</h3><p>It looks like there aren't any archived flips.</p><p>Try checking the \"All\" tab to see every flip in the system.</p></span>");
          }
      }
      return arrayOfFlips;
  }
  else{ //If i isn't set up there are no flips.
      $("#flipsPanels").append("<h3>It's lonely in here.</h3><p>It looks like you haven't created any flips yet.</p><p>Try adding a new one and it will be displayed in this area.</p>");
  }

}

function getFlip(index) { //for when you have the flip's number like "2"
  return JSON.parse(localStorage.getItem("INVERTf"+index));
}

function getFlipById(id){ //for when you have the flip's id like "f2"
  return JSON.parse(localStorage.getItem("INVERT"+id));
}

function formatPrice(price) {
  if (price < 1000) {
      return price + "gp";
  }
  else{
      return price.toString().slice(0, -3) + "k";
  }
}

function displayFlip(flip, index) {
  var html="";
  if (flip.archived === false){ //apply appropriate class
      if (flip.sellCompleted != "no")
      {
          html += "<div id=\"f" + index +"\" class=\"panel panel-success current\" >";
      }
      else //flip is still pending.
      {
          html += "<div id=\"f" + index +"\" class=\"panel panel-info current\" >";
      }
  }
  else if (flip.archived === true)
  {
  html += "<div id=\"f" + index +"\" class=\"panel panel-default archived\" >";
  }
  html += "<div class=\"panel-heading\">";
  html += "<h3 class=\"panel-title\">" + flip.itemName +" <button class=\"btn btn-xs btn-danger pull-right\" onClick=\"btnDelete('f"+index+"')\"><span class=\"glyphicon glyphicon-trash\"><\/span>";
  html+= "<span class=\"hidden-xs\">&nbsp; Delete Flip</span>";
  html += "<\/button><\/h3>";
  html += "<\/div>";
  html += "<div class=\"panel-body\">";

  if (flip.buyCompleted == "no") //If the buying is not done.
  {
  html += "<p>Status: Currently buying this item.</p>";

  html += "<button class=\"btn btn-block btn-warning btnApplyRuleBuy\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-repeat pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\">Apply Rule (Buy for +50k gp, time +30 min)</span>";
  html+= "<span class=\"visible-xs\">Apply Rule (+50k, +30 min)</span>";
  html += "<\/button>";

  html += "<button class=\"btn btn-block btn-success btnInb\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-fire pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\">Buying Complete, Instant Buy</span>";
  html+= "<span class=\"visible-xs\">Instant Buy</span>";
  html += "<\/button>";

  html += "<button class=\"btn btn-block btn-success btnNib\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-ok pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\">Buying Complete, Non-Instant Buy</span>";
  html+= "<span class=\"visible-xs\">Non-Instant Buy</span>";
  html += "<\/button>";
  }

  if (flip.buyCompleted != "no" && flip.sellCompleted == "no") //If the buying is done, but the selling is not.
  {
  html += "<p>Status: Buying completed, currently selling this item.</p>";
  if (getItemBuyLimit(flip.itemAbbreviation) != "Unknown")
  {
      html += "<p>You can use the autogenerated text below to report your flip in the Flipchat1 Friends Chat channel.</p>";
  }
  else
  {
      html += "<p>This doesn't appear to be an item that Flipchat1 price checks. You shouldn't report it in the Friends Chat channel.</p>";
  }

  html += "<label>Buying Report:</label><textfield class=\"form-control\" rows=\"1\" onclick=\"this.select()\">"+flip.itemAbbreviation + " " + flip.buyCompleted + " @ " + formatPrice(flip.buy);
  if (flip.buyTimesRuleApplied !== 0){
  html += " rx" + flip.buyTimesRuleApplied;
  }
  if (flip.buyCompleted == "nib")
  {
  html += " ?? minutes";
  }
  html += "</textfield><br>";

  html += "<button class=\"btn btn-block btn-warning btnApplyRuleSell\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-repeat pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\"> Apply Rule (Sell Price -50k, time +30min)</span>";
  html+= "<span class=\"visible-xs\">Apply Rule (-50k, +30 min)</span>";
  html += "<\/button>";

  html += "<button class=\"btn btn-block btn-success btnIns\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-fire pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\">Selling Complete, Instant Sell</span>";
  html+= "<span class=\"visible-xs\">Instant Sell</span>";
  html += "<\/button>";

  html += "<button class=\"btn btn-block btn-success btnNis\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-ok pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\">Selling Complete, Non-Instant Sell</span>";
  html+= "<span class=\"visible-xs\">Non-Instant Sell</span>";
  html += "<\/button>";
  }

  if (flip.sellCompleted != "no" && flip.archived === false) //If buying and selling is completed, but the flip isn't archived.
  {
  html += "<p>Status: Buying and selling completed!</p>";
  if (getItemBuyLimit(flip.itemAbbreviation) != "Unknown")
  {
      html += "<p>You can use the autogenerated text below to report your flip in the Flipchat1 Friends Chat channel.</p>";
  }
  else
  {
      html += "<p>This doesn't appear to be an item that Flipchat1 price checks. You shouldn't report it in the Friends Chat channel.</p>";
  }
  html += "<label>Buying Report:</label><textfield class=\"form-control\" rows=\"1\" onclick=\"this.select()\">"+flip.itemAbbreviation + " " + flip.buyCompleted + " @ " + formatPrice(flip.buy);
  if (flip.buyTimesRuleApplied !== 0){
  html += " rx" + flip.buyTimesRuleApplied;
  }
  if (flip.buyCompleted == "nib")
  {
  html += " ?? minutes";
  }
  html += "</textfield><br>";
  html += "<label>Selling Report:</label><textfield class=\"form-control\" rows=\"1\" onclick=\"this.select()\">"+flip.itemAbbreviation + " " + flip.sellCompleted + " @ " + formatPrice(flip.sell);
  if (flip.sellTimesRuleApplied !== 0){
  html += " rx" + flip.sellTimesRuleApplied;
  }
  if (flip.sellCompleted == "nis")
  {
  html += " ?? minutes";
  }
  html += "</textfield><br>";

  html += "<button class=\"btn btn-block btn-default btnArchive\" data-id=\"f" + index + "\"><span class=\"glyphicon glyphicon-floppy-disk pull-left\"><\/span>";
  html+= "<span class=\"hidden-xs\">Archive this Flip</span>";
  html+= "<span class=\"visible-xs\">Archive Flip</span>";
  html += "<\/button>";
  }

  if(flip.archived === true) //if the flip has been archived.
  {
  html += "<p>Status: Archived. (Buying and selling complete.)</p>";
  if (getItemBuyLimit(flip.itemAbbreviation) != "Unknown")
  {
      html += "<p>You can use the autogenerated text below to report your flip in the Flipchat1 Friends Chat channel.</p>";
  }
  else
  {
      html += "<p>This doesn't appear to be an item that Flipchat1 price checks. You shouldn't report it in the Friends Chat channel.</p>";
  }
  html += "<label>Buying Report:</label><textfield class=\"form-control\" rows=\"1\" onclick=\"this.select()\">"+flip.itemAbbreviation + " " + flip.buyCompleted + " @ " + formatPrice(flip.buy);
  if (flip.buyTimesRuleApplied !== 0){
  html += " rx" + flip.buyTimesRuleApplied;
  }
  if (flip.buyCompleted == "nib")
  {
  html += " ?? minutes";
  }
  html += "</textfield><br>";
  html += "<label>Selling Report:</label><textfield class=\"form-control\" rows=\"1\" onclick=\"this.select()\">"+flip.itemAbbreviation + " " + flip.sellCompleted + " @ " + formatPrice(flip.sell);
  if (flip.sellTimesRuleApplied !== 0){
  html += " rx" + flip.sellTimesRuleApplied;
  }
  if (flip.sellCompleted == "nis")
  {
  html += " ?? minutes";
  }
  html += "</textfield><br>";
  }

  html += "<\/div>";
  html += "<table class=\"table flipTable\">";
  html += "<tbody>";
  html += "<th scope=\"row\">Buying for<\/th>";
  html += "<td><div id=\"buyf"+index+"\">" + flip.buy + " gp</div><\/td>";
  html += "<td><button class=\"btn btn-xs btn-info btnBuyEdit pull-right\" data-id=\"f" + index + "\" type=\"button\"><span class=\"glyphicon glyphicon-pencil\"></span></button> <\/td>";

  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Selling for<\/th>";
  html += "<td>" + flip.sell + " gp<\/td>";
  html += "<td><button class=\"btn btn-xs btn-info btnSellEdit pull-right\" data-id=\"f" + index + "\" type=\"button\"><span class=\"glyphicon glyphicon-pencil\"></span></button> <\/td>";
  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Profit Per Item<\/th>";
  html += "<td>" + (flip.sell - flip.buy) + " gp<\/td>";
  html += "<td><\/td>";
  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Quantity<\/th>";
  html += "<td>" + flip.quantity + "<\/td>";
  html += "<td><button class=\"btn btn-xs btn-info btnQuantityEdit pull-right\" data-id=\"f" + index + "\" type=\"button\"><span class=\"glyphicon glyphicon-pencil\"></span></button> <\/td>";
  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Total Cost<\/th>";
  html += "<td>" + (flip.quantity * flip.buy)  + " gp<\/td>";
  html += "<td><\/td>";
  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Total Revenue<\/th>";
  html += "<td>" + (flip.quantity * flip.sell) + " gp<\/td>";
  html += "<td><\/td>";
  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Total Profit<\/th>";
  html += "<td>" + (flip.quantity * (flip.sell - flip.buy)) + " gp<\/td>";
  html += "<td><\/td>";
  html += "<\/tr>";
  html += "<tr>";
  html += "<th scope=\"row\">Timer<\/th>";
  html += "<td>";
  html += "<div id=\"timerDivf" + index + "\"><\/div>";
  html += "<\/td>";
  html += "<td><button class=\"btn btn-xs btn-info btnAdd30min pull-right\" data-id=\"f" + index + "\" type=\"button\"><span class=\"glyphicon glyphicon-plus-sign\"></span> 30 min</button><\/td>";
  html += "<\/tr>";
  html += "<\/tbody>";
  html += "<\/table>";
  html += "<\/div>";
  //helpful tool for making strings out of html like this: http://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/
  $("#flipsPanels").append(html);
  initializeTimer('timerDivf' + index, flip.timerEnd, flip.buyStartedTime);
}

// Timer related functions _______________________________________________
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes*60000);
}

//based on code here: http://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
function getTimeRemaining(endtime) {
var t = Date.parse(endtime) - Date.parse(new Date());
var seconds = Math.floor((t / 1000) % 60);
var minutes = Math.floor((t / 1000 / 60) % 60);
var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
var days = Math.floor(t / (1000 * 60 * 60 * 24));
return {
  'total': t,
  'days': days,
  'hours': hours,
  'minutes': minutes,
  'seconds': seconds
};
}

function getTimeElapsed(buyStartedTime) {
var t = Date.parse(new Date()) - Date.parse(buyStartedTime);
var seconds = Math.floor((t / 1000) % 60);
var minutes = Math.floor((t / 1000 / 60) % 60);
var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
var days = Math.floor(t / (1000 * 60 * 60 * 24));
return {
  'total': t,
  'days': days,
  'hours': hours,
  'minutes': minutes,
  'seconds': seconds
};
}

function initializeTimer(id, endtime, buyStartedTime) {
var timer = document.getElementById(id);

function updateTimer() {
    var t = getTimeRemaining(endtime);
    //console.log(t.total);
    //console.log(t.days);
    //console.log(t.hours);
    //console.log(t.minutes);
    //console.log(t.seconds);

    //build string for this timer.
    var timerString = ""
    if (t.days > 0){ //hides days if 0
      timerString += t.days;
      timerString += ":";
    }
    if (t.hours > 0){ //hides hours if 0
      timerString += ('0' + t.hours).slice(-2);
      timerString += ":";
    }

    timerString += ('0' + t.minutes).slice(-2);
    timerString += ":";
    timerString += ('0' + t.seconds).slice(-2);

    timer.innerHTML = timerString; //write timer

    if (t.total <= 0) {
        timerEnded(id);
    }
}

updateTimer(); //call once
var timerInterval = setInterval(updateTimer, 1000); //call repeating.

function timerEnded(id){
  clearInterval(timerInterval)
  console.log("The timer tied to " + id +" has ended.");
  timer.innerHTML = "DONE"

  //Start showing elapsed time since start.
  updateElapsed(); //call once
  var elapsedInterval = setInterval(updateElapsed, 1000); //call repeating.
}

function updateElapsed() {
    var t = getTimeElapsed(buyStartedTime);
    //console.log(t.total);
    //console.log(t.days);
    //console.log(t.hours);
    //console.log(t.minutes);
    //console.log(t.seconds);

    //build string for this timer.
    var timerString = ""
    if (t.days > 0){ //hides days if 0
      timerString += t.days;
      timerString += ":";
    }
    if (t.hours > 0){ //hides hours if 0
      timerString += ('0' + t.hours).slice(-2);
      timerString += ":";
    }
    timerString += ('0' + t.minutes).slice(-2);
    timerString += ":";
    timerString += ('0' + t.seconds).slice(-2);

    timer.innerHTML = "DONE (Total Elapsed " + timerString +")"; //write timer
}
}




//CLICK HANDLERS for every single flip's buttons.
function btnDelete(flipIndex){
  bootbox.dialog({
      closeButton: false,
      title: "Delete Flip",
      message: "Are you sure you wish to permanently delete this flip?",
      buttons: {
          btnAbort:{
              label: "No, cancel",
          },
          btnDelete:{
              label: "Yes, delete forever",
              className: "btn-danger",
              callback: callback
      }
      }
  });

  function  callback(){
      localStorage.removeItem("INVERT"+flipIndex);
      //clear old info, then write updated info
      $("#flipsPanels").html("");
      var flips = loadFlips();
      console.log(flips);
      var index = localStorage.getItem("INVERTindex");
      if (index !== null){
          for (var i=1; i <= index; i++){
              if (flips[i] !== null){ //skip if this flip has been deleted and has no info.
              displayFlip(flips[i], i); //otherwise display it.
              }
          }
      }
      toggleTabs(findCurrentTab());
      $.notify({message: "Flip deleted."},
               {type: "success",
               placement:
                  {align: "center"}
               });
  }
}

$("#flipsPanels").on("click",".btnApplyRuleBuy",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.buy = parseInt(thisflip.buy) + 50000;
  thisflip.timerDuration = parseInt(thisflip.timerDuration) + 30;
  thisflip.timerEnd = addMinutes(new Date(thisflip.timerEnd), 30);
  thisflip.buyTimesRuleApplied = thisflip.buyTimesRuleApplied + 1;
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Rule applied, and flip updated."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });


$("#flipsPanels").on("click",".btnInb",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.buyCompleted = "inb";
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Buying marked as an Instant Buy, flip updated."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });

$("#flipsPanels").on("click",".btnNib",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.buyCompleted = "nib";
  thisflip.buyCompletedTime = new Date();
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Buying marked as a Non-Instant Buy, flip updated."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });

$("#flipsPanels").on("click",".btnApplyRuleSell",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.buy = parseInt(thisflip.buy) - 50000;
  thisflip.timerDuration = parseInt(thisflip.timerDuration) + 30;
  thisflip.timerEnd = addMinutes(new Date(thisflip.timerEnd), 30);
  thisflip.sellTimesRuleApplied = thisflip.sellTimesRuleApplied + 1;
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Rule applied, and flip updated."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });

$("#flipsPanels").on("click",".btnIns",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.sellCompleted = "ins";
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Selling marked as an Instant Sell, flip updated."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });

$("#flipsPanels").on("click",".btnNis",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.sellCompleted = "nis";
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Selling marked as a Non-Instant Sell, flip updated."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });

$("#flipsPanels").on("click",".btnArchive",
  function(){
  //use the id to load the object for this flip.
  var thisflip = getFlipById($(this).data('id'));
  //update the values to what we want them to be.
  thisflip.archived = true;
  //stringify the object for storage inside of localStorage
  var stringFlip = JSON.stringify(thisflip);
  //write the flip back into localStorage
  storeFlipInfo(stringFlip, $(this).data('id').substr(1));

  toggleTabs(findCurrentTab());
  $.notify({message: "Flip archived."},
           {type: "success",
           placement:
              {align: "center"}
           });
  });

$("#flipsPanels").on("click",".btnBuyEdit",
  function(){
      var flipId = $(this).data('id');
      makeAreaEditable("buy", flipId);
      //Change the buy button into a save button.
      console.log(this);
      $(this).removeClass("btnBuyEdit");
      $(this).addClass("btnBuySave");
      $(this).html('<span class="glyphicon glyphicon-floppy-disk"></span>');
  });

$("#flipsPanels").on("click",".btnBuySave",
  function(){
      var flipId = $(this).data('id');
      saveEdit.call(this, "buy", flipId);
  });

function makeAreaEditable(type, flipId)
{
  var text = $("#"+type+flipId).html();
  text = stripNonNumeric(text);
  var editableArea = $("#"+type+flipId);
  editableArea.replaceWith('<input type=\"text\" class="form-control" id="'+type+flipId+'">'+text+'</input>');
}

//Function accepts a string and removes any character that is not a number.
//Note that it won't correctly convert negative numbers or decimals, since the "-", and "." will be removed.
function stripNonNumeric(text){
  text = text.replace(/\D/g,'');
  return text;
}

function saveEdit(type,flipId){
  var newValue = $("#"+type+flipId).text();
  console.log(this);
  //load the existing flip object from localStorage
  var thisFlip = JSON.parse(localStorage.getItem(flipId));
  if (type == "buy"){
    thisFlip.buy = newValue;
  }
  console.log(thisFlip.buy);
  localStorage.setItem(flipId,JSON.stringify(thisFlip));
  console.log(newValue + " written");



  //button.text("edit");
  //button.unbind('click');
  //button.bind('click',makeAreaEditable);
  //var targetArea = button.parent().find('textarea');
  //var textid = target.name;
  //targetArea.replaceWith("<li id='"+textid+"' style='list-style-type:none;'>"+text+"</li>");
}

$("#flipsPanels").on("click",".btnSellEdit",
  function(){
      console.log($(this).data('id'));
      console.log("sellEdit!");
  });

$("#flipsPanels").on("click",".btnQuantityEdit",
  function(){
      console.log($(this).data('id'));
      console.log("quantityEdit!");
  });

$("#flipsPanels").on("click",".btnAdd30min",
  function(){
      console.log($(this).data('id'));
      console.log("30min!");
  });

// END CLICK HANDLERS


//Functions to handle display of current/archived flips in tabs.
//Technically we just show/hide flips depending on the tab clicked
function tabClick(caller){
  event.preventDefault();
  toggleTabs(caller.id);
}

function findCurrentTab(){
  if ($("#current").hasClass("active")){
      return "current";
  }
  else if($("#all").hasClass("active")){
      return "all";
  }
  else if ($("#archived").hasClass("active")){
      return "archived";
  }
}

function toggleTabs(tabToToggle){
  $("#" + tabToToggle).toggleClass("active");

  if (tabToToggle == "current")
  {
      $("#current").toggleClass("active", true);
      $("#all").toggleClass("active", false);
      $("#archived").toggleClass("active", false);

      $(".current").toggle(true);
      $(".archived").toggle(false);
  }
  else if (tabToToggle == "all")
  {
      $("#current").toggleClass("active", false);
      $("#all").toggleClass("active", true);
      $("#archived").toggleClass("active", false);

      $(".current").toggle(true);
      $(".archived").toggle(true);
      $("span.archivedNotification").toggle(false);
      $("span.currentNotification").toggle(false);
  }
  else if (tabToToggle == "archived")
  {
      $("#current").toggleClass("active", false);
      $("#all").toggleClass("active", false);
      $("#archived").toggleClass("active", true);

      $(".current").toggle(false);
      $(".archived").toggle(true);
  }
}

//})(window);
