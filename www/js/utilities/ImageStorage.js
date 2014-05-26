var ImageStorage = {

/*
	var domElement = //some "<img />" tag, we set fileName img to the src
	var imgSource = "http://graph.facebook.com/"+(Math.floor(Math.random()*900000)+20000)+"/picture?width=238&height=238";
	var fileName = "person"+i+".jpg";
	downloadFile(imgSource, fileName,domElement);
	loadLocalImage( fileName, domElement);
*/
	loadImage: function(imgSource, fileName,domElement){


		// get filesystem and look for file
		window.requestFileSystem(LocalFileSystem.PERSISTENT,
			0,
			function onFS(fileSystem){
				fileSystem.root.getFile(fileName, null,  function gotFileEntry(fileEntry) {
				fileEntry.file(function gotFile(file){			//if we find the file load it
					var reader = new FileReader();
					reader.onloadend = function(evt) {
						if(domElement != null){
							$(domElement).prop("src",  evt.target.result);
						}
					};
					reader.readAsDataURL(file);
				},
				this.fail);
			},
			function noFile(evt){
				console.log('drs no file');
				 fileSystem.root.getFile(
			 "dummy.html", {create: true, exclusive: false},
			 function gotFileEntry(fileEntry){
				 var sPath = fileEntry.fullPath.replace("dummy.html","");
				 var fileTransfer = new FileTransfer();
				 fileEntry.remove();
				 fileTransfer.download(
				   imgSource,
				   sPath + fileName,
				   function(theFile) {
					console.log("download complete: " + theFile.toURI());
					if(domElement != null){
						$(domElement).prop("src", theFile.toURI());
					}
				   },
				   function(error) {
					   console.log("download error source " + error.source);
					   console.log("download error target " + error.target);
					   console.log("error code: " + error.code);
				   }
				   );
			 },
			 this.fail);
			});
		},
		this.fail);

		//this.loadLocalImage( fileName, domElement)

	},
    fail: function (evt) {
    	console.log('drs fail');
        console.log(evt.target.error.code);
    }
};