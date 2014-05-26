//Stackoverflow refernce: http://stackoverflow.com/questions/14447336/android-phonegap-camera-and-image-uploading
var SubmitPictureView = {
	imageFileUri: null,
    functionToCallAfterPhotoUploaded:null,
init: function() {
    this.addButtonListener();
},
addButtonListener: function () {
    $("#getPicture").click(function() {
    	SubmitPictureView.takePicture();
     });
},
takePicture: function(functionToCall) {
    if (typeof functionToCall === "undefined") {
        this.functionToCallAfterPhotoUploaded = this.changePageToExtraInfo;
    }
    else {
        this.functionToCallAfterPhotoUploaded = functionToCall;
    }
    //pictureSource=navigator.camera.PictureSourceType;
    var pictDestinationType=navigator.camera.DestinationType;

	navigator.camera.getPicture(SubmitPictureView.onPhotoUriSuccess, SubmitPictureView.onFailCamera, { quality: 25,
                                destinationType: pictDestinationType.FILE_URI,targetWidth:350,
                                targetHeight:450
                                });

           
},
onPhotoUriSuccess: function (imageUriToUpload){
	this.imageFileUri = imageUriToUpload;
    var url=encodeURI(app.WEBSITE_ADDRESS+"/server/update.php?fbid="+app.user.fbid+"&type=picture&id="+app.currentAed.databaseIndex);

    var params = new Object();

    var options = new FileUploadOptions();
    options.fileKey = "filePicture"; //depends on the api
    options.fileName = "filePicture.jpg";//imageUriToUpload.substr(imageUriToUpload.lastIndexOf('/')+1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = true; //this is important to send both data and files


    var ft = new FileTransfer();
    // TODO: add loading symbol this upload takes a long time.
    ft.upload(imageUriToUpload, url, SubmitPictureView.succesFileTransfer, SubmitPictureView.errorFileTransfer, options);
},
succesFileTransfer: function (r) {
	var responseObject = $.parseJSON(r.response);
	app.currentAed.img = responseObject.img;

	//this.moveFile(this.imageFileUri,responseObject.img);
	SubmitPictureView.functionToCallAfterPhotoUploaded();
},
changePageToExtraInfo: function() {
    $.mobile.changePage("submitCompleted.html");
},
moveFile: function(src,dest){
/* TODO confusing, and I'm tired, leaving move file for another day.
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,     
			function onFileSystemSuccess(fileSystem) {
				console.log(fileSystem.name);
				console.log(fileSystem.root.name);
				
				fileSystem.root.getFile(src, null,  function gotFileEntry(fileEntry) {
					console.log("move from: "+src);
					console.log("move to: "+fileEntry.fullPath+dest);
					 parentEntry = new DirectoryEntry("uploads", fileEntry.fullPath);
					fileEntry.moveTo(parentEntry, dest); //TODO dest - 'uploads\'
					//  entry.moveTo(parentEntry, "newFile.txt", success, fail);
				}, 
				this.fail);
			}, 
			this.fail);		
*/			
},
errorFileTransfer: function (evt) {
	 console.error(evt.target.error.code);
}
};

$(document).delegate('#submitpicture-page', 'pageshow', function(){
	SubmitPictureView.init();
});