window.onload = function () {
  // Scales the image map with the map.svg file
  var ImageMap = function (map, img) {
    var n,
      areas = $('area'),
      len = areas.length,
      coords = [],
      previousWidth = 460.8;
    for (n = 0; n < len; n++) {
      coords[n] = areas[n].coords.split(',');
    }
    this.resize = function () {
      var n, m, clen,
        x = img.offsetWidth / previousWidth;
      for (n = 0; n < len; n++) {
        clen = coords[n].length;
        for (m = 0; m < clen; m++) {
          coords[n][m] *= x;
        }
        areas[n].coords = coords[n].join(',');
      }
      previousWidth = $('#map').width();
      return true;
      };
      window.onresize = this.resize;
    },
  imageMap = new ImageMap(document.getElementById('marker-map'), document.getElementById('map'));
  imageMap.resize();
  return;
}

function zip(arrays) {
  return arrays[0].map(function(_,i){
      return arrays.map(function(array){return array[i]})
  });
}

$('.dropdown-menu a.dropdown-toggle').on('click', function(e) {
    if (!$(this).next().hasClass('show')) { // idk
      $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
    }

    // When you click a drop down, it opens up it's associated menu.
    var $subMenu = $(this).next(".dropdown-menu");
    $subMenu.toggleClass('show');
  
    // But only show the next menu, not all menus after it.
    $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
      $('.dropdown-submenu .show').removeClass("show");
    });
    return false;
});

$('.modal-content').resizable({
  //alsoResize: ".modal-dialog",
  minHeight: 300,
  minWidth: 300
});
$('.modal-dialog').draggable();

$('#graphmodal').on('show.bs.modal', function () {
  $(this).find('.modal-body').css({
      'max-height':'100%'
  });
});


var long_stlats = { // l o n g boys
  "abd": "Abundance indices for fishery",
  "catch": "Total catches for fishery",
  "esc": "Spawning escapement for stock",
  "sim": "Incidental mortality for sub-legal sized chinook for fishery",
  "tim": "Total incidental mortality for fishery",
  "lim": "Incidental mmortality for legal sized chinook for fishery",
  "trm": "Terminal run for stock",
  "thr": "Total Exploitation Rate Statistics for stock",
  "ohr": "Ocean Exploitation Rate Statistics for stock",
  "stocks": "Total mortalities for stock & fishery"
}

let team_ids = {
  "sunbeams":     "f02aeae2-5e6a-4098-9842-02d2273f25c7",
  "tacos":        "878c1bf6-0d21-4659-bfee-916c8314d69c",
  "lovers":       "b72f3061-f573-40d7-832a-5ad475bd7909",
  "garages":      "105bc3ff-1320-4e37-8ef0-8d595cb95dd0",
  "magic":        "7966eb04-efcc-499b-8f03-d13916330531",
  "jazz":         "a37f9158-7f82-46bc-908c-c9e2dda7c33b",
  "mints":        "adc5b394-8f76-416d-9ce9-813706877b84",
  "spies":        "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5",
  "stakes":       "b024e975-1c4a-4575-8936-a3754a08806a",
  "wild":         "57ec08cc-0411-4643-b304-0e80dbc15ac7",
  "dale":         "b63be8c2-576a-4d6e-8daf-814f8bcea96f",
  "shoe":         "bfd38797-8404-4b38-8b82-341da28b1f83",
  "pies":         "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7",
  "crabs":        "8d87c468-699a-47a8-b40d-cfb73a5660ad",
  "millennials":  "36569151-a2fb-43c1-9df7-2df512424c82",
  "flowers":      "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e",
  "moist":        "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff",
  "tigers":       "747b8e4a-7e50-4638-a973-ea7950a3e739",
  "firefighters": "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16",
  "lift":         "c73b705c-40ad-4633-a6ed-d357ee2e2bcf",
  "fridays":      "979aee4a-6d80-4863-bf1c-ee1a78e06024"
}

var fishery_stats = ['abd','catch','lim','sim','tim'];
var stlat = "";

$(".graph-toggle").on('click',function(ev){
  stlat = $(ev.target).data('graph');

  // populate select
  $("#graphselect").empty();
  
  //console.log(Object.keys(sim_payload));

  if (fishery_stats.indexOf(stlat) >= 0) {
    // This sets up the in-graph drop down menu.
    sim_payload["fisheries"].forEach(function (f) {
      $("#graphselect").append("<option data-id=\"" + f["name"] + "\">"+f["name"]+"</option>");
    });
  } else {
    sim_payload["stocks"].forEach(function(f) {
      $("#graphselect").append("<option data-id=\"" + f["abbreviation"] + "\">"+f["name"]+"</option>");
    });
  }

  $("#graphmlabel").text(long_stlats[stlat]);
  //console.log($("#graphselect:first-child")[0][0].attributes["data-id"].nodeValue);
  render_stlat(stlat,$("#graphselect:first-child")[0][0].attributes["data-id"].nodeValue);

  // show modal
  $("#graphmodal").modal({backdrop:false,focus:false});
 // console.log($(ev.target).text());
  console.log("h-hewwo?");

  ev.stopPropagation();
  ev.stopImmediatePropagation();
});

