const urlGIS = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?$limit=3000";
const urlGeo = "http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson&$limit=3000"
const urlCrimesOpt = "https://data.cityofnewyork.us/resource/9s4h-37hy.json?$limit=3000"
const urlHouse = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?$limit=3000"
const urlGeoCr = "https://data.cityofnewyork.us/resource/9s4h-37hy.geojson?$where=cmplnt_fr_dt=%222015-12-31T00:00:00%22&$limit=3000"
const urlCrimes = "https://data.cityofnewyork.us/resource/qgea-i56i.json?$where=cmplnt_fr_dt=%222015-12-31T00:00:00%22&$limit=3000"

var map;
var jsonGIS;
var jsonGeo;
var jsonCrimes;
var jsonHouse;
var jsonGeoCr;
var nInput;

$(document).ready(function(){

  $.getJSON(urlGIS, function(dataOriginal){
    jsonGIS = dataOriginal;
    console.log('Gis');
    console.log(dataOriginal);
  })
  $.getJSON(urlGeo, function(dataOriginal){
    console.log('Geo');
    jsonGeo = dataOriginal;
    console.log(dataOriginal);
  })
  $.getJSON(urlCrimes, function(dataOriginal){
    console.log('Crimes');
    jsonCrimes = dataOriginal;
    console.log(dataOriginal);
  })
  $.getJSON(urlHouse, function(dataOriginal){
    console.log('housing');
    jsonHouse = dataOriginal;
    console.log(dataOriginal);
  })
  $.getJSON(urlGeoCr, function(dataOriginal){
    console.log('GeoCrimes');
    jsonGeoCr = dataOriginal;
    console.log(dataOriginal);
  })

    $(".button-collapse").sideNav();
    $("#displayDistrictButton").on("click", districtBorder);
    $("#displayCriminalButtonA").on("click", getNACrimes);
    $("#displayCriminalButtonVA").on("click", getNVACrimes);
    $("#displayCriminalButtonEA").on("click", getNEACrimes);
    $("#displayNeighborhoodCrimeData").on("click",neighborhoodCrimeData);
    $("#displayDistanceButton").on("click", getNDistance);
    $("#resetMap").on("click", resetMap);
    $("#displayNeighborhoodHousingData").on("click",neighborhoodHousingData);
    $("#displayNeighborhoodDistanceData").on("click",neighborhoodDistanceData);
    $("#displayAffordableButton").on("click", getNHousing);
    $("#tableDistrictButton").on("click", toExportBestTableToCSV);
    // $("#tableCriminalButton").on("click", updateCrimeTable);
    $("#tableCriminalButton").on("click", toExportCrimeTableToCSV);
    //$("#tableDistanceButton").on("click", updateDistanceTable);
    $("#tableDistanceButton").on("click", toExportDistanceTableToCSV);
    //$("#tableAffordableButton").on("click", updateHousingTable);
    $("#tableAffordableButton").on("click", toExportHousingTableToCSV);
    updateNeighborhoodTable();
    startWorking();
})

function startWorking(){
  var NYUStern = new google.maps.LatLng( 40.7291, -73.9965);
  var NYUStern2 = new google.maps.LatLng( 40.7291, -74.9965);
  var result = google.maps.geometry.spherical.computeDistanceBetween(NYUStern, NYUStern2);
  var districtArea = new google.maps.Polygon({paths:[NYUStern,NYUStern2]});
}

function toExportHousingTableToCSV(){
  exportTableToCSV('Affordable.csv',22,33);
}
function toExportDistanceTableToCSV(){
  exportTableToCSV('Distance.csv',0,11);
}
function toExportCrimeTableToCSV(){
  exportTableToCSV('Crime.csv',11,22);
}
function toExportBestTableToCSV(){
  exportTableToCSV('Best3.csv',33,37);
}

//start table export taken from: https://stackoverflow.com/questions/46826025/export-table-to-csv (this  is a modified version made by me)
function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToCSV(filename , inf, max) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = inf; i < max; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        csv.push(row.join(","));
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}
//end table export taken from https://stackoverflow.com/questions/46826025/export-table-to-csv (this  is a modified version made by me)

