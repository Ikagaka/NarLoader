NarLoader - Nanika ARchive Loader
==========================

Installation
--------------------------

    npm install NarLoader

    bower install NarLoader

If you want to use Promise in a environment not having build-in Promise, 'bluebird' required.

Usage
--------------------------

    var NarLoader = require('NarLoader').NarLoader;
    var buffer = (nar data ArrayBuffer);
    var directory = NarLoader.loadFromBuffer(buffer);

or use this on the browsers ...

    <script src="jszip.js"></script>
    <script src="encoding.js"></script>
    <script src="Descript.js"></script>
    <script src="bluebird.js"></script>
    <script src="NarLoader.js"></script>
    ...
    var buffer = (nar data ArrayBuffer);
    var directory = NarLoader.loadFromBuffer(buffer);

API
--------------------------

### class NarLoader

All methods bellow is static methods.

#### loadFromBuffer(buffer), loadFromURL(url), loadFromBlob(blob) {static method}

    NarLoader.loadFromBuffer(buffer).then(...);

load nar from ArrayBuffer, URL, Blob

##### param

- **buffer** [ArrayBuffer] nar
- **url** [URL] nar
- **blob** [Blob] nar

##### return

[NanikaDirectory] files in nar

#### unzip(buffer) {static method}

internal

#### wget(url, type) {static method}

internal

### class NanikaFile

    var nf = new NanikaFile(jszipfile);

file object that has jszip file object

#### buffer()

    var arraybuf = nf.buffer();

first call: extract jszip file object to ArrayBuffer and cache it

second call: returns cache

##### return

[ArrayBuffer] file content

#### toString()

    var str = nf.toString();

get JavaScript native str by using encoding-japanese

##### return

[string] file content

#### valueOf()

same as buffer()

### class NanikaDirectory

    var nd = new NanikaDirectory({'path/to/file.txt': nanikafile, ...}, {has_install: true, has_descript: false});

directory object that has filepath hash of NanikaFile

#### constructor(files, options)

##### param

- **files** [Hash<string, NanikaFile>] directory contents
- **options** [Hash] options

##### options

- **has_install** [Boolean] if true: throw if dir does not have "install.txt"
- **has_descript** [Boolean] if true: throw if dir does not have "descript.txt"

#### files

Hash<string, NanikaFile>

#### parse(options)

internal

#### asArrayBuffer()

returns all files as ArrayBuffer

##### return

[Hash<string, ArrayBuffer>] directory contents

#### listChildren()

returns children list (like readdir)

##### return

[Array] names of elements

#### getDirectory(dirpath, options)

    var new_nd = nd.getDirectory('ghost/master', {has_descript: true});

get new NanikaDirectory that has contents in dirpath.

contents paths are trimed. ex. 'ghost/master/dict/events.kis' -> getDirectory('ghost/master') -> 'dict/events.kis'

##### param

- **dirpath** [string] directory path
- **options** [Hash] options for new NanikaDirectory

##### return

[NanikaDirectory] new NanikaDirectory

#### wrapDirectory(dirpath, options)

    var new_nd = nd.wrapDirectory('ghost/master');

get new NanikaDirectory that has same contents as old but has prepended path.

contents paths are prepended. ex. 'dict/events.kis' -> wrapDirectory('ghost/master') -> 'ghost/master/dict/events.kis'

##### param

- **dirpath** [string] directory path
- **options** [Hash] options for new NanikaDirectory

##### return

[NanikaDirectory] new NanikaDirectory

#### getElements(elempaths, options)

    var new_nd = nd.getElements(['ghost', 'shell']);

get new NanikaDirectory that has contents in elempaths (like filter).

contents paths are same as old.

##### param

- **elempaths** [Array<string>] element paths
- **options** [Hash] options for new NanikaDirectory

##### return

[NanikaDirectory] new NanikaDirectory

#### removeElements(elempaths, options)

    var new_nd = nd.removeElements(['myballoon']);

get new NanikaDirectory that has contents excluding elempaths (like negative filter).

contents paths are same as old.

##### param

- **elempaths** [Array<string>] element paths
- **options** [Hash] options for new NanikaDirectory

##### return

[NanikaDirectory] new NanikaDirectory

#### pathToRegExp(path)

internal

#### path.canonical(path)

internal

License
--------------------------

This is released under [MIT License](http://narazaka.net/license/MIT?2014).
