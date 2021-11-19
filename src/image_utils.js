
/*
* Takes an object that contains keys that identify the images and URL 
* for the images. It loads the images and call the callback function.

* Example:
* var ICON_LIST = {
*   "case"   : { "url": icon_case_base64  },
*   "arrest" : { "url": icon_arrest_base64}
* }
* 
*  loadAllImages(ICON_LIST, start);
*
*	function start() {
*		// ... render the imagages
*	}
*/
function loadAllImages(image_config, callback) {
	var loadcount = 0;
	var config_element_list = Object.keys(image_config);
	var image_count = config_element_list.length;

	for (var key in image_config) {
		var config_element = image_config[key];
		var image = new Image();
		config_element.image = image;
		image.onload = function () {
			loadcount++;
			if (loadcount == image_count) {
				callback();
			}
		};
		image.onerror = function () { alert("image load failed"); }
		image.crossOrigin = "anonymous";
		image.src = config_element.url;
		delete config_element.url;

	}
}