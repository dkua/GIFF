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
  var blockBody = $("<div>", { class: "cell ui-body ui-body-d" });

  var button = $("<a href='#' data-role='button' data-mini='true'>");
  var btnGroup = $("<div>", { "data-role": "controlgroup", "data-type": "horizontal", "data-mini": "true" });

  getClips( function(total, clips) {
    $("#header").find("h1").text("GIFF (" + total + " Clips)");
    for (var i=0; i<total; i+=5) {
      tempArray = clips.slice(i, i+5);
      for (var k=0; k<tempArray.length; k++) {

        var clip = tempArray[k];
        var title = $("<p />").text(clip.title);
        var description = $("<p />").text(clip.description);
        var screenshot = $("<img />").attr({ src: clip.screenshot, alt: clip.title, cid: clip._id, onclick: "playClip(this)", "data-rel": 'popup' });
        var numVotes = getNumVotes(clip._id);
        var upvote = button.clone().attr({ id: "upvote", onclick: "upvote(this)", cid: clip._id, "data-icon": "arrow-u" }).text(numVotes.upvotes).button();
        var downvote = button.clone().attr({ id: "downvote", onclick: "downvote(this)", cid: clip._id, "data-icon": "arrow-d" }).text(numVotes.downvotes).button();
        if (numVotes.voted === 1) {
          upvote.addClass("ui-btn-active");
        } else if (numVotes.voted === -1) {
          downvote.addClass("ui-btn-active");
        }
        var buttons = btnGroup.clone().append(upvote, downvote).controlgroup();

        var body = blockBody.clone().attr({
          cid: clip._id 
        }).append(title, description, screenshot, buttons);
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
        var otherButton = button.parent().find("#downvote");
        button.addClass("ui-btn-active");
        otherButton.removeClass("ui-btn-active");
        button.find(".ui-btn-text").text(numVotes.upvotes);
        otherButton.find(".ui-btn-text").text(numVotes.downvotes);
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
        var otherButton = button.parent().find("#upvote");
        button.addClass("ui-btn-active");
        otherButton.removeClass("ui-btn-active");
        button.find(".ui-btn-text").text(numVotes.downvotes);
        otherButton.find(".ui-btn-text").text(numVotes.upvotes);
      }
      });
}

function getNumVotes(clicid) {
  var result = null;
  $.ajax({
    url: "clips/" + clicid + "/votes",
    type: "GET",
    dataType: "json",
    async: false,
    success: function(data) {
      result = data;
    } 
  });
  return result;
}

function playClip(caller) {
  console.log("VIDEO");
  var cid = $(caller).attr("cid");
  $('#player').empty();
  $('#player').append('<source src="http://videogami.s3.amazonaws.com/sportslive/' + cid + '.mp4" type="video/mp4">');
  $('#player').append('<source src="http://videogami.s3.amazonaws.com/sportslive/' + cid + '.webm" type="video/webm">');
  $("#player").load();
  $('#popUp').popup('open');
}

function scale( width, height, padding, border ) {
  var scrWidth = $( window ).width() - 30,
      scrHeight = $( window ).height() - 30,
      ifrPadding = 2 * padding,
      ifrBorder = 2 * border,
      ifrWidth = width + ifrPadding + ifrBorder,
      ifrHeight = height + ifrPadding + ifrBorder,
      h, w;

  if ( ifrWidth < scrWidth && ifrHeight < scrHeight ) {
    w = ifrWidth;
    h = ifrHeight;
  } else if ( ( ifrWidth / scrWidth ) > ( ifrHeight / scrHeight ) ) {
    w = scrWidth;
    h = ( scrWidth / ifrWidth ) * ifrHeight;
  } else {
    h = scrHeight;
    w = ( scrHeight / ifrHeight ) * ifrWidth;
  }

  return {
    'width': w - ( ifrPadding + ifrBorder ),
      'height': h - ( ifrPadding + ifrBorder )
  };
};
