var FamilySearch =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var cookies = __webpack_require__(1),
	    Request = __webpack_require__(2),
	    requestHandler = __webpack_require__(3),
	    utils = __webpack_require__(4),
	    requestMiddleware = __webpack_require__(5),
	    responseMiddleware = __webpack_require__(12);

	/**
	 * Create an instance of the FamilySearch SDK Client
	 * 
	 * @param {Object} options
	 * @param {String} options.environment Reference environment: production, beta,
	 * or integration. Defaults to integration.
	 * @param {String} options.appKey Application Key
	 * @param {String} options.redirectUri OAuth2 redirect URI
	 * @param {String} options.saveAccessToken Save the access token to a cookie
	 * and automatically load it from that cookie. Defaults to false.
	 * @param {String} options.tokenCookie Name of the cookie that the access token
	 * will be saved in when `saveAccessToken` is true. Defaults to 'FS_AUTH_TOKEN'.
	 * @param {String} options.maxThrottledRetries Maximum number of a times a 
	 * throttled request should be retried. Defaults to 10.
	 * @param {Array} options.pendingModifications List of pending modifications
	 * that should be activated.
	 */
	var FamilySearch = function(options){
	  this.appKey = options.appKey;
	  this.environment = options.environment || 'integration';
	  this.redirectUri = options.redirectUri;
	  this.tokenCookie = options.tokenCookie || 'FS_AUTH_TOKEN';
	  this.maxThrottledRetries = options.maxThrottledRetries || 10;
	  this.saveAccessToken = options.saveAccessToken === true;
	  
	  this.middleware = {
	    request: [
	      requestMiddleware.url,
	      requestMiddleware.defaultAcceptHeader,
	      requestMiddleware.authorizationHeader, 
	      requestMiddleware.disableAutomaticRedirects, 
	      requestMiddleware.body
	    ],
	    response: [
	      responseMiddleware.redirect, 
	      responseMiddleware.throttling, 
	      responseMiddleware.json
	    ]
	  };
	  
	  if(Array.isArray(options.pendingModifications) && options.pendingModifications.length > 0){
	    this.addRequestMiddleware(requestMiddleware.pendingModifications(options.pendingModifications));
	  }
	  
	  // Figure out initial authentication state
	  if(this.saveAccessToken){
	    
	    // If an access token was provided, save it.
	    if(options.accessToken){
	      this.setAccessToken(options.accessToken);
	    }
	    
	    // If we don't have an access token, try loading one.
	    else {
	      var token = cookies.getItem(this.tokenCookie);
	      if(token){
	        this.accessToken = token;
	      }
	    }
	  }
	};

	/**
	 * Start the OAuth2 redirect flow by redirecting the user to FamilySearch.org
	 */
	FamilySearch.prototype.oauthRedirect = function(){
	  window.location.href = this.oauthRedirectURL();
	};

	/**
	 * Generate the OAuth 2 redirect URL
	 */
	FamilySearch.prototype.oauthRedirectURL = function(){
	  return this.identHost() + '/cis-web/oauth2/v3/authorization' +
	    '?response_type=code&client_id=' + this.appKey + '&redirect_uri=' + this.redirectUri;
	};

	/**
	 * Handle an OAuth2 redirect response by extracting the code from the query
	 * and exchanging it for an access token. The token is automatically saved
	 * in a cookie when that behavior is enabled.
	 * 
	 * @param {Function} callback that receives the access token response
	 * @return {Boolean} true if a code was detected; false otherwise. This does
	 * not indicate whether an access token was successfully requested, just
	 * whether a code was found in the query param and a request was sent to
	 * exchange the code for a token.
	 */
	FamilySearch.prototype.oauthResponse = function(callback){
	  
	  // Extract the code from the query params
	  var code = utils.getParameterByName('code');
	  if(code){
	  
	    // Exchange the code for an access token
	    this.oauthToken(code, callback);
	    return true;
	  }
	  return false;
	};

	/**
	 * Exchange an OAuth code for an access token. You don't need to call this in
	 * the browser if you use oauthResponse() to automatically get the URL from the
	 * query parameters.
	 * 
	 * @param {String} code
	 * @param {Function} callback that receives the access token response
	 */
	FamilySearch.prototype.oauthToken = function(code, callback){
	  var client = this;
	  client.post(client.identHost() + '/cis-web/oauth2/v3/token', {
	    body: {
	      grant_type: 'authorization_code',
	      code: code,
	      client_id: client.appKey
	    },
	    headers: {
	      'Content-Type': 'application/x-www-form-urlencoded'
	    }
	  }, function(error, response){
	    client.processOauthResponse(error, response, callback);
	  });
	};

	/**
	 * OAuth2 password authentication
	 * 
	 * @param {String} username
	 * @param {String} password
	 * @param {Function} callback
	 */
	FamilySearch.prototype.oauthPassword = function(username, password, callback){
	  var client = this;
	  this.post(this.identHost() + '/cis-web/oauth2/v3/token', {
	    body: {
	      grant_type: 'password',
	      client_id: this.appKey,
	      username: username,
	      password: password
	    },
	    headers: {
	      'Content-Type': 'application/x-www-form-urlencoded'
	    }
	  }, function(error, response){
	    client.processOauthResponse(error, response, callback);
	  });
	};

	/**
	 * Process an OAuth2 access_token response
	 */
	FamilySearch.prototype.processOauthResponse = function(error, response, callback){
	  if(response && response.statusCode === 200 && response.data){
	    this.setAccessToken(response.data.access_token);
	  }
	  if(callback){
	    setTimeout(function(){
	      callback(error, response);
	    });
	  }
	};

	/**
	 * Set the access token. The token is also saved to a cookie if that behavior
	 * is enabled.
	 * 
	 * @param {String} accessToken
	 * @return {FamilySearch} client
	 */
	FamilySearch.prototype.setAccessToken = function(accessToken){
	  this.accessToken = accessToken;
	  if(this.saveAccessToken){
	    // Expire in 24 hours because tokens never last longer than that, though
	    // they can expire before that after 1 hour of inactivity.
	    cookies.setItem(this.tokenCookie, accessToken, 86400);
	  }
	  return this;
	};

	/**
	 * Get the access token if one is currently set
	 * 
	 * @return {String} access token
	 */
	FamilySearch.prototype.getAccessToken = function(){
	  return this.accessToken;
	};

	/**
	 * Delete the access token
	 * 
	 * @return {FamilySearch} client
	 */
	FamilySearch.prototype.deleteAccessToken = function(){
	  this.accessToken = undefined;
	  if(this.saveAccessToken){
	    cookies.removeItem(this.tokenCookie);
	  }
	  return this;
	};

	/**
	 * Add request middleware
	 * 
	 * @param {Function} middleware
	 * @return {FamilySearch} client
	 */
	FamilySearch.prototype.addRequestMiddleware = function(middleware){
	  this.middleware.request.push(middleware);
	  return this;
	};

	/**
	 * Add response middleware
	 * 
	 * @param {Function} middleware
	 * @return {FamilySearch} client
	 */
	FamilySearch.prototype.addResponseMiddleware = function(middleware){
	  this.middleware.response.push(middleware);
	  return this;
	};

	/**
	 * Execute an HTTP GET
	 * 
	 * @param {String} url
	 * @param {Object=} options See request() for an explanation of the options
	 * @param {Function} callback
	 */
	FamilySearch.prototype.get = _req('GET');

	/**
	 * Execute an HTTP POST
	 * 
	 * @param {String} url
	 * @param {Object=} options See request() for an explanation of the options
	 * @param {Function} callback
	 */
	FamilySearch.prototype.post = _req('POST');

	/**
	 * Execute an HTTP HEAD
	 * 
	 * @param {String} url
	 * @param {Object=} options See request() for an explanation of the options
	 * @param {Function} callback
	 */
	FamilySearch.prototype.head = _req('HEAD');

	/**
	 * Execute an HTTP DELETE
	 * 
	 * @param {String} url
	 * @param {Object=} options See request() for an explanation of the options
	 * @param {Function} callback
	 */
	FamilySearch.prototype.delete = _req('DELETE');

	/**
	 * Construct a request wrapper for the specified HTTP method
	 */
	function _req(method){
	  
	  /**
	   * @param {String} url
	   * @param {Object=} options See request() for an explanation of the options
	   * @param {Function} callback
	   */
	  return function(url, options, callback){
	  
	    // Allow for options to not be given in which case the callback will be
	    // the second argument
	    if(typeof options === 'function'){
	      callback = options;
	      options = {};
	    }
	    
	    options.method = method;
	    
	    this.request(url, options, callback);
	  };
	}

	/**
	 * Execute an HTTP request
	 * 
	 * @param {String} url
	 * @param {Object=} options
	 * @param {String} options.method HTTP method. Defaults to GET
	 * @param {Object} options.headers HTTP headers. `{'Content-Type':'application/x-fs-v1+json'}`
	 * @param {String|Object} options.body Request body. May be a JavaScript object
	 * or a string. If an object is detected then the SDK will attempt automatically
	 * set the `Content-Type` header to `application/x-fs-v1+json` if it's missing.
	 * @param {Function} callback
	 */
	FamilySearch.prototype.request = function(url, options, callback){
	  
	  // Allow for options to not be given in which case the callback will be
	  // the second argument
	  if(typeof options === 'function'){
	    callback = options;
	    options = {};
	  }
	  
	  this._execute(new Request(url, options, callback), callback);
	};

	/**
	 * Execute a request
	 * 
	 * @param {Object} request
	 */
	FamilySearch.prototype._execute = function(request, callback){
	  var client = this;
	  
	  // First we run request middleware
	  client._runRequestMiddleware(request, function(error, middlewareResponse){
	    
	    // Return the error if one was received from the middleware
	    if(error || middlewareResponse){
	      responseHandler(error, middlewareResponse);
	    } 
	    
	    // If we didn't receive a response from the request middleware then we
	    // proceed with executing the actual request.
	    else {
	      requestHandler(request, responseHandler);
	    }
	  });
	  
	  function responseHandler(error, response){
	    // If the request errored then we immediately return and don't run
	    // response middleware because we don't have an HTTP response
	    if(error){
	      setTimeout(function(){
	        callback(error);
	      });
	    }
	    
	    // Run response middleware
	    else {
	      client._runResponseMiddleware(request, response, function(error){
	        setTimeout(function(){
	          if(error){
	            callback(error);
	          } else {
	            callback(undefined, response);
	          }
	        });
	      });
	    }
	  }
	};

	/**
	 * Run request middleware
	 * 
	 * @param {Object} request
	 * @param {Function} callback(error, response)
	 */
	FamilySearch.prototype._runRequestMiddleware = function(request, callback){
	  var client = this;
	  utils.asyncEach(this.middleware.request, function(middleware, next){
	    middleware(client, request, function(error, newResponse){
	      if(error || newResponse){
	        callback(error, newResponse);
	      } else {
	        next();
	      }
	    });
	  }, callback);
	};

	/**
	 * Run response middleware
	 * 
	 * @param {Object} request
	 * @param {Object} response
	 * @param {Function} callback(error)
	 */
	FamilySearch.prototype._runResponseMiddleware = function(request, response, callback){
	  var client = this;
	  utils.asyncEach(this.middleware.response, function(middleware, next){
	    middleware(client, request, response, function(error, cancel){
	      if(error){
	        callback(error);
	      } else if(typeof cancel === 'undefined') {
	        next();
	      }
	    });
	  }, callback);
	};

	/**
	 * Get the ident host name for OAuth
	 * 
	 * @return string
	 */
	FamilySearch.prototype.identHost = function(){
	  switch (this.environment) {
	    case 'production':
	      return 'https://ident.familysearch.org';
	    case 'beta':
	      return 'https://identbeta.familysearch.org';
	    default:
	      return 'https://integration.familysearch.org';
	  }
	};

	/**
	 * Get the host name for the platform API
	 * 
	 * @return string
	 */
	FamilySearch.prototype.platformHost = function(){
	  switch (this.environment) {
	    case 'production':
	      return 'https://familysearch.org';
	    case 'beta':
	      return 'https://beta.familysearch.org';
	    default:
	      return 'https://integration.familysearch.org';
	  }
	};

	module.exports = FamilySearch;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.docCookies = f()}})(function(){var define,module,exports;
	/*\
	|*|
	|*|  :: cookies.js ::
	|*|
	|*|  A complete cookies reader/writer framework with full unicode support.
	|*|
	|*|  Revision #1 - September 4, 2014
	|*|
	|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
	|*|  https://developer.mozilla.org/User:fusionchess
	|*|
	|*|  This framework is released under the GNU Public License, version 3 or later.
	|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
	|*|
	|*|  Syntaxes:
	|*|
	|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
	|*|  * docCookies.getItem(name)
	|*|  * docCookies.removeItem(name[, path[, domain]])
	|*|  * docCookies.hasItem(name)
	|*|  * docCookies.keys()
	|*|
	\*/

	var docCookies = {
	  getItem: function (sKey) {
	    if (!sKey) { return null; }
	    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	  },
	  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
	    var sExpires = "";
	    if (vEnd) {
	      switch (vEnd.constructor) {
	        case Number:
	          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
	          break;
	        case String:
	          sExpires = "; expires=" + vEnd;
	          break;
	        case Date:
	          sExpires = "; expires=" + vEnd.toUTCString();
	          break;
	      }
	    }
	    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	    return true;
	  },
	  removeItem: function (sKey, sPath, sDomain) {
	    if (!this.hasItem(sKey)) { return false; }
	    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
	    return true;
	  },
	  hasItem: function (sKey) {
	    if (!sKey) { return false; }
	    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	  },
	  keys: function () {
	    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
	    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
	    return aKeys;
	  }
	};

	return docCookies;

	});