function nextTime(){
  alert('Feature Will Be Available In Upcoming Updates');
}

function updateDistanceTable() {
  tableR=$("#tableDistanceContent")[0]
  var newRow, position, district, distance,crimes;
  var NYUStern = new google.maps.LatLng( 40.7291, -73.9965);
  var distanceArr = [];
  var districtArr = [];
  var boroCdArr = [];
  var boroArr = [];
  var mutex = 0;

  $.getJSON(urlGeo, function(dataOriginal){
    for (var i = 0; i < dataOriginal.features.length; i++) {
      var polyArray = [];
      for (var k = 0; k < dataOriginal.features[i].geometry.coordinates[0].length; k++) {
        polyArray.push(new google.maps.LatLng(dataOriginal.features[i].geometry.coordinates[0][k][1],
        dataOriginal.features[i].geometry.coordinates[0][k][0]));
      }
      var districtArea = new google.maps.Polygon({paths:polyArray});
      var districtCenter = polygonCenter(districtArea);
      var distanceMiles = (google.maps.geometry.spherical.computeDistanceBetween(NYUStern, districtCenter)/1000).toFixed(2);
      if (distanceArr.length<10) {
        districtArr.push(districtCenter);
        distanceArr.push(distanceMiles);
      } else {
        for (var j = 0; j < distanceArr.length; j++) {
          if (distanceMiles<distanceArr[j]) {
            distanceArr[j] = distanceMiles;
            districtArr[j] = districtCenter;
            j = distanceArr.length;
          }
        }
      }
    }
    for (var i = 0; i < 10; i++) {
      var temp;
      for (var j = i; j < 10; j++) {
        if (distanceArr[j] < distanceArr[i]) {
          temp = distanceArr[j];
          distanceArr[j] = distanceArr[i];
          distanceArr[i] = temp;
          temp2 = districtArr[j];
          districtArr[j] = districtArr[i];
          districtArr[i] = temp2;
        }
      }
    }
    console.log("Dist F "+distanceArr);
    console.log("Distr F "+districtArr);
    for (var j = 0; j < distanceArr.length; j++) {
      for (var i = 0; i < dataOriginal.features.length; i++) {
        var polyArray = [];
        for (var k = 0; k < dataOriginal.features[i].geometry.coordinates[0].length; k++) {
          polyArray.push(new google.maps.LatLng(dataOriginal.features[i].geometry.coordinates[0][k][1],
            dataOriginal.features[i].geometry.coordinates[0][k][0]));
        }
        var districtArea = new google.maps.Polygon({paths:polyArray});
        if (google.maps.geometry.poly.containsLocation(districtArr[j], districtArea)) {
          boroCdArr.push(dataOriginal.features[i].properties.BoroCD);
          mutex++;
        }
      }
    }
    while (mutex!=10) {
    }
    console.log("boroArr "+boroCdArr);
      $.getJSON(urlGIS, function(dataOriginal2){
        for (var i = 0; i < 10; i++) {
          newRow = tableR.insertRow(tableR.rows.length)
          position = newRow.insertCell(0);
          district = newRow.insertCell(1);
          distance = newRow.insertCell(2);
          position.innerHTML = i+1;
          district.innerHTML = boroCdArr[i];
          distance.innerHTML = distanceArr[i];
        }
      })
  })
}