$("#graphselect").change(function() {
  //console.log($("#graphselect option:selected")[0].attributes["data-id"].nodeValue);
  render_stlat(stlat,$("#graphselect option:selected")[0].attributes["data-id"].nodeValue);
});

function key_stats(s,key,chart) {
  chart.x = [];
  chart.y = [];
  //console.log(key);
  Object.keys(res[s][key]).forEach(function (k) {
    chart.x.push(k);
    chart.y.push(res[s][key][k]);
  });
}

// This is the variable that will become the Chart. It needs to be a global variable so old ones can be deleted. 
var chartDraw;

function render_stlat(stlat,key) {
  var chart = {
    x: [],
    y: []
  };
  var chart_opts;

  switch (stlat) {
    case "abd":
      axis = zip(res["abundances"][key]);
      chart.x = axis[0];
      chart.y = axis[1];
      break;
    case "stocks":
      data = {
        labels: [],
        datasets: []
      }

      Object.keys(res["stocks"][key]).forEach(function(k) {
        axis = zip(res["stocks"][key][k]);
        data.labels = axis[0];
        data.datasets.push({
          backgroundColor: fishery_colors[k],
          borderColor: fishery_colors[k],
          data: axis[1],
          fill: false,
          label: k
        });
      });

      chart_opts = {
        type: 'line',
        data: data,
        options: {
          legend: {
            display: true
          }
        }
      };
      break;
    default:
      key_stats(stlat,key,chart)
  }

  if (stlat != "stocks") {
    chart_opts = {
      type: 'line',
      data: {
          labels: chart.x,
          datasets: [{
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: chart.y,
            fill: false,
            label: 'fish'
          }]
      },
      options: {
        legend: {
          display: false
        }
      }
    };
  }

  var canvas = document.getElementById('salmon_graph');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // deletes the old chart so we don't flicker between all the previously opened charts
  if(chartDraw)
  {
    chartDraw.destroy();
  }

  chartDraw = new Chart(ctx, chart_opts);
}

/*
var element = document.querySelector('#map-container')
panzoom(element, {
  beforeWheel: function(e) {
    // allow wheel-zoom only if shift key is down. Otherwise - ignore
    var shouldIgnore = !e.shiftKey;
    return shouldIgnore;
  },
  bounds: true,
  boundsPadding: 0.6
});
*/

// Add labels to the image map areas. 
['ontouchstart','mouseenter'].forEach( evt => 
  $("area").on(evt, function(hoverEvent){
    let label = $('<div id="team-label">')
    .css({
      "left": hoverEvent.pageX + "px",
      "top":  hoverEvent.pageY + "px"
    })
    .append(document.createTextNode(this.alt))
    .appendTo(document.body);

    // Remove the labels when the mouse moves
    label = document.getElementById('team-label');
    $("#team-label").mouseleave(function(){
      $("#team-label").remove();
    });
    
    // Gives team info if the label's clicked.
    let team_id = team_ids[this.id];
    if(evt == 'mouseenter'){ evt = "click"; }
    $("#team-label").on(evt, function(){
      fetch('https://cors-proxy.blaseball-reference.com/database/team?id=' + team_id)
      .then(response => response.json())
      .then(json => {
        let all_players = "";
        for(let j = 0; j < json["lineup"].length; j++){
          all_players += json["lineup"][j] + ',';
        }
        for(let j = 0; j < json["rotation"].length; j++){
          all_players += json["rotation"][j] + ',';
        }
        let player_text = "<div class='player-list-header'>" + json["fullName"] + " Player Roster:</div><ul>" ;
        
        fetch('https://cors-proxy.blaseball-reference.com/database/players?ids=' + all_players)
        .then(response => response.json())
        .then(json => {
          for(let k = 0; k < json.length; k++){
            player_text += '<li>' + json[k]["name"] + '</li>';
          }
          let player_list = $('<div id="player-label">')
            .append(player_text)
            .appendTo(document.body);
            $("#player-label").on(evt, function(){
              $("#player-label").remove();
            })
        })
      })
    });
  })
);

// Removes labels / rosters when the screen is clicked or touched.
['click','ontouchstart'].forEach( evt => 
  $('body').on(evt, function(){
    if($('#player-label')){ $("#player-label").remove(); }
    if($('#team-label')){ $("#team-label").remove(); }
  })
);