/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Representation of an HTTP request.
	 * 
	 * @param {String} url
	 * @param {Object} options {method, headers, body, retries}
	 * @param {Function} callback
	 */
	var Request = function(url, options, callback){
	  
	  // Inititialize and set defaults
	  this.url = url;
	  this.callback = callback || function(){};
	  this.method = 'GET';
	  this.headers = {};
	  this.retries = 0;
	  this.options = {};
	  
	  // Process request options. We use a for loop so that we can stuff all
	  // non-standard options into the options object on the reuqest.
	  var opt;
	  for(opt in options){
	    if(options.hasOwnProperty(opt)){
	      switch(opt){
	        
	        case 'method':
	        case 'body':
	        case 'retries':
	          this[opt] = options[opt];
	          break;
	          
	        case 'headers':
	          // We copy the headers object so that we don't have to worry about the developer
	          // and the SDK stepping on each other's toes by modifying the headers object.
	          this.headers = JSON.parse(JSON.stringify(options.headers));
	          break;
	          
	        default:
	          this.options[opt] = options[opt];
	      }
	    }
	  }
	};

	/**
	 * Does this request have the specified header?
	 * 
	 * @param {String} header
	 * @return {Boolean}
	 */
	Request.prototype.hasHeader = function(header){
	  return typeof this.headers[header] !== 'undefined';
	};

	/**
	 * Set a header on the request
	 * 
	 * @param {String} header
	 * @param {String} value
	 */
	Request.prototype.setHeader = function(header, value){
	  this.headers[header] = value;
	  return this;
	};

	/**
	 * Get a header's value
	 * 
	 * @param {String} header
	 * @return {String} value
	 */
	Request.prototype.getHeader = function(header){
	  return this.headers[header];
	};

	/**
	 * Get all the headers
	 * 
	 * @return {Object} headers
	 */
	Request.prototype.getHeaders = function(){
	  return this.headers;
	};

	/**
	 * Return true if this request is for an API in the /platform/ directory
	 * 
	 * @return {Boolean}
	 */
	Request.prototype.isPlatform = function(){
	  return this.url.indexOf('/platform/') !== -1;
	};

	module.exports = Request;

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * XMLHttpRequest wrapper used for making requests in the browser
	 * 
	 * @param {Object} request {url, method, headers, body, retries}
	 * @param {Function} callback function(response)
	 */
	 
	var headersRegex = /^(.*?):[ \t]*([^\r\n]*)$/mg;

	module.exports = function(request, callback){
	  
	  // Create the XMLHttpRequest
	  var xhr = new XMLHttpRequest();
	  xhr.open(request.method, request.url);
	  
	  // Set headers
	  var headers = request.getHeaders();
	  for(var name in headers){
	    if(headers.hasOwnProperty(name)) {
	      xhr.setRequestHeader(name, headers[name]);
	    }
	  }
	  
	  // Attach response handler
	  xhr.onload = function(){
	    var response = createResponse(xhr, request);
	    setTimeout(function(){
	      callback(null, response);
	    });
	  };
	  
	  // Attach error handler
	  xhr.onerror = function(error){
	    setTimeout(function(){
	      callback(error);
	    });
	  };
	  
	  // Now we can send the request
	  xhr.send(request.body);
	  
	};

	/**
	 * Convert an XHR response to a standard response object
	 * 
	 * @param {XMLHttpRequest} xhr
	 * @param {Object} request {url, method, headers, retries}
	 * @return {Object} response
	 */
	function createResponse(xhr, request){
	  
	  // XHR header processing borrowed from jQuery
	  var responseHeaders = {}, match;
	  while ((match = headersRegex.exec(xhr.getAllResponseHeaders()))) {
			responseHeaders[match[1].toLowerCase()] = match[2];
		}
		
	  return {
	    statusCode: xhr.status,
	    statusText: xhr.statusText,
	    headers: responseHeaders,
	    originalUrl: request.url,
	    effectiveUrl: request.url,
	    redirected: false,
	    requestMethod: request.method,
	    requestHeaders: request.headers,
	    body: xhr.responseText,
	    retries: 0,
	    throttled: false
	  };
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = {
	  
	  /**
	   * URL encode an object
	   * 
	   * http://stackoverflow.com/a/1714899
	   * 
	   * @param {Object}
	   * @return {String}
	   */
	  urlEncode: function(obj){
	    var str = [];
	    for(var p in obj){
	      if (obj.hasOwnProperty(p)) {
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	      }
	    }
	    return str.join("&");
	  },
	  
	  /**
	   * Get a query parameter by name
	   * 
	   * http://stackoverflow.com/a/5158301
	   */
	  getParameterByName: function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	  },
	  
	  /**
	   * Iterate over data asynchronously in series.
	   * 
	   * @param {Array} list
	   * @param {Function} iterator function(item, next)
	   * @param {Function} finished function()
	   */
	  asyncEach: function(data, iterator, callback){
	    function nextCall(i){
	    	if(i === data.length){
	      	setTimeout(callback);
	      } else {
	      	iterator(data[i], function(){
	        	setTimeout(function(){
	          	nextCall(++i);
	          });
	        });
	      }
	    }
	    nextCall(0);
	  }
	  
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  authorizationHeader: __webpack_require__(6),
	  body: __webpack_require__(7),
	  defaultAcceptHeader: __webpack_require__(8),
	  disableAutomaticRedirects: __webpack_require__(9),
	  pendingModifications: __webpack_require__(10),
	  url: __webpack_require__(11)
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// Set the Authorization header if we have an access token
	module.exports = function(client, request, next){
	  if(!request.hasHeader('Authorization') && client.getAccessToken() && request.isPlatform()){
	    request.setHeader('Authorization', 'Bearer ' + client.getAccessToken());
	  }
	  next();
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(4);

	// Process a request body
	//
	// Allow for a string or object. If an object is given then stringify it.
	// Try to guess the appropriate `Content-Type` value if it's missing.
	module.exports = function(client, request, next){

	  if(request.body && (request.method === 'POST' || request.method === 'PUT')){
	    
	    // Try to guess the content type if it's missing
	    if(!request.hasHeader('Content-Type') && request.isPlatform()){
	      request.setHeader('Content-Type', 'application/x-fs-v1+json');
	    }
	    
	    // Turn objects into strings
	    if(typeof request.body !== 'string'){
	      
	      // JSON.stringify() if the content-type is JSON
	      if(request.hasHeader('Content-Type') && request.getHeader('Content-Type').indexOf('json') !== -1){
	        request.body = JSON.stringify(request.body);
	      } 
	      
	      // URL encode
	      else {
	        request.body = utils.urlEncode(request.body);
	      }
	      
	    }
	  }
	  
	  next();
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	// Set the Accept header if it's missing on /platform URLs
	module.exports = function(client, request, next){
	  if(!request.hasHeader('Accept') && request.isPlatform()){
	    request.setHeader('Accept', 'application/x-fs-v1+json');
	  }
	  next();
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * Disable automatic redirects. Useful client-side so that the browser doesn't
	 * automatically follow 3xx redirects; that causes problems if the browser
	 * doesn't replay all request options such as the Accept header.
	 */
	module.exports = function(client, request, next){
	  if(!request.hasHeader('X-Expect-Override') && request.isPlatform()){
	    request.setHeader('X-Expect-Override', '200-ok');
	  }
	  next();
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Add headers for enabling pending modifications. Call this method when adding
	 * the middleware to pass the header list that will be processed and cached.
	 * 
	 * `client.addMiddleware(pendingModificationMiddleware(modfifications));`
	 * 
	 * @param {Array} mods list of modifications
	 * @return {Function} middleware
	 */
	module.exports = function(mods){
	  
	  // Cache the header value so we don't have to do this on every request
	  var headerValue = mods.join(',');
	  
	  // Return the actual middleware
	  return function(client, request, next){
	    request.headers['X-FS-Feature-Tag'] = headerValue;
	    next();
	  };
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	// Calculate the URL
	//
	// For now we just need to know whether the protocol + host were provided
	// because if we just received a path such as /platform/tree/persons then
	// we want to automatically prepend the platform host.
	module.exports = function(client, request, next){
	  if(request.url.indexOf('https://') === -1){
	    request.url = client.platformHost() + request.url;
	  }
	  next();
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  json: __webpack_require__(13),
	  redirect: __webpack_require__(14),
	  throttling: __webpack_require__(15)
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	// Parse JSON response
	module.exports = function(client, request, response, next){
	  var contentType = response.headers['content-type'];
	  if(contentType && contentType.indexOf('json') !== -1){
	    try {
	      response.data = JSON.parse(response.body);
	    } catch(e) { 
	      // Should we handle this error? how could we?
	    }
	  }
	  next();
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Automatically follow a redirect. This behavior is optional because you don't
	 * allways want to follow redirects such as when requesting a person's profile.
	 * 
	 * This middleware is enabled per request by setting the `followRedirect` request 
	 * option to true.
	 */
	module.exports = function(client, request, response, next){
	  var location = response.headers['location'];
	  if(request.options.followRedirect && location && location !== request.url ){
	    var originalUrl = request.url;
	    request.url = response.headers['location'];
	    client._execute(request, function(error, response){
	      if(response){
	        response.originalUrl = originalUrl;
	        response.redirected = true;
	      }
	      setTimeout(function(){
	        request.callback(error, response);
	      });
	    });
	    return next(undefined, true);
	  }
	  next();
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	// Automatically replay all throttled requests
	module.exports = function(client, request, response, next){
	  // Throttled responses have an HTTP status code of 429. We also check to make
	  // sure we haven't maxed out on throttled retries.
	  if(response.statusCode === 429 && request.retries < client.maxThrottledRetries){
	    
	    // Throttled responses include a retry header that tells us how long to wait
	    // until we retry the request
	    var retryAfter = parseInt(response.headers['retry'], 10) * 1000 || 1000;
	    setTimeout(function(){
	      client._execute(request, function(error, response){
	        response.throttled = true;
	        response.retries = ++request.retries;
	        setTimeout(function(){
	          request.callback(error, response);
	        });
	      });
	    }, retryAfter);
	    return next(undefined, true);
	  }
	  next();
	};

/***/ }
/******/ ]);