function updateCrimeTable() {
  tableR=$("#tableCrimeContent")[0]
  var newRow, position, district;
  var numCrimes = [];
  var districtArr = [];
  var boroCdArr = [];
  var boroArr = [];
  var mutex = 0;

  $.getJSON(urlGeo, function(dataOriginal){
      for (var i = 0; i < dataOriginal.features.length; i++) {
        var nCrimes = 0;
        for (var j = 0; j < jsonGeoCr.features.length; j++) {
          if (jsonGeoCr.features[j].geometry != null) {
            if (isInside(i,j)) {
              nCrimes++;
            }
          }
        }
        var polyArray = [];
        for (var k = 0; k < dataOriginal.features[i].geometry.coordinates[0].length; k++) {
          polyArray.push(new google.maps.LatLng(dataOriginal.features[i].geometry.coordinates[0][k][1],
          dataOriginal.features[i].geometry.coordinates[0][k][0]));
        }
        var districtArea = new google.maps.Polygon({paths:polyArray});
        var districtLoc = polygonCenter(districtArea);
        if (numCrimes.length<10) {
          numCrimes.push(nCrimes);
          districtArr.push(districtLoc);
        } else {
          if (!isNaN(districtLoc.lat())) {
            for (var m = 0; m < numCrimes.length; m++) {
              if (nCrimes<numCrimes[m]) {
                numCrimes[m] = nCrimes;
                districtArr[m] = districtLoc;
                m = numCrimes.length;
              }
            }
          }
        }
      }
      for (var l = 0; l < 10; l++) {
        var temp;
        for (var j = l; j < 10; j++) {
          if (numCrimes[l] > numCrimes[j]) {
            temp = numCrimes[j];
            numCrimes[j] = numCrimes[l];
            numCrimes[l] = temp;
            temp2 = districtArr[j];
            districtArr[j] = districtArr[l];
            districtArr[l] = temp2;
          }
        }
      }
      for (var j = 0; j < numCrimes.length; j++) {
        for (var l = 0; l < dataOriginal.features.length; l++) {
          var polyArray = [];
          for (var k = 0; k < dataOriginal.features[l].geometry.coordinates[0].length; k++) {
            polyArray.push(new google.maps.LatLng(dataOriginal.features[l].geometry.coordinates[0][k][1],
              dataOriginal.features[l].geometry.coordinates[0][k][0]));
          }
          var districtArea = new google.maps.Polygon({paths:polyArray});
          if (google.maps.geometry.poly.containsLocation(districtArr[j], districtArea)) {
            boroCdArr.push(dataOriginal.features[l].properties.BoroCD);
            mutex++;
          }
        }
      }
      while (mutex!=10) {
      }
        $.getJSON(urlGIS, function(dataOriginal2){
          for (var l = 0; l < 10; l++) {
            newRow = tableR.insertRow(tableR.rows.length)
            position = newRow.insertCell(0);
            district = newRow.insertCell(1);
            crimes = newRow.insertCell(2);
            position.innerHTML = l+1;
            district.innerHTML = boroCdArr[l];
            crimes.innerHTML = numCrimes[l];
          }
        })
  })
}

function updateHousingTable() {
  tableR=$("#tableHousingContent")[0]
  var newRow, position, district;
  var numELIncome = [];
  var districtArr = [];
  var boroCdArr = [];
  var boroArr = [];
  var mutex = 0;

  $.getJSON(urlGeo, function(dataOriginal){
    var ELIncome = 0;
    for (var i = 0; i < dataOriginal.features.length; i++) {
      ELIncome = Number(0);
      for (var j = 0; j < jsonHouse.data.length; j++) {
        if (jsonHouse.data[j][23] != null) {
          if (isInsideHousing(i,j)) {
            ELIncome = Number(ELIncome) + Number(jsonHouse.data[j][31]);
          }
        }
      }
        var polyArray = [];
        for (var k = 0; k < dataOriginal.features[i].geometry.coordinates[0].length; k++) {
          polyArray.push(new google.maps.LatLng(dataOriginal.features[i].geometry.coordinates[0][k][1],
          dataOriginal.features[i].geometry.coordinates[0][k][0]));
        }
        var districtArea = new google.maps.Polygon({paths:polyArray});
        var districtLoc = polygonCenter(districtArea);
        if (numELIncome.length<10) {
          numELIncome.push(ELIncome);
          districtArr.push(districtLoc);
        } else {
          if (!isNaN(districtLoc.lat())) {
            for (var m = 0; m < numELIncome.length; m++) {
              if (ELIncome>numELIncome[m]) {
                numELIncome[m] = ELIncome;
                districtArr[m] = districtLoc;
                m = numELIncome.length;
              }
            }
          }
        }
      }
      for (var l = 0; l < 10; l++) {
        var temp;
        for (var j = l; j < 10; j++) {
          if (numELIncome[l] < numELIncome[j]) {
            temp = numELIncome[j];
            numELIncome[j] = numELIncome[l];
            numELIncome[l] = temp;
            temp2 = districtArr[j];
            districtArr[j] = districtArr[l];
            districtArr[l] = temp2;
          }
        }
      }
      for (var j = 0; j < numELIncome.length; j++) {
        for (var l = 0; l < dataOriginal.features.length; l++) {
          var polyArray = [];
          for (var k = 0; k < dataOriginal.features[l].geometry.coordinates[0].length; k++) {
            polyArray.push(new google.maps.LatLng(dataOriginal.features[l].geometry.coordinates[0][k][1],
              dataOriginal.features[l].geometry.coordinates[0][k][0]));
          }
          var districtArea = new google.maps.Polygon({paths:polyArray});
          if (google.maps.geometry.poly.containsLocation(districtArr[j], districtArea)) {
            boroCdArr.push(dataOriginal.features[l].properties.BoroCD);
            mutex++;
          }
        }
      }
      while (mutex!=10) {
      }
        $.getJSON(urlGIS, function(dataOriginal2){
          for (var l = 0; l < 10; l++) {
            newRow = tableR.insertRow(tableR.rows.length)
            position = newRow.insertCell(0);
            district = newRow.insertCell(1);
            crimes = newRow.insertCell(2);
            position.innerHTML = l+1;
            district.innerHTML = boroCdArr[l];
            crimes.innerHTML = numELIncome[l];
          }
        })
  })
}


