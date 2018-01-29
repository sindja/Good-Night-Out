var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
//httpServer.listen(3000, '127.0.0.1');
httpServer.listen(3000, '192.168.1.82');
var socketIo = require('socket.io')(httpServer);
var closeDB;
//var mongoDbHelper = require('./mongoDBHelper.js');
var mongodb = require('mongodb');
var assert = require('assert');
var MongoClient = mongodb.MongoClient;
var mongourl = 'mongodb://127.0.0.1:27017/data';
var locObj=null;
var oldLocations=null;
app.get('/', function(req, res){
  // res.sendFile(__dirname + '/showMap.html');

  console.log("Hello");
});

socketIo.sockets.on('connection', function(socket)
{
	var currentTime = new Date();
	var result;
	console.log("socket connected at " + currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds());
	
	socket.on('Hello',function(Hello){ console.log("user connected"); 
				MongoClient.connect(mongourl, function(err, db)
			{	closeDB=db;
				if (err)
				{
					console.log('Unable to connect to the mongoDB server.');
					console.log('Error: ', err);
					handleResult("Error: " + err);
				}
				else
				{
					console.log('Connection established to ', mongourl);

					var placeCollection = db.collection('Places');

					placeCollection.find({}).sort({inserted: -1}).limit(300).toArray(function(err, docs) {
						var locations  = docs;
						socket.emit('locationsTransfer', locations)
						closeDB.close();			
				});				
			
				}
				console.log("==================");
				console.log("");
				
			});
		});
	
socket.on('locationUpdate', function(location)
	{
		console.log("current location: " + location.lat+" "+ location.lon);

		MongoClient.connect(mongourl, function(err, db)
		{
			closeDB=db;
			if (err)
			{
				console.log('Unable to connect to the mongoDB server.');
				console.log('Error: ', err);				
			}
			else
			{
				locObj=location;
			    console.log('Connection established to ', mongourl);
			    var placeCollection = db.collection('Places');
			    {	
			    	placeCollection.find({}).sort({inserted: -1}).limit(300).toArray(function(err, docs) {
						var locations  = docs;
			        	var locationsReturn=" ";
			        	var tmpArray=[];
			        	var k;
			        	for (var i = locations.length - 1; i >= 0; i--) {
			        		var tmp=measure(location["lat"],location["lon"],locations[i].latitude,locations[i].longitude);
			        		//console.log("lat "+location["lat"]+"lon "+location["lon"])+"latitude "+locations[i]["latitude"]+"longitude "+locations[i]["longitude"]);
			        		if(tmp<50)
			        		{
			        			k=1;
			        			locationsReturn = locationsReturn.concat("\n",locations[i]["name"]);
			        			tmpArray.push(locations[i]);
			        		}

			        	};
			        	if(k==1 && Check(tmpArray)==1)
			        	socket.emit('locationsReturn', locationsReturn);

			        								
					});
			    }
			}
			//db.close(); 
		});
	});
 function Check(newLocations)
 {
 	if(oldLocations!=null)
 	{
 		if(newLocations.length==oldLocations.length)
 		{	
 			var x=0;
 			for (var i = newLocations.length - 1; i >= 0; i--) {
 				if(CheckInArray(newLocations[i])==0)
 					x=1;
 			};
 			if(x==1)
 			{
 				oldLocations=newLocations;
 				return 1;
 			}
 			else
 				return 0;
 		}
 		else
 		{ 
 			oldLocations=newLocations;
 			return 1;
 		}
 	}
 	else
 	{
 		oldLocations=newLocations
 		return 1;
 	}
 }
 function CheckInArray(item)
 {	
 	var k=oldLocations.length-1;
 	var y=0;
 	while(k>=0 && y!=1)
 	{
 		if(oldLocations[k].name==item["name"] && oldLocations[k]["type"]==item["type"])
 			y=1;
 		k--;
 	}
 	if(y==1)
 		return 1;
 	else
 		return 0;
 }
	socket.on('storeGlobalLocations', function(locationObject)
	{
		console.log("Received object");
		console.log("Name: " + locationObject["name"]);
		console.log("Description: " + locationObject["description"]);
		console.log("Latitude: " + locationObject["latitude"]);
		console.log("Longitude: " + locationObject["longitude"]);
		console.log("Type: "+ locationObject["type"]);
		console.log("");
	
	MongoClient.connect(mongourl, function(err, db)
	{
		closeDB=db;
		if (err)
		{
			console.log('Unable to connect to the mongoDB server.');
			console.log('Error: ', err);
			
		}
		else
		{
			console.log('Connection established to ', mongourl);

			var placeCollection = db.collection('Places');

			placeCollection.insert(locationObject, function(err, result)
			{
				if (err)
				{
					console.log("Error: Cannot insert place.");
					console.log("Error details: ", err);
					closeDB.close();				
				}
				else
				{
					console.log("Inserted place!");
					console.log("Details: ", result);
					closeDB.close();
				}
			});
		}

		console.log("==================");
		console.log("");
	});


		//console.log("Result: " + result);
		console.log("======================");
		console.log("");
		socket.emit('locationStoreResult', "Stored");
	});
function measure(lat1, lon1, lat2, lon2){
    var R = 6378.137; 
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; 
}
socket.on('search', function(locationObject)
	{
		MongoClient.connect(mongourl, function(err, db)
		{
			closeDB=db;
			if (err)
			{
				console.log('Unable to connect to the mongoDB server.');
				console.log('Error: ', err);				
			}
			else
			{
				//pretraga po tipu i udaljenosti
				locObj=locationObject;
				if(locObj["radius"]=="")
				{
					locObj["radius"]=99999999999;
				}
			    console.log('Connection established to ', mongourl);
			    var placeCollection = db.collection('Places');
			   
			    if(locationObject["name"]=="")
			    {  	
			    	placeCollection.find({"type": locationObject["type"]}).toArray(function(err, docs, locationObject) {									
			        	var locations  = docs;
			        	var locationsReturn=[];
			        	for (var i = locations.length - 1; i >= 0; i--) {
			        		tmp=measure(locObj["latitude"],locObj["longitude"],locations[i]["latitude"],locations[i]["longitude"]);
			        		if(tmp<locObj["radius"])
			        		{
			        			locationsReturn.push(locations[i]);
			        		}
			        	};
						socket.emit('locationsTransfer', locationsReturn);
						closeDB.close();
					});
			    }
			    else
			    {
			    	//pretraga po imenu,tipu i udaljenosti
			    	 var str1 = "/";
			         var res=locationObject["name"];
			         regexValue='\.*'+res+'\.*';
				     placeCollection.find({"name": new RegExp(regexValue, 'i')}).toArray(function(err, docs,locationObject) {
				     		     								
			        	var locations  = docs;
			        	console.log(locations.length);
			        	var locationsReturn=[];
			        	for (var i = locations.length - 1; i >= 0; i--) {
			        		tmp=measure(locObj["latitude"],locObj["longitude"],locations[i]["latitude"],locations[i]["longitude"] );
			        		if(tmp<locObj["radius"] && (locObj["type"]==locations[i]["type"]) )
			        		{
			        			locationsReturn.push(locations[i]);
			        			 console.log(i);
			        		}
			        	};
			        	console.log(locationsReturn.length);
						socket.emit('locationsTransfer', locationsReturn);
						closeDB.close();
					});
			    }
		   }
		   console.log("==================");
			console.log(""); 
			//db.close(); 
		});
	});

});
