function grabFile(file,returnArea) {
  var request = getHTTPObject();
  if (request) {
    displayLoading(document.getElementById(returnArea));
    request.onreadystatechange = function() {
      parseResponse(request,returnArea);
    };
    request.open("GET", file, true);
    request.send(null);
    return true;
  } else {
    return false;
  }
}

function parseResponse(request,returnArea) {
  if (request.readyState == 4) {
    if (request.status == 200 || request.status == 304) {
      var details = document.getElementById(returnArea);
      details.innerHTML = request.responseText;
    }
  }
}

function getHTTPObject() {
  var xhr = false;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    try {
      xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } catch(e) {
      try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } catch(e) {
        xhr = false;
      }
    }
  }
  return xhr;
}

function displayLoading(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
  var image = document.createElement("img");
  image.setAttribute("src","/images/loading.gif");
  image.setAttribute("alt","Loading...");
  element.appendChild(image);
}