function updateNeighborhoodTable(){
  tableR=$("#tableContent")[0]
  var newRow, borough, district;
  $.getJSON(urlGIS, function(dataOriginal){
    for (var i = 0; i < dataOriginal.data.length; i++) {
      newRow = tableR.insertRow(tableR.rows.length)
      district = newRow.insertCell(0);
      borough = newRow.insertCell(1);
      borough.innerHTML = dataOriginal.data[i][10]
      district.innerHTML = dataOriginal.data[i][dataOriginal.data[i].length-1]
    }
  })
}


function neighborhoodCrimeData(){

  var input, filter, table, tr, td, i;
  var svg = null;
  input = document.getElementById("neighborhoodInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("neighborhoodTable");
  tr = table.getElementsByTagName("tr");
  var useInput;
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        useInput = td.innerHTML;
      }
    }
  }
  var links = [];
  for (var i = 0; i < jsonGIS.data.length; i++) {
    if (jsonGIS.data[i][10]==useInput) {
      var point = jsonGIS.data[i][9];
      var pointArray = point.split("(");
      var subArr = pointArray[1].split(" ");
      var lng = subArr[0];
      var subArr2=subArr[1].split(")");
      var lat = subArr2[0];
      var location = new google.maps.LatLng(lat,lng);

      for (var j = 0; j < jsonGeo.features.length; j++) {
        var polyArray = [];
        for (var k = 0; k < jsonGeo.features[j].geometry.coordinates[0].length; k++) {
          polyArray.push(new google.maps.LatLng(jsonGeo.features[j].geometry.coordinates[0][k][1],
            jsonGeo.features[j].geometry.coordinates[0][k][0]));
        }
        var districtArea = new google.maps.Polygon({paths:polyArray});
        if (google.maps.geometry.poly.containsLocation(location, districtArea)) {
          for (var l = 0; l< jsonGeoCr.features.length; l++) {
            if (jsonGeoCr.features[l].geometry != null) {
              var maker = new google.maps.LatLng(jsonGeoCr.features[l].geometry.coordinates[1],
                 jsonGeoCr.features[l].geometry.coordinates[0]);
              if (google.maps.geometry.poly.containsLocation(maker, districtArea)) {
                links.push({source:useInput, target:jsonGeoCr.features[l].properties.ofns_desc, type: "suit"});
              }
            }
          }
        }
      }
      $('#tableLimit').after('<h4 class="center">'+useInput+" "+"Criminal Representation"+'</h4>');
      break;
    }
  }

  // Start arrow diagram taken from: http://bl.ocks.org/mbostock/1153292
  var nodes = {};

  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });

  var width = 960,
      height = 500;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(150)
      .charge(-300)
      .on("tick", tick)
      .start();

  svg = d3.select("div.d3maparrow").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", 6)
      .call(force.drag);

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { return d.name; });

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }

  // End arrow diagram taken from: http://bl.ocks.org/mbostock/1153292
}

