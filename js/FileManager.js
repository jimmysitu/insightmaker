var InsightMakerFileExtension = ".InsightMaker";

// Append file extension to file (if not already there)
function appendFileExtension(filename,extension) {
	var extension_position=filename.length-extension.length;
	var current_extension=filename.slice(extension_position);
	if(current_extension.toLowerCase()!=extension.toLowerCase()) {
		filename+=extension;
	}
	return filename;
}

// Set the title to include the model name
function setTitle(filename) {
	var title;
	if(filename) {
		title = filename+"| Insight Maker";
		
	} else {
		title = "Insight Maker";
	}
	window.parent.document.title = title;
}

// Get xml data for the current model
function getModelXML() {
	var enc = new mxCodec();
	var graph_dom=enc.encode(graph.getModel());
	var xml_data="<InsightMakerModel>"+graph_dom.innerHTML+"</InsightMakerModel>";
	return xml_data;
}

// Makes a new model
function newModel() {
	clearModel();
}

// High-level File manager. Does save and load of models
var FileManagerWeb = new function() {
	var self = this;
	var filename = null;
	
	this.set_filename = function(filename) {
		self.filename=filename;
		setTitle(filename);
	}
	
	this.saveModel = function() {
		Ext.MessageBox.prompt('Model name', 'Enter name of model', function(btn, model_name){
			if(btn=='cancel') {
				return;
			}
			if (btn == 'ok'){
				var xml_data = getModelXML();
				model_name=appendFileExtension(model_name,InsightMakerFileExtension);
				self.set_filename(model_name);
				downloadFile(model_name,xml_data);
			}
		});

	};
	
	this.loadModel = function() {
		openFile({
			read: "text",
			multiple: false,
			accept: InsightMakerFileExtension,
			onCompleted: function(model) {
				importMXGraph(model.contents);
				self.set_filename(model.name);
			}
		});
	};
	
	this.newModel = function() {
		self.set_filename(null);
		newModel();
	}
};

// FileMenu for environment.WebOffline
var FileMenuWeb = {
text: getText('File'),
itemId: "filegroup",
glyph: 0xf15b,
menu: [
	{
		glyph: 0xf016,
		text: getText('New'),
		tooltip: getText('New model'),
		handler: FileManagerWeb.newModel,
		scope: this
	}, 
	{
		glyph: 0xf115, /*0xf115 alternative icon we could have used */
		text: getText('Load'),
		tooltip: getText('Load model'),
		handler: FileManagerWeb.loadModel,
		scope: this
	}, 
	{
		glyph: 0xf0c7,
		text: getText('Save'),
		tooltip: getText('Save model'),
		handler: FileManagerWeb.saveModel,
		scope: this
	}
]
};

var FileManagerNW = new function() {
	var self = this;
	var current_path = null;
	var upload_handler;
	
	self.set_current_path=function(new_current_path) {
		self.current_path=new_current_path;
		setTitle(self.current_path);
	}
	
	
	function writefile(event) {
		var file = event.target.files[0]; 
		if (file) {
			self.set_current_path(appendFileExtension(file.path,InsightMakerFileExtension));
			self.saveModel();
				
		}
	}
	
	
	function readfile(event) {
		var file = event.target.files[0]; 

		if (file) {
			self.set_current_path(file.path);
		  var reader = new FileReader();
		  reader.onload = function(reader_event) { 
			  var filedata = reader_event.target.result;
			  importMXGraph(filedata);	
		  }
		  reader.readAsText(file);
		}
	}

	this.openModel = function(tupload_handler, accepttype) {
		var uploader = document.body.appendChild(document.createElement("input"));
		uploader.addEventListener('change', readfile, false);
		uploader.type="file";
		uploader.accept=InsightMakerFileExtension;
		upload_handler = tupload_handler;
		
		uploader.click();
		uploader.parentElement.removeChild(uploader);
	};
	
	this.saveModel = function() {
		if(self.current_path == null) {
			self.saveModelAs();
			return;
		}
		var content = getModelXML();
		var fs = nw_require('fs');
		fs.writeFile(self.current_path,content, function(err) {
			if(err) {
				return console.log(err);
			}
		}); 
	};
	this.saveModelAs = function(content) {
		//Creates an element of type <input type="file" nwsaveas>		
		var uploader = document.body.appendChild(document.createElement("input"));
		uploader.addEventListener('change', writefile, false);
		uploader.type="file";
		uploader.nwsaveas="";
		uploader.accept=InsightMakerFileExtension;
		uploader.click();
		uploader.parentElement.removeChild(uploader);
	};
	this.newModel = function() {
		self.set_current_path(null);
		newModel();
	}
}

var FileMenuNW = {
text: getText('File'),
itemId: "filegroup",
glyph: 0xf15b,
menu: [
	{
		glyph: 0xf016,
		text: getText('New'),
		tooltip: getText('New model'),
		handler: FileManagerNW.newModel,
		scope: this
	}, 
	{
		glyph: 0xf115, /*0xf115 alternative icon we could have used */
		text: getText('Open'),
		tooltip: getText('Open model'),
		handler: FileManagerNW.openModel,
		scope: this
	}, 
	{
		glyph: 0xf0c7,
		text: getText('Save'),
		tooltip: getText('Save model'),
		handler: FileManagerNW.saveModel,
		scope: this
	},
	{
		glyph: 0xf0c7,
		text: getText('Save as'),
		tooltip: getText('Save model as'),
		handler: FileManagerNW.saveModelAs,
		scope: this
	}
]
};

// Get the correct FileMenu depending on the environment
var FileMenu;
switch(viewConfig.environment) {
	case environment.InsightMakerOnline:
		FileMenu = [];
		break;
	case environment.NodeWebKit:
		FileMenu = [FileMenuNW];
		break;
	case environment.WebOffline:
		FileMenu = [FileMenuWeb];
		break;
}
