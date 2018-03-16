var fs = require('fs');
var http = require('https');
var output = process.argv[2];

if(!output) {
	console.error("Please provide output filename e.g. node generateBundle.js lib.js");
	process.exit(1);
}

var libs = [
	"https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js",
	"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
];

console.log('Truncating: ' + output);
fs.writeFileSync(output, '');

function append(callback){
	if(libs.length){
		var lib = libs.shift();
		console.log("appending: " + lib);
        http.get(lib, function(response) {
        	response.pipe(fs.createWriteStream(output, {
        		flags: 'a'
        	}));
        	response.on('end', function(){
        		append(callback);
        	});
        });
	}
	else callback();
}

append(function(){
	console.log("done");
});