function neighborhoodHousingData(){
  var input, filter, table, tr, td, i;
  input = document.getElementById("neighborhoodInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("neighborhoodTable");
  tr = table.getElementsByTagName("tr");
  var useInput;
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        useInput = td.innerHTML;
      }
    }
  }
  var links = [];
  for (var i = 0; i < jsonGIS.data.length; i++) {
    if (jsonGIS.data[i][10]==useInput) {
      var point = jsonGIS.data[i][9];
      var pointArray = point.split("(");
      var subArr = pointArray[1].split(" ");
      var lng = subArr[0];
      var subArr2=subArr[1].split(")");
      var lat = subArr2[0];
      var location = new google.maps.LatLng(lat,lng);

      for (var j = 0; j < jsonGeo.features.length; j++) {
        var polyArray = [];
        for (var k = 0; k < jsonGeo.features[j].geometry.coordinates[0].length; k++) {
          polyArray.push(new google.maps.LatLng(jsonGeo.features[j].geometry.coordinates[0][k][1],
            jsonGeo.features[j].geometry.coordinates[0][k][0]));
        }
        var districtArea = new google.maps.Polygon({paths:polyArray});
        if (google.maps.geometry.poly.containsLocation(location, districtArea)) {
          for (var l = 0; l< jsonHouse.data.length; l++) {
            if (jsonHouse.data[l][23]!=null && jsonHouse.data[l][9]!=null) {
              var maker = new google.maps.LatLng(jsonHouse.data[l][23], jsonHouse.data[l][24]);
              if (google.maps.geometry.poly.containsLocation(maker, districtArea)) {
                if (jsonHouse.data[l][31]==0) {
                  links.push({source:useInput, target:jsonHouse.data[l][9]+" "+"Not affordable", type: "suit"});
                } else {
                  links.push({source:useInput, target:jsonHouse.data[l][9]+" "+"Affordable", type: "suit"});
                }
              }
            }
          }
        }
      }
      $('#tableLimit').after('<h4 class="center">'+useInput+" "+"Affordability Representation"+'</h4>');
      break;
    }
  }

  // Start arrow diagram taken from: http://bl.ocks.org/mbostock/1153292
  var nodes = {};

  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });

  var width = 960,
      height = 500;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(150)
      .charge(-300)
      .on("tick", tick)
      .start();

  var svg = d3.select("div.d3maparrow").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", 6)
      .call(force.drag);

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { return d.name; });

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }

  // End arrow diagram taken from: http://bl.ocks.org/mbostock/1153292
}

function neighborhoodDistanceData(){
  var input, filter, table, tr, td, i;
  input = document.getElementById("neighborhoodInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("neighborhoodTable");
  tr = table.getElementsByTagName("tr");
  var useInput;
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        useInput = td.innerHTML;
      }
    }
  }

  for (var i = 0; i < jsonGIS.data.length; i++) {
    if (jsonGIS.data[i][10]==useInput) {
      var point = jsonGIS.data[i][9];
      var pointArray = point.split("(");
      var subArr = pointArray[1].split(" ");
      var lng = subArr[0];
      var subArr2=subArr[1].split(")");
      var lat = subArr2[0];
      var location = new google.maps.LatLng(lat,lng);
      var NYUStern = new google.maps.LatLng( 40.7291, -73.9965);
      var dist = google.maps.geometry.spherical.computeDistanceBetween(location, NYUStern);
      $('#tableLimit').after('<h4 class="center card blue-grey">'+""+(dist/1000).toFixed(1)+" Km "+"Distance From "+useInput+" to NYU Stern School"+'</h4>');
      break;
    }
  }

}

