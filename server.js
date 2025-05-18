var express=require("express");
var aapp=express();

aapp.use(express.static("public"));

aapp.listen(1050,function(){
    console.log("Server Started at port 1050");
    
})

aapp.get("/",function(req,resp){
    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
    console.log(path);
})

var mysql2=require("mysql2");

var config ={ 
    host : "bmxtb822hpbswmeip3sb-mysql.services.clever-cloud.com",
    user : "uguiqzjho3fys1yu",
    password : "VGkUdNk8EerUSh3Wtior",
    database : "bmxtb822hpbswmeip3sb",
    dataStrings : true,
    keepAliveDelay : 10000,
    enableKeepAlive : true,
}

var mysqlServer=mysql2.createConnection(config);

mysqlServer.connect(function(err){
    if(err == null){
        console.log("Congratulations Connection Established");
    }
    else{
        console.log("Connection failed"+err.message);
    }
});

aapp.get("/signup",function(req,resp){
    let email=req.query.txtMail;
    let pwd=req.query.txtPassword;
    let utype=req.query.Utype;

    mysqlServer.query("insert into logginn(email,pwd,utype,status,dos) values(?,?,?,?,current_date())",[email,pwd,utype,1],function(err){
        if(err!=null){
            resp.send(err.message);
            console.log(err.message);
        }
        else{
            resp.send("Successfully Added Record");
            console.log("Successfully Added Record");
        }
    })
});

// aapp.get("/login",function(req,resp){
//     var email=req.query.txtMailL;
//     var pwd=req.query.txtPwdL;

//     mysqlServer.query("select * from logginn where email=?",[email],function(err,jsonArray){
//         // resp.send(jsonArray)
//         console.log(jsonArray);

//         if(jsonArray.length==1){
//             resp.send(jsonArray[0]["utype"]);
//             console.log(jsonArray[0]["status"]);
//         }
//         else{
//             resp.send(err.message);
//         }
//     })
//  })

aapp.get("/login", function(req, resp) {
    var email = req.query.txtMailL;
    var pwd = req.query.txtPwdL;

    mysqlServer.query("SELECT * FROM logginn WHERE email=?", [email], function(err, jsonArray) {
        if (err) {
            console.error("DB Error:", err.message);
            resp.status(500).send("Database error");
            return;
        }

        if (!jsonArray || jsonArray.length === 0) {
            resp.status(401).send("Invalid email or user not found");
            return;
        }

        // Optional: Check password match manually here
        if (jsonArray[0].pwd !== pwd) {
            resp.status(401).send("Invalid password");
            return;
        }

        // Login successful
        resp.send(jsonArray[0].utype); // Or set session/cookie etc.
        console.log("User status:", jsonArray[0].status);
    });
});


 aapp.get("/checkUser",function(req,resp){
    var email=req.query.txtMail;

    mysqlServer.query("select * from logginn where email=?",[email],function(err,jsonArray){
        if(err!=null){
            resp.send(err.message);
        }
        else if(jsonArray.length==1){
            resp.send("User exists");
        }
        else{
            resp.send("New user");
        }
    })
 })

// ---------------------------------------------------------------------- Organizer's Dashboard
 aapp.get("/dashOrganizer",function(req,resp){
    let path=__dirname+"/public/dashOrganiser.html"
    resp.sendFile(path)
    console.log("Organizer's Dashboard"+path);
 })

// ---------------------------------------------------------------------- Player's Dashboard

 aapp.get("/dashPlayer",function(req,resp){
    let path=__dirname+"/public/dashPlayer.html";
    resp.sendFile(path);
    console.log("Player Dashboard"+path);
 })

// ---------------------------------------------------------------------- Organizer's Profile


aapp.get("/profileOrganizer",function(req,resp){
    let path=__dirname+"/public/profileOrganizer.html";
    resp.sendFile(path);
    console.log("Organizer Profile"+path);
 })    

// aapp.use(express.urlencoded({encoded:true}));
aapp.use(express.urlencoded({extended:true}));

var fileuploader=require("express-fileupload");
aapp.use(fileuploader());

var cloudinary=require("cloudinary").v2;
cloudinary.config({
    cloud_name : 'dogcwqkta',
    api_key : '727218227363974',
    api_secret : 'wxoFEiYjizc7eSk5xDtrubQLCcM'   
})

aapp.post("/saveOrganizer",async function(req,resp){
    let filename="";
    if(req.files == null){
        filename="nopic.jpg";
    }
    else{
        filename=req.files.profilepic.name;
        let path=__dirname+"/public/uploads/"+filename;
        console.log("Image Path:"+path);
        req.files.profilepic.mv(path);
        try{
        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;//will give u the url of ur pic on cloudinary server
            console.log(filename);
        })
    }
    catch(err){
        console.log(err.message);
    }
    }
    req.body.picpath=filename;
    
    mysqlServer.query("insert into organizations values(?,?,?,?,?,?,?,?,?,?,?)",
        [
        req.body.txtEmail,
        req.body.txtOrganization,
        req.body.txtContact,
        req.body.txtAdd,
        req.body.txtCity,
        req.body.txtId,
        req.body.picpath,
        req.body.txtDealsWith,
        req.body.txtPrevEvents,
        req.body.txtWebsite,
        req.body.txtSocialMedia
        ],
    function(err){
        if(err==null)
            resp.send("Record Saved Successfully with Id="+req.body.txtEmail);
        else
            resp.send(err.message); 
    })
})       

