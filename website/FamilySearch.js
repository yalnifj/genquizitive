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
	    XHR = __webpack_require__(3),
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
	 * and automatically load it from that cookie. Defaults to true.
	 * @param {String} options.tokenCookie Name of the cookie that the access token
	 * will be saved in. Defaults to 'FS_AUTH_TOKEN'.
	 * @param {String} options.maxThrottledRetries Maximum number of a times a 
	 * throttled request should be retried. Defaults to 10.
	 * @param {Array} options.pendingModifications List of pending modifications
	 * that should be activated.
	 */
	var FamilySearch = function(options){
	  this.appKey = options.appKey;
	  this.environment = options.environment || 'integration';
	  this.redirectUri = options.redirectUri;
	  this.saveAccessToken = options.saveAccessToken || true;
	  this.tokenCookie = options.tokenCookie || 'FS_AUTH_TOKEN';
	  this.maxThrottledRetries = options.maxThrottledRetries || 10;
	  
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
	  window.location.href = this.identHost() + '/cis-web/oauth2/v3/authorization' +
	    '?response_type=code&client_id=' + this.appKey + '&redirect_uri=' + this.redirectUri;
	};

	/**
	 * Handle an OAuth2 redirect response by extracting the code from the query
	 * and exchanging it for an access token. This also automatically saves the
	 * token in a cookie when that behavior is enabled.
	 * 
	 * @param {Function} callback that receives the access token response
	 * @return {Boolean} true if a code was detected; false otherwise. This does
	 * not indicate whether an access token was successfully requested, just
	 * whether a code was found in the query param and a request was sent to
	 * exchange the code for a token.
	 */
	FamilySearch.prototype.oauthResponse = function(callback){
	  
	  var client = this;
	  
	  // Extract the code from the query
	  var code = utils.getParameterByName('code');
	  
	  if(code){
	  
	    // Exchange the code for the access token
	    this.post(this.identHost() + '/cis-web/oauth2/v3/token', {
	      body: {
	        grant_type: 'authorization_code',
	        code: code,
	        client_id: this.appKey
	      },
	      headers: {
	        'Content-Type': 'application/x-www-form-urlencoded'
	      }
	    }, function(response){
	      client.processOauthResponse(response, callback);
	    });
	    
	    return true;
	    
	  }
	  
	  return false;
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
	  }, function(response){
	    client.processOauthResponse(response, callback);
	  });
	};

	/**
	 * Process an OAuth2 access_token response
	 */
	FamilySearch.prototype.processOauthResponse = function(response, callback){
	  if(response && response.statusCode === 200 && response.data){
	    this.setAccessToken(response.data.access_token);
	  }
	  if(callback){
	    setTimeout(function(){
	      callback(response);
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
	  client._runRequestMiddleware(request, function(response){
	    
	    // If request middleware returns a response then we're done and return the
	    // response to the user. This may happen with caching middleware.
	    if(response){
	      setTimeout(function(){
	        callback(response);
	      });
	    } 
	    
	    // If we didn't receive a response from the request middleware then we
	    // proceed with executing the actual request.
	    else {
	      XHR(request, function(response){
	        
	        // Run response middleware.
	        client._runResponseMiddleware(request, response, function(){
	          setTimeout(function(){
	            callback(response);
	          });
	        });
	      });
	    }
	  });
	};

	/**
	 * Run request middleware
	 * 
	 * @param {Object} request
	 * @param {Function} callback(response)
	 */
	FamilySearch.prototype._runRequestMiddleware = function(request, callback){
	  var client = this;
	  utils.asyncEach(this.middleware.request, function(middleware, next){
	    middleware(client, request, next);
	  }, callback);
	};

	/**
	 * Run response middleware
	 * 
	 * @param {Object} request
	 * @param {Object} response
	 * @param {Function} callback(response)
	 */
	FamilySearch.prototype._runResponseMiddleware = function(request, response, callback){
	  var client = this;
	  utils.asyncEach(this.middleware.response, function(middleware, next){
	    middleware(client, request, response, next);
	  }, function(newResponse){
	    
	    // Cancel response middleware by passing anything to the next function.
	    // Canceling middleware is useful when middleware issues a new request,
	    // such as throttling. We just drop this middleware chain when it's
	    // canceled because the new request will run it's own middleware.
	    if(typeof newResponse === 'undefined'){
	      setTimeout(callback);
	    }
	  });
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
	  this.url = url;
	  this.method = options.method || 'GET';
	  this.headers = options.headers ? JSON.parse(JSON.stringify(options.headers)) : {};
	  this.body = options.body;
	  this.retries = options.retries || 0;
	  this.callback = callback || function(){};
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
	 * XMLHttpRequest wrapper
	 * 
	 * @param {Object} request {url, method, headers, body, retries}
	 * @param {Function} callback function(response)
	 */
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
	      callback(response);
	    });
	  };
	  
	  // Attach error handler
	  xhr.onerror = function(error){
	    setTimeout(callback);
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
	  return {
	    statusCode: xhr.status,
	    statusText: xhr.statusText,
	    getHeader: function(name){
	      return xhr.getResponseHeader(name);
	    },
	    getAllHeaders: function(){
	      return xhr.getAllResponseHeaders();
	    },
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
	   * iterator is passed (item, next). Pass anything to the next method to
	   * cancel iteration. Whatever is passed to next will be passed to the finished
	   * callback method. The finished callback is called with nothing if iteration
	   * completes normally.
	   * 
	   * @param {Array} list
	   * @param {Function} iterator function(item, next)
	   * @param {Function} finished function(cancel)
	   */
	  asyncEach: function(data, iterator, callback){
	    function nextCall(i){
	    	if(i === data.length){
	      	setTimeout(callback);
	      } else {
	      	iterator(data[i], function(cancel){
	        	if(typeof cancel === 'undefined'){
	          	setTimeout(function(){
	            	nextCall(++i);
	            });
	          } else {
	          	setTimeout(function(){
	            	callback(cancel);
	            });
	          }
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

	// Disable automatic redirects
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
	  if(response){
	    var contentType = response.getHeader('Content-Type');
	    if(contentType && contentType.indexOf('json') !== -1){
	      try {
	        response.data = JSON.parse(response.body);
	      } catch(e) { 
	        // Should we handle this error? how could we?
	      }
	    }
	  }
	  next();
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(client, request, response, next){
	  if(response){
	    var location = response.getHeader('Location');
	    if(response.statusCode === 200 && location && location !== request.url ){
	      setTimeout(function(){
	        var originalUrl = request.url;
	        request.url = response.getHeader('Location');
	        client._execute(request, function(response){
	          if(response){
	            response.originalUrl = originalUrl;
	            response.redirected = true;
	          }
	          setTimeout(function(){
	            request.callback(response);
	          });
	        });
	      });
	      return next(true);
	    }
	  }
	  next();
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	// Automatically replay all throttled requests
	module.exports = function(client, request, response, next){
	  if(response){
	  
	    // Throttled responses have an HTTP status code of 429. We also check to make
	    // sure we haven't maxed out on throttled retries.
	    if(response.statusCode === 429 && request.retries < client.maxThrottledRetries){
	      
	      // Throttled responses include a retry header that tells us how long to wait
	      // until we retry the request
	      var retryAfter = parseInt(response.getHeader('Retry'), 10) * 1000 || 1000;
	      setTimeout(function(){
	        client._execute(request, function(response){
	          response.throttled = true;
	          response.retries = ++request.retries;
	          setTimeout(function(){
	            request.callback(response);
	          });
	        });
	      }, retryAfter);
	      return next(true);
	    }
	  }
	  next();
	};

/***/ }
/******/ ]);