function neighborhoodInputFunction() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("neighborhoodInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("neighborhoodTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Google Maps

function onGoogleMapResponse(){
  var NYUStern = {lat: 40.7291, lng: -73.9965};
  map = new google.maps.Map(document.getElementById('googleMapDisplay'), {
    zoom: 12,
    center: NYUStern
  });
}

function addStdMarker(coordinates){
  var marker = new google.maps.Marker({
    position: coordinates,
    map: map,
  });
  marker.setMap(map);
}

function resetMap(){
  var NYUStern = {lat: 40.7291, lng: -73.9965};
  map = new google.maps.Map(document.getElementById('googleMapDisplay'), {
    zoom: 12,
    center: NYUStern
  });
}
// Function polygonCenter taken from : https://gist.github.com/jeremejazz/9407568
 function polygonCenter(poly) {
    var lowx,
        highx,
        lowy,
        highy,
        lats = [],
        lngs = [],
        vertices = poly.getPath();
    for(var i=0; i<vertices.length; i++) {
      lngs.push(vertices.getAt(i).lng());
      lats.push(vertices.getAt(i).lat());
    }
    lats.sort();
    lngs.sort();
    lowx = lats[0];
    highx = lats[vertices.length - 1];
    lowy = lngs[0];
    highy = lngs[vertices.length - 1];
    center_x = lowx + ((highx-lowx) / 2);
    center_y = lowy + ((highy - lowy) / 2);
    return (new google.maps.LatLng(center_x, center_y));
  }
// End of polygonCenter

function districtBorder(){
  alert("Purple = Manhattan, Light grey = Bronx, Black = Brooklyn, Red = Queens, Blue = Staten Island, Green = Not for Living");
  map = new google.maps.Map(document.getElementById('googleMapDisplay'), {
    zoom: 12,
    center: {lat: 40.7291, lng: -73.9965}
  });
        map.setZoom(10);
        map.data.loadGeoJson(urlGeo);
        map.data.setStyle(function(feature){
          var color = 'green';
          for (var i = 100; i < 505; i++) {
            if (feature.getProperty('BoroCD')==i && i>100 && i<119) { //manhattan mn-..
              color='purple';
            } if (feature.getProperty('BoroCD')==i && i>200 && i<213) { //bronx bx-..213
              color='#607d8b';
            } if (feature.getProperty('BoroCD')==i && i>300 && i<319) {//brooklyn bk-..319
              color='black';
            }if (feature.getProperty('BoroCD')==i && i>400 && i<415) {//queens qn-..
              color='red';
            }if (feature.getProperty('BoroCD')==i && i>500 && i<504) {//state island si-..
              color = '#01579b';
            }
          }
          return ({
              fillColor:color
          });
        })

}

// Criminal Functions

 function getNACrimes(){
   map.setZoom(10);
   alert("Black: Run the heck out!, Red: Dangerous, Orange: A little Dangerous, Green: Safe! (Click Again The Option if you only clicked once)")
   var nCrimes = 0;
   for (var i = 0; i < jsonGeo.features.length; i++) {
     for (var j = 0; j < 250; j++) { //jsonGeoCr.features.length
       if (jsonGeoCr.features[j].geometry != null) {
         if (isInside(i,j)) {
           nCrimes++;
         }
       }
     }
     var polyArray = [];
     for (var k = 0; k < jsonGeo.features[i].geometry.coordinates[0].length; k++) {
       polyArray.push(new google.maps.LatLng(jsonGeo.features[i].geometry.coordinates[0][k][1],
         jsonGeo.features[i].geometry.coordinates[0][k][0]));
     }
     var districtArea = new google.maps.Polygon({paths:polyArray});
     addMarker(polygonCenter(districtArea),nCrimes);
   }
 }

 function getNVACrimes(){
   map.setZoom(11);
   alert("Black: Run the heck out!, Red: Dangerous, Orange: A little Dangerous, Green: Safe! (Click Again The Option if you only clicked once)")
   var nCrimes = 0;
   for (var i = 0; i < jsonGeo.features.length; i++) {
     for (var j = 0; j < 500; j++) { //jsonGeoCr.features.length
       if (jsonGeoCr.features[j].geometry != null) {
         if (isInside(i,j)) {
           nCrimes++;
         }
       }
     }
     var polyArray = [];
     for (var k = 0; k < jsonGeo.features[i].geometry.coordinates[0].length; k++) {
       polyArray.push(new google.maps.LatLng(jsonGeo.features[i].geometry.coordinates[0][k][1],
         jsonGeo.features[i].geometry.coordinates[0][k][0]));
     }
     var districtArea = new google.maps.Polygon({paths:polyArray});
     addMarker(polygonCenter(districtArea),nCrimes);
   }
 }

 function getNEACrimes(){
   resetMap();
   map.setZoom(11);
   alert("Black: Run the heck out!, Red: Dangerous, Orange: A little Dangerous, Green: Safe! (Click Again The Option if you only clicked once)")
   var nCrimes = 0;
   for (var i = 0; i < jsonGeo.features.length; i++) {
     for (var j = 0; j < jsonGeoCr.features.length; j++) { //jsonGeoCr.features.length
       if (jsonGeoCr.features[j].geometry != null) {
         if (isInside(i,j)) {
           nCrimes++;
         }
       }
     }
     var polyArray = [];
     for (var k = 0; k < jsonGeo.features[i].geometry.coordinates[0].length; k++) {
       polyArray.push(new google.maps.LatLng(jsonGeo.features[i].geometry.coordinates[0][k][1],
         jsonGeo.features[i].geometry.coordinates[0][k][0]));
     }
     var districtArea = new google.maps.Polygon({paths:polyArray});
     addMarker(polygonCenter(districtArea),nCrimes);
   }
 }

 function getCircle(nCrimes) {
   if (nCrimes>500) {
     return {
       path: google.maps.SymbolPath.CIRCLE,
       fillColor: '#212121',
       fillOpacity: nCrimes/800,
       scale: nCrimes/32,
       strokeColor: 'black',
       strokeWeight: .7
     };
   } else if (nCrimes>200 && nCrimes<=500) {
     return {
       path: google.maps.SymbolPath.CIRCLE,
       fillColor: 'red',
       fillOpacity: nCrimes/500,
       scale: nCrimes/22,
       strokeColor: 'black',
       strokeWeight: .5
     };
   } else if (nCrimes>75 && nCrimes<=200) {
     return {
       path: google.maps.SymbolPath.CIRCLE,
       fillColor: 'orange',
       fillOpacity: nCrimes/270,
       scale: nCrimes/10,
       strokeColor: 'black',
       strokeWeight: .5
     };
   } else {
     return {
       path: google.maps.SymbolPath.CIRCLE,
       fillColor: 'green',
       fillOpacity: nCrimes/120,
       scale: nCrimes/3,
       strokeColor: 'white',
       strokeWeight: .5
     };
   }
 }

 function isInside(i,j){
   var polyArray = [];
   for (var k = 0; k < jsonGeo.features[i].geometry.coordinates[0].length; k++) {
     polyArray.push(new google.maps.LatLng(jsonGeo.features[i].geometry.coordinates[0][k][1],
       jsonGeo.features[i].geometry.coordinates[0][k][0]));
   }
   var areaAllowed = new google.maps.Polygon({paths:polyArray});
   var maker = new google.maps.LatLng(jsonGeoCr.features[j].geometry.coordinates[1],
      jsonGeoCr.features[j].geometry.coordinates[0]);
   return google.maps.geometry.poly.containsLocation(maker, areaAllowed);
 }

 function addMarker(coordinates ,nCrimes){
   var marker = new google.maps.Marker({
     position: coordinates,
     map: map,
     icon: getCircle(nCrimes)
   });
   marker.setMap(map);
 }

// End of Criminal Functions

//Distance Functions

  function getNDistance(){
    var NYUStern = new google.maps.LatLng( 40.7291, -73.9965);
    var distance = 0;
    alert("Click At Any White Section of the Map to Know the Distance From The NYU Stern School.")
    map = new google.maps.Map(document.getElementById('googleMapDisplay'), {
      zoom: 12,
      center: {lat: 40.7291, lng: -73.9965}
    });
    map.setZoom(12);
    map.data.loadGeoJson(urlGeo);
    map.data.setStyle({
      fillColor:'#e0e0e0',
      strokeWeight: 1
    });
    addStdMarker(NYUStern);
    google.maps.event.addListener(map.data, 'click', function (event) {
      addDistanceMarker(event.latLng, NYUStern);
    });
  }

  function addDistanceMarker(coordinates, initMark){
    var distanceMiles = google.maps.geometry.spherical.computeDistanceBetween(initMark, coordinates);
    var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
      icon: getDistCircle(),
      label: ""+(distanceMiles/1000).toFixed(1)+"Km"
    });
    marker.setMap(map);
  }

  function getDistCircle() {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'white',
        fillOpacity: 1,
        scale: 25,
        strokeColor: 'black',
        strokeWeight: .5
      };
  }


