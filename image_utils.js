
		/*
		* Takes an object that contains keys that identify the images and URL 
		* for the images, loads the images and call the callback function
		* Example:
		* var ICON_LIST = {
		*   "case"   : { "url": icon_case_base64  },
		*   "arrest" : { "url": icon_arrest_base64}
	    * }
		*/
		function loadAllImages(image_config, callback) {
			var loadcount = 0;
			var config_element_list = Object.keys(image_config);
			var image_total = config_element_list.length;

			for (var key in image_config) {
				var config_element = image_config[key];
				var image = new Image();
				config_element.image = image;
				image.onload = function () {
					loadcount++;
					if (loadcount == image_total) {
						callback();
					}
				};
				image.onerror = function () { alert("image load failed"); }
				image.crossOrigin = "anonymous";
				image.src = config_element.url;
			}
		}