aapp.post("/updateOrganizer",async function(req,resp){
    let filename="";
        filename=req.files.profilepic.name;
        let path=__dirname+"/public/uploads/"+filename;
        req.files.profilepic.mv(path);
        try{
        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;
        })
    }
    catch(err){
        console.log("Err is:"+err.message);
    }
    
    req.body.picpath=filename;

    mysqlServer.query("update organizations set organization=?,contactno=?,address=?,city=?,proof=?,ppic=?,sports=?,prevsport=?,website=?,insta=? where email=?",
        [
        req.body.txtOrganization,
        req.body.txtContact,
        req.body.txtAdd,
        req.body.txtCity,
        req.body.txtId,
        req.body.picpath,
        req.body.txtDealsWith,
        req.body.txtPrevEvents,
        req.body.txtWebsite,
        req.body.txtSocialMedia,
        req.body.txtEmail
    ],function(err){
        if(err==null)
            resp.send("Record Updated Successfully");
     else
             resp.send(err.message); 
    })

})

aapp.get("/search-User",function(req,resp){
    let email=req.query.txtEmail;

    mysqlServer.query("select * from organizations where email=?",[email],function(err,jsonArray){
        if(err!=null){
            resp.send(err.message);
        }
        else if(jsonArray.length==1){
            resp.send("User Exists");
        }
        else{
            resp.send("No such User exists");
        }
    })
})

/*Very Common Error
1.node:internal/process/promises:289
triggerUncaughtException(err, true // fromPromise //);
^

[UnhandledPromiseRejection: This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason "#<Object>".] {
code: 'ERR_UNHANDLED_REJECTION'
}

Node.js v20.13.1
[nodemon] app crashed - waiting for file changes before starting...

2.How to add multiple sports in a database
3.Some images are added to cloudinary and some are not automatically even happening with the same images
4. where to use angular js and where to use ajax
*/




// -------------------------------------------------------------------- Tournament's Publish

aapp.get("/tournament",function(req,resp){
    let path=__dirname+"/public/publish-tournament.html";
    resp.sendFile(path);
    console.log(path);
})

aapp.post("/saveTournament",async function(req,resp){
    let filename="";

    if(filename==null){
        filename="nopic.jpg";
    }
    else{
        filename=req.files.poster.name;
        let path=__dirname+"/public/uploads/"+filename;
        console.log("Poster Path:"+path);
        req.files.poster.mv(path);

        await cloudinary.uploader.upload(path).then(function(result){
            filename=result.url;
            console.log("Filename of poster:"+filename);
        })

    }
    req.body.picpath=filename;

    mysqlServer.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?)",
        [
        null,
        req.body.txtEmail,
        req.body.game,
        req.body.title,
        req.body.fee,
        req.body.date,
        req.body.city,
        req.body.location,
        req.body.prize,
        req.body.picpath,
        req.body.txtArea
    ],
    function(err){
        if(err==null)
            resp.send("Tournament Published Successfully with Id="+req.body.txtEmail);
        else
            resp.send(err.message); 
    })
})       


// -------------------------------------------------------------------- Tournament's Finder

aapp.get("/tournament-finder",function(req,resp){
    let path=__dirname+"/public/tournament-finder.html";
    resp.sendFile(path);
    console.log("Path for tournament-finder page:"+path);
})

aapp.get("/get-all-tournaments",function(req,resp){
    let city=req.query.city;
    let game=req.query.game;

    mysqlServer.query("select * from tournaments where city=? and game=?",[city,game],function(err,jsonArray){

        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send(jsonArray);
        }
    })
})

aapp.get("/get-all-cities",function(req,resp){

    mysqlServer.query("select distinct city from tournaments",function(err,jsonArray){
        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send(jsonArray);
        }
    })
})

aapp.get("/get-all-games",function(req,resp){
    mysqlServer.query("select distinct game from tournaments",function(err,jsonArray){
        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send(jsonArray);
        }
    })
})


// -------------------------------------------------------------------- Player's Profile

aapp.get("/profilePlayer",function(req,resp){
    let path=__dirname+"/public/profilePlayer.html";
    resp.sendFile(path);
    console.log("The path of player profile is:"+path);
})

aapp.post("/save-player-profile",function(req,resp){
    mysqlServer.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",
    [
        req.body.txtEmail,
        req.body.txtName,
        req.body.txtGame,
        req.body.txtMno,
        req.body.dob,
        req.body.txtGender,
        req.body.txtAddress,
        req.body.txtCity,
        req.body.txtId,
        req.body.txtArea
    ],
    function(err){
        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send("Player Profile Saved With id:"+req.body.txtEmail);
        }
    })
})

aapp.post("/update-player-profile",function(req,resp){
    mysqlServer.query("update players set name=?, games=?, mobile=?, dob=?, genderaddress=?, city=?, idproof=?, otherinfo=? where email=?",
    [
        req.body.txtName,
        req.body.txtGame,
        req.body.txtMno,
        req.body.dob,
        req.body.txtGender,
        req.body.txtAddress,
        req.body.txtCity,
        req.body.txtId,
        req.body.txtArea,
        req.body.txtEmail

    ],function(err){
        if(err != null){
            resp.send(err.message);
        }
        else{
            resp.send("Updated successfully the data of:"+req.body.txtEmail);
        }
    })
})