//End of Distance Functions

//Housing Functions

function addHousingMarker(coordinates, ElIncome){
  var marker = new google.maps.Marker({
    position: coordinates,
    map: map,
    icon: getHousingCircle(ElIncome),
    //label: ""+ElIncome+""
  });
  //console.log(marker);
  marker.setMap(map);
}

function getNHousing(){
  var NYUStern = new google.maps.LatLng( 40.7291, -73.9965);
  var ELIncome = 0;
  alert("Black: Not Affordable at All!, Red: Not Very Affordable, Orange: Somewhat Affordable, Yellow: Affordable, Green: Very Affordable (Click Again The Button if you only clicked once)")
  for (var i = 0; i < jsonGeo.features.length; i++) {
    ELIncome = Number(0);
    for (var j = 0; j < jsonHouse.data.length; j++) { //jsonGeoCr.features.length
      if (jsonHouse.data[j][23] != null) {
        if (isInsideHousing(i,j)) {
          ELIncome = Number(ELIncome) + Number(jsonHouse.data[j][31]);
        }
      }
    }
    var polyArray = [];
    for (var k = 0; k < jsonGeo.features[i].geometry.coordinates[0].length; k++) {
      polyArray.push(new google.maps.LatLng(jsonGeo.features[i].geometry.coordinates[0][k][1],
        jsonGeo.features[i].geometry.coordinates[0][k][0]));
    }
    var districtArea = new google.maps.Polygon({paths:polyArray});
    addHousingMarker(polygonCenter(districtArea), ELIncome);
  }
  map.setZoom(11);
  map.data.loadGeoJson(urlGeo);
  map.data.setStyle({
    fillColor:'#e0e0e0',
    strokeWeight: 1
  });
}

