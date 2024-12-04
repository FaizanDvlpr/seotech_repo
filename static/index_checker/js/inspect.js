const $table = $('#table');

const APIKEY = 'AIzaSyDmjNLyjkyMbDDMnJauROSZh6MQLKPaRVg';
const CLIENTID = '436218233575-ab5m6eq2pi4nucat33qomtbsv7md7euk.apps.googleusercontent.com';

let siteOptionTemplate = Handlebars.compile(document.getElementById("siteOptionTemplate").innerHTML);

let urls = [];
let urlsDone = [];
let siteUrl = '';
let percent = 0;
let running = 0;
const concurrency = 40;

const queue = [];
function rateLimit(fn) {
  queue.push(fn)
}
setInterval(() => {
  if (running < concurrency) {
    const nextFn = queue.shift(); // remove the first function, and return it.
    if (nextFn) {
      nextFn() // execute the first function if it exists.
      running++;
    }
  }
}, 200) // Your interval in milliseconds.

function linkUrl(index, row) {
  return `<a href="${row.inspectedUrl}" target="_blank">${row.inspectedUrl}</a>`;
}

let tableData = [];
function loadTable() {
  $table.bootstrapTable('destroy');
  $table.bootstrapTable({
    data: tableData,
    exportTypes: ['csv', 'xlsx']
  });
}

function init() {
  gapi.load("client:auth2", function() {
    gapi.auth2.init({
      client_id: CLIENTID
    });
  });

  loadTable();
  $('#authBtn').on('click', function() {
    authenticate().then(loadClient);
  });

  $('#urlsBtn').on('click', function() {
    urls = $('#urlsInput').val().trim().split('\n').filter(function(i){return i});
    tableData = [];
    $('#progress').removeClass("hidden");
    urls.forEach((item) => {
      rateLimit(() => inspectURL(item));
    });

  });
}

function authSuccess() {
  $('#authBtn').removeClass("btn-primary btn-success btn-danger");
  $('#authBtn').addClass("btn-success");
  $('#authBtn').prop('disabled','disabled');

  $('#urlsBtn').prop('disabled','');
}

function authFailed(err) {
  console.log(err);
  $('#authBtn').removeClass("btn-primary btn-success btn-danger");
  $('#authBtn').addClass("btn-danger");
  if (err.result.error) {
    $('#errorAlertMsg').text("Error: "+err.result.error.message);
  } else {
    $('#errorAlertMsg').text("Error: "+err.error);
  }
  $('#errorAlert').removeClass("hidden");
}

function authenticate() {
  return gapi.auth2.getAuthInstance()
    .signIn({scope: "https://www.googleapis.com/auth/webmasters.readonly"})
    .then(authSuccess, authFailed);
}
function loadClient() {
  gapi.client.setApiKey(APIKEY);
  return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/searchconsole/v1/rest")
    .then(function() {
      //console.log("GAPI client loaded for API");
      executeSitesList();
    }, authFailed);
}

function sortBysiteUrl (a, b) {
    let fa = a.siteUrl.toLowerCase(),
        fb = b.siteUrl.toLowerCase();

    if (fa < fb) {
        return -1;
    }
    if (fa > fb) {
        return 1;
    }
    return 0;
}

function executeSitesList() {
  return gapi.client.webmasters.sites.list({})
    .then(function(response) {
        response.result.siteEntry = response.result.siteEntry.sort(sortBysiteUrl);
        let siteOptionHTML = siteOptionTemplate(response.result);
        $('#properties').html(siteOptionHTML);
        siteUrl = $('#properties').val();
        $('#properties').on('change', function () {
          siteUrl = $('#properties').val();
        });
      }, authFailed);
}

function inspectURL(inspectionUrl) {

  return gapi.client.searchconsole.urlInspection.index.inspect({
    "resource": {
      "inspectionUrl": inspectionUrl,
      "languageCode": "en-US",
      "siteUrl": siteUrl
    }
  })
  .then(function(response) {
    running--;
    // Handle the results here (response.result has the parsed body).
    //console.log("Response", response);
    if (response.result.inspectionResult.indexStatusResult.referringUrls) {
      response.result.inspectionResult.indexStatusResult.referringUrls.join("\r\n");
    }
    if (response.result.inspectionResult.indexStatusResult.sitemap) {
      response.result.inspectionResult.indexStatusResult.sitemap.join("\r\n");
    }
    response.result.inspectionResult.indexStatusResult['inspectedUrl'] = inspectionUrl;
    tableData.push(response.result.inspectionResult.indexStatusResult);
    loadTable();
    urlsDone.push(inspectionUrl);
    if (urls.length == urlsDone.length) {
      $('#progress').addClass("hidden");
    }
  }, authFailed);
}

init();