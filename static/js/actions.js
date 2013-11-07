
var windowwidth = $(window).width();
var clips_list=[];
var videos_list=[];
var clips_total_page=0;
var videos_total_page=0;
var clips_per_page=0;
var video_per_page=0;
var num_columns=1;

$(window).resize(function() {
    windowwidth = $(window).width();
    build_grid();

    });

function load_videos(page_num)
{
  $.getJSON("http://api.videogami.co/videos",{username:"vdgamers", token:"7eb1d52ac16ae97b403b58f03b3301d14352e8d641b400a0", page:page_num}, function(result){
      videos_list[page_num] = result;
      if (result.page == 0)
      {
      video_per_page=result.count;
      videos_total_page=Math.floor(result.total/clips_per_page);
      }
      if (result.page == videos_total_page)
      {
      build_grid();
      }
      else
      {
      load_clips(page_num + 1);
      }
      }).fail(function(){alert("Fail");});
}

function load_clips(page_num)
{
  $.getJSON("http://api.videogami.co/clips",{username:"vdgamers", token:"7eb1d52ac16ae97b403b58f03b3301d14352e8d641b400a0", page:page_num}, function(result){
      clips_list[page_num] = result;
      if (result.page == 0)
      {
      clips_per_page=result.count;
      clips_total_page=Math.floor(result.total/clips_per_page);
      }
      if (result.page == clips_total_page)
      {
      build_grid();
      }
      else
      {
      load_clips(page_num + 1);
      }
      }).fail(function(){alert("Fail");});
}

function build_grid()
{
  var row = "";

  var column_name = ["-a", "-a", "-b", "-c", "-d", "-e"];
  if (num_columns != Math.floor(windowwidth  / gif_width))
    num_columns = Math.floor(windowwidth  / gif_width);
  else
  {
    return;
  }
  if (num_columns > 5) num_columns = 5;
  if (num_columns < 1) num_columns = 1;

  var num_rows = Math.ceil(clips_per_page / num_columns);
  $("#clips").empty();
  if (num_columns == 1)
  {
    $("#clips").append('<div id="clips_grid">\n</div>');
    for (var j=0; j<=clips_total_page; j++)
    {
      for (var i=0; i<clips_list[j].clips.length; i++) {
        $("#clips_grid").append('<div id="' + clips_list[j].clips[i]._id + '" onclick=div_click(this)><img class="clip" width="' + gif_width + '" style="max-height:' + gif_height + 'px" src="'+ clips_list[j].clips[i].gifs.fast + '"></img>\n</div>\n');
      }
    }

  }
  else
  {
    $("#clips").append('<div id="clips_grid" class="ui-grid' + column_name[num_columns - 1] + '">\n</div>');
    for (var j=0; j<=clips_total_page; j++)
    {
      for (var i=0; i<clips_list[j].clips.length; i++) {
        $("#clips_grid").append('<div class="ui-block' + column_name[(i % num_columns) + 1] + '" id="' + clips_list[j].clips[i]._id + '" onclick=div_click(this)><img width="' + gif_width + '" style="max-height:' + gif_height + 'px" src="'+ clips_list[j].clips[i].gifs.fast + '"></img>\n</div>\n');
      }
    }
  }
}



</script>
</head>

<body>
<div id="container">
  <div id="clips" align="center">
    <div>Grid should be here.</div>
  </div>

  <script>
var gif_width = 256; //width of each gif
var gif_height = 144;//height of each gif

function div_click(ele)
{
  var clipId = $(ele).attr("id");
  var pid;

  $.each(clips_list, function(i, page){
      $.each(page.clips, function(n, item){
        if (clipId == item._id){
        pid = item.parent.pID;
        }
        }				
        );	
      });

  $('#player').empty();
  $('#player').append('<source src="http://videogami.s3.amazonaws.com/sportslive/' + pid + '.mp4">');

  $('#player').append('<source src="http://videogami.s3.amazonaws.com/sportslive/' + pid + '.webm">');
  $("#player").load();
  $('#popUp').popup('open');
}

$(document).ready(function(){
    load_clips(0);
    load_videos(0);
    });


