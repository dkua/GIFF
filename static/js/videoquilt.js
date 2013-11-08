var grid = $("#grid");

var vgHost = "http://api.videogami.co/";
var vgUser = "vdgamers";
var vgToken = "7eb1d52ac16ae97b403b58f03b3301d14352e8d641b400a0";

function buildGrid() {
  var blockA = $("<div>", { class: "ui-block-a" });
  var blockB = $("<div>", { class: "ui-block-b" });
  var blockC = $("<div>", { class: "ui-block-c" });
  var blockD = $("<div>", { class: "ui-block-d" });
  var blockE = $("<div>", { class: "ui-block-e" });
  var blockList = [blockA, blockB, blockC, blockD, blockE];
  var blockBody = $("<div>", { class: "ui-body ui-body-d cell" });

  var button = $("<button />");

  getClips( function(total, clips) {
    for (var i=0; i<total; i+=5) {
      tempArray = clips.slice(i, i+5);
      for (var k=0; k<tempArray.length; k++) {

        var clip = tempArray[k];
        var title = $("<p />").text(clip.title);
        var description = $("<p />").text(clip.description);
        var screenshot = $("<img />").attr({ src: clip.screenshot, alt: clip.title });
        var numVotes = getNumVotes(clip._id);
        var upvote = button.clone().attr({ id: "upvote", onclick: "upvote(this)", cid: clip._id }).text("Upvote (" + numVotes.upvotes + ")");
        var downvote = button.clone().attr({ id: "downvote", onclick: "downvote(this)", cid: clip._id }).text("Downvote (" + numVotes.downvotes + ")");

        var body = blockBody.clone().attr({
          cid: clip._id 
        }).append(title).append(description).append(screenshot).append(upvote, downvote);
        var block = blockList[k].clone().append(body);
        grid.append(block);
      }
    }
  });
}

function getClips(fn) {
  var count;
  var clips = [];
  var total;

  var page = 0;
  $.ajaxSetup({ "async": false });
  while (true) {
    res = $.getJSON(vgHost + "clips", { username: vgUser, token: vgToken, page: page }).responseText;
    res = JSON.parse(res);
    count = res.count;
    clips = clips.concat(res.clips);
    total = res.total;

    if (count === 0) {
      break;
    } else {
      page += 1;
    }
  }
  $.ajaxSetup({ "async": true });
  console.log(total);
  fn(total, clips);
}

function upvote(caller) {
  var button = $(caller);
  var cid = button.attr("cid");
  console.log(cid);
  $.post("clips/" + cid + "/upvote", function(data) {
      console.log(data.success);
      if (data.success) {
        var numVotes = getNumVotes(cid);
        button.attr({ disabled: true }).text("Upvotes (" + numVotes.upvotes + ")");
        button.parent().find("#downvote").attr({ disabled: false }).text("Downvotes (" + numVotes.downvotes + ")");
      }
      });
}

function downvote(caller) {
  var button = $(caller);
  var cid = button.attr("cid");
  $.post("clips/" + cid + "/downvote", function(data) {
      console.log(data.success);
      if (data.success) {
        var numVotes = getNumVotes(cid);
        button.attr({ disabled: true }).text("Downvotes (" + numVotes.downvotes + ")");
        button.parent().find("#upvote").attr({ disabled: false }).text("Upvotes (" + numVotes.upvotes + ")");
      }
      });
}

function getNumVotes(clipID) {
  var result = null;
  $.ajax({
    url: "clips/" + clipID + "/votes",
    type: "GET",
    dataType: "json",
    async: false,
    success: function(data) {
      result = data;
    } 
  });
  return result;
}
