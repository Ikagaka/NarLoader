### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

if require? and module?
	JSZip = require('jszip')
	Encoding = require('encoding-japanese')
	WMDescript = require('ikagaka.wmdescript.js')
	unless Promise?
		Promise = require('bluebird')
else
	JSZip = @JSZip
	Encoding = @Encoding
	WMDescript = @WMDescript
	unless Promise?
		Promise = @Promise

class NarLoader
	@loadFromBuffer: (buffer) ->
		new Promise (resolve, reject) =>
			resolve new NanikaDirectory(NarLoader.unzip(buffer), has_install: true)
	@loadFromURL: (src) ->
		NarLoader.wget src, "arraybuffer"
		.then @loadFromBuffer
	@loadFromBlob: (blob) ->
		new Promise (resolve, reject) ->
			reader = new FileReader()
			reader.onload = -> resolve reader.result
			reader.onerror = (event) -> reject event.target.error
			reader.readAsArrayBuffer(blob)
		.then @loadFromBuffer
	@unzip = (buffer) ->
		zip = new JSZip()
		zip.load(buffer, checkCRC32: true)
		dir = {}
		for filePath of zip.files
			path = filePath.split("\\").join("/")
			dir[path] = new NanikaFile(zip.files[filePath])
		dir
	@wget = (url, type) ->
		new Promise (resolve, reject) =>
			xhr = new XMLHttpRequest()
			xhr.addEventListener "load", ->
				if 200 <= xhr.status < 300
					resolve xhr.response
				else
					reject xhr.statusText
			xhr.addEventListener "error", ->
				reject xhr.statusText
			xhr.open("GET", url)
			xhr.responseType = type
			xhr.send()

class NanikaFile
	constructor: (@_buffer) ->
	buffer: ->
		if @_buffer.asArrayBuffer?
			@_buffer = @_buffer.asArrayBuffer()
		else
			@_buffer
	toString: ->
		Encoding.codeToString(Encoding.convert(new Uint8Array(@buffer()), 'UNICODE', 'AUTO'))
	valueOf: -> @buffer()

class NanikaDirectory
	constructor: (files={}, options) ->
		@files = {}
		for path, file of files
			if file instanceof NanikaFile
				@files[path] = file
			else
				@files[path] = new NanikaFile(file)
		@parse(options)
	parse: ({has_install, has_descript}={})->
		if @files["install.txt"]?
			@install = WMDescript.parse(@files["install.txt"].toString())
		else if has_install
			throw "install.txt not found"
		if @files["descript.txt"]?
			@descript = WMDescript.parse(@files["descript.txt"].toString())
		else if has_descript
			throw "descript.txt not found"
	asArrayBuffer: ->
		directory = {}
		for path, file of @files
			directory[path] = @files[path].buffer()
		directory
	listChildren: ->
		children = {}
		for path of @files
			if result = path.match /^([^\/]+)/
				children[result[1]] = true
		Object.keys(children)
	addDirectory: (dir, options) ->
		directory = {}
		for path, file of @files
			directory[path] = file
		if dir instanceof NanikaDirectory
			files = dir.files
		else
			files = dir
		for path, file of files
			directory[path] = file
		new NanikaDirectory directory, options
	getDirectory: (dirpath, options) ->
		dirpathre = @pathToRegExp(dirpath)
		directory = {}
		Object.keys(@files)
		.filter (path) -> dirpathre.test path
		.forEach (path) =>
			directory[path.replace(dirpathre, "")] = @files[path]
		new NanikaDirectory directory, options
	wrapDirectory: (dirpath, options) ->
		dirpathcanon = @path.canonical(dirpath)
		directory = {}
		Object.keys(@files)
		.forEach (path) =>
			directory[dirpathcanon + '/' + path] = @files[path]
		new NanikaDirectory directory, options
	getElements: (elempaths, options) ->
		unless elempaths instanceof Array
			elempaths = [elempaths]
		directory = {}
		for elempath in elempaths
			elempathre = @pathToRegExp(elempath)
			Object.keys(@files)
			.filter (path) -> elempathre.test path
			.forEach (path) ->
				directory[path] = @files[path]
		new NanikaDirectory directory, options
	removeElements: (elempaths, options) ->
		unless elempaths instanceof Array
			elempaths = [elempaths]
		directory = {}
		for path, file of @files
			directory[path] = file
		for elempath in elempaths
			elempathre = @pathToRegExp(elempath)
			Object.keys(directory)
			.filter (path) -> elempathre.test path
			.forEach (path) ->
				delete directory[path]
		new NanikaDirectory directory, options
	hasElement: (elempath) ->
		elempathre = @pathToRegExp(elempath)
		for path of @files
			if elempathre.test path
				return true
		return false
	pathToRegExp: (path) ->
		new RegExp '^' + @path.canonical(path).replace(/(\W)/g, '\\$1') + '(?:$|/)'
	path:
		canonical: (path) ->
			path.replace(/\\/g, '/').replace(/^\.?\//, '').replace(/\/?$/, '')

if module?.exports?
	module.exports = NarLoader: NarLoader, NanikaFile: NanikaFile, NanikaDirectory: NanikaDirectory
else
	@NarLoader = NarLoader
	@NanikaFile = NanikaFile
	@NanikaDirectory = NanikaDirectory