function getHousingCircle(ELIncome) {
    if (ELIncome>900) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'green',
        fillOpacity: ELIncome/1300,
        scale: ELIncome/70,
        strokeColor: 'black',
        strokeWeight: .5
      };
    } else if (ELIncome>=900 && ELIncome<300) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'green',
        fillOpacity: ELIncome/1000,
        scale: ELIncome/50,
        strokeColor: 'black',
        strokeWeight: .5
      };
    } else if (ELIncome<=300 && ELIncome>150) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'yellow',
        fillOpacity: ELIncome/500,
        scale: ELIncome/13,
        strokeColor: 'black',
        strokeWeight: .5
      };
    } else if (ELIncome<=150 && ELIncome>75) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'orange',
        fillOpacity: ELIncome/200,
        scale: 17,
        strokeColor: 'black',
        strokeWeight: .5
      };
    } else if (ELIncome<=75 && ELIncome>37) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: ELIncome/100,
        scale: 16,
        strokeColor: 'black',
        strokeWeight: .5
      };
    } else {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'black',
        fillOpacity: 0.7,
        scale: 15,
        strokeColor: 'black',
        strokeWeight: .5
      };
    }

}

function isInsideHousing(i,j){
  var polyArray = [];
  for (var k = 0; k < jsonGeo.features[i].geometry.coordinates[0].length; k++) {
    polyArray.push(new google.maps.LatLng(jsonGeo.features[i].geometry.coordinates[0][k][1],
      jsonGeo.features[i].geometry.coordinates[0][k][0]));
  }
  var areaAllowed = new google.maps.Polygon({paths:polyArray});
  var maker = new google.maps.LatLng(jsonHouse.data[j][23], jsonHouse.data[j][24]);
  return google.maps.geometry.poly.containsLocation(maker, areaAllowed);
}

//End of Housing Functions
