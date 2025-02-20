function readURL(input, preview) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $(preview).attr('src', e.target.result)
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function uploadPhoto(file, resultTo, category, preview) {
  console.log('onchange')
  // let file = document.getElementById('screenshot');
  if (preview) readURL(file, preview);
  // console.log(file.files)
  if (file.files.length > 0) {
    // console.log('compressing');
    compress(file, function (img) {
      // console.log('compressed', img);
      if (img != false) {
        var fd = new FormData();
        fd.append("screenshot", img);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);

        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            console.log(percentComplete + '% uploaded');
            // document.querySelector(logs).innerText = percentComplete + '% uploaded';
          }
        };
        xhr.onload = function () {
          if (this.status == 200) {
            var resp = JSON.parse(this.response);
            document.querySelector(resultTo).value = resp.path;
            $scope = angular.element(resultTo).scope();
            $scope[category][resultTo.replace('#', '')] = resp.path;
            $scope.$apply();
            console.log('Server got:', resp);
          };
        };
        xhr.send(fd);
      }
    })
  }
}

function compress(e, cb) {
  var fileName = (new Date()).getTime() + '_' + (Math.floor(Math.random() * 999)) + '.jpg';
  var reader = new FileReader();
  reader.readAsDataURL(e.files[0]);
  reader.onload = function (event) {
    var img = new Image();
    img.src = event.target.result;
    img.onload = function () {
        var width = img.width;
        var height = img.height;
        var elem = document.createElement('canvas');
        elem.width = width;
        elem.height = height;
        var ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        ctx.canvas.toBlob(function (blob) {
          var file = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          cb(file);
        }, 'image/jpeg', 0.9);
      },
      reader.onerror = function (error) {
        console.log(error);
        cb(false);
      };
  };
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.prepend(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.log('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(null, function (err) {
      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
      }
    });
}

function copyMessage() {
  try {
    let message = window.localStorage.getItem('message');
    copyTextToClipboard(message);
  } catch (er) {
    console.log(er)
  }
}


function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += ','
      line += array[i][index];
    }
    str += line + '\r\n';
  }
  return str;
}

function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);
  var csv = this.convertToCSV(jsonObject);
  var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
  var blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilenmae);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], {
    type: mimeString
  });
  return blob;
}
