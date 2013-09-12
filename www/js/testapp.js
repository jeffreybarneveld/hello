/*
	NOTE:
	What follows is a mishmash of coding techniques put together as a rough
	test for the library. It it not intended as a "best practice" coding exmaple,
	but reather shows off some of the many approaches you can use to interact
	with the Jo framework.
*/
function init()
 {
   document.addEventListener("deviceready", deviceReady, true);
   //delete init;
 }
 
function deviceReady() {
	
	//Hieronder de app plakken
	
	
// required
jo.load();

// not required
jo.setDebug(true);

// placed in a module pattern, not a terrible idea for application level code
var App = (function() {
	var stack;
	var scn;
	var button;
	var backbutton;
	var page;
	var login;
	var test;
	var more;
	var option;
	var select;
	var moreback;
	var urldata;
	var list;
	var menu;
	var cssnode;
//	var blipsound = new joSound("blip2.wav");
//	var bloopsound = new joSound("blip0.wav");
	var cancelbutton;
	var testds;
        
	var opslag_instellingen_velden  = new Array();
	var opslag_instellingen_waarden = new Array();

        var nieuwerit;
        var instelrecord; //hierin de instellingen opslaan
        var instellingen; //hierin de kaart voor het instellingenformulier
        var db; //hierin de connectie naar de lokale database
var myList;
	/*
		EXAMPLE: if you want to configure what HTML tag and optional CSS class name a given
		UI class creates, you can change that by altering the properties in the class directly.
		NOTE: this should be done after jo is loaded, but before you create any new UI objects.
	*/
	// uncomment to try this out:
//		joInput.prototype.tagName = "input";
//		joInput.prototype.className = "stuff";

	function init() {		
		// silly, but you you can load style tags with a string
		// which may be moderately useful. the node is returned,
		// so in theory you could replace it or remove it.
		// a more practical case would be to use the loadCSS() method
		// to load in an additional stylesheet
		cssnode = joDOM.applyCSS(".htmlgroup { background: #fff; }");
		
		// more css, but deferred loading until after the app initializes
/*
		joDefer(function() {
//			bodycssnode = joDOM.loadCSS("../docs/html/doc.css");
			
			// dynamic CSS loading based on platform, in this case FireFox
			// doesn't do stack transitions well, so we're downshifting

//			if (jo.matchPlatform("iphone ipad safari"))
//				joDOM.loadCSS("../css/aluminum/webkit.css");
//			else if (jo.matchPlatform("chrome webkit webos"))
//				joDOM.loadCSS("../css/aluminum/webkit.css");
//				joDOM.loadCSS("../css/aluminum/chrome.css");
//			else
//				joDOM.loadCSS("../css/aluminum/gecko.css");
			
			// as an optimization, I recommend in a downloadable app that
			// you create a custom CSS file for each platform using some
			// sort of make-like process.
		}, this);
*/
		
		var toolbar;
		var nav;
		
		// hack for webOS touchpad browser event issue
		if (jo.matchPlatform("hpwos") && typeof PalmSystem === 'undefined')
			joEvent.touchy = false;
		
		menu = new joCard([
			list = new joMenu([
				{ title: "Nieuwe rit boeken",      id: "login"    },
				{ title: "Bekijk geboekte ritten", id: "textarea" },
				{ title: "Mijn gegevens",          id: "table"    },
				{ title: "TESTDATABASE",           id: "myCard"   },
				{ title: "Instellingen",           id: "instellingen" }
			])
		]).setTitle("Hoofdmenu");
		menu.activate = function() {
			// maybe this should be built into joMenu...
			list.deselect();
		};

		// chaining is supported on constructors and any setters		
		scn = new joScreen(
			new joContainer([
				new joFlexcol([
					nav = new joNavbar(),
					stack = new joStackScroller().push(menu),
					toolbar = new joToolbar("DVG personenvervoer")
				])
			])
		);
		
		nav.setStack(stack);
		
		// this is a bit of a hack for now; adds a CSS rule which puts enough
		// space at the bottom of scrolling views to allow for our floating
		// toolbar. Going to find a slick way to automagically do this in the
		// framework at some point.
		joDefer(function() {
			var style = new joCSSRule('jostack > joscroller > *:last-child:after { content: ""; display: block; height: ' + (toolbar.container.offsetHeight) + 'px; }');
		});
		
		var ex;
	

                // Instellingen scherm
		// our bogus login view
		instelrecord = new joRecord({ pasnummer:      "137251348",
			                      pwd:            "1966-04-10",
			                      email:          "jsbarneveld@gmail.com",
			                      terugbelnummer: "06-12345678",
			                      notifyme:       0
		}).setAutoSave(false);

		instelrecord.save = function ()
		                     { //some code here to save it to local database
				       StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("pasnummer")+'" where veld="pasnummer"',db);
				       StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("pwd")+'" where veld="pwd"',db);
				       StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("email")+'" where veld="email"',db);
				       StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("terugbelnummer")+'" where veld="terugbelnummer"',db);
				       StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("notifyme")+'" where veld="notifyme"',db);
				     }


		instellingen = new joCard([
			          new joGroup([
				     new joLabel("Pasnummer"),
				     new joFlexrow(nameinput = new joInput(instelrecord.link("pasnummer"))),
				     new joLabel("Wachtwoord"),
				     new joFlexrow(new joPasswordInput(instelrecord.link("pwd"))),
				     new joLabel("Standaard terugbelnummer"),
				     new joFlexrow(nameinput = new joInput(instelrecord.link("terugbelnummer"))),
				     new joLabel("E-mailadres"),
				     new joFlexrow(nameinput = new joInput(instelrecord.link("email"))),
				     new joFlexrow([
				        new joLabel("Pushberichten versturen?").setStyle("left"),
				        new joToggle(instelrecord.link("notifyme")).setLabels(["Nee", "Ja"])
				     ])
				  ]),
			          new joFooter([
				     new joDivider(),
				     button = new joButton("Test gegevens").selectEvent.subscribe(function()
					       {
						 var response = AjaxCall('http://jotest.vps2.netshaped.net/checklogin.php?pn='+instelrecord.getProperty("pasnummer")+'&pw='+instelrecord.getProperty("pwd"))
						 alert(response);
					       })
			          ])
		               ]).setTitle("Instellingen");

		instellingen.activate = function() {
			instelrecord.setAutoSave(true); //zodra deze card geactiveerd wordt de autosave aanzetten. Vooraf is e.e.a. ingeladen vanuit database
			joGesture.defaultEvent.capture(button.select, button);
		};
		
		instellingen.deactivate = function() {
			joGesture.defaultEvent.release(button.select, button);
		};
			       
                //Einde instellingenscherm functie

		testds = new joRecord({
			uid: "jo",
			pwd: "password",
			num: 0,
			fruit: 0,
			active: true,
			note: 0
		}).setAutoSave(false);
		
		// our bogus login view
		login = new joCard([
			new joGroup([
				new joLabel("Username"),
				new joFlexrow(nameinput = new joInput(testds.link("uid"))),
				new joLabel("Password"),
				new joFlexrow(new joPasswordInput(testds.link("pwd"))),
				new joLabel("Options"),
				new joFlexrow(option = new joOption([
					"One", "Two", "Three", "Four", "Five"
				], testds.link("num")).selectEvent.subscribe(function(value) {
					console.log("option selected: " + value);
				})),
				new joLabel("Selection"),
				select = new joSelect([
					"Apple", "Orange", "Banana", "Grape", "Cherry", "Mango"
				], testds.link("fruit")),
				new joFlexrow([
					new joLabel("Activate").setStyle("left"),
					new joToggle(testds.link("active"))
				]),
				new joFlexrow([
					new joLabel("Notify").setStyle("left"),
					new joToggle(testds.link("note")).setLabels(["No", "Yes"])
				])
			]),
			new joDivider(),
			ex = new joExpando([
				new joExpandoTitle("Advanced Settings"),
				new joExpandoContent([
					new joLabel("Domain"),
					new joFlexrow(new joInput("localhost")),
					new joLabel("Port"),
					new joFlexrow(new joInput("80"))
				])
			]).openEvent.subscribe(function() {
				stack.scrollTo(ex);
				console.log("scrollto");
			}),
			new joFooter([
				new joDivider(),
				button = new joButton("Login"),
				cancelbutton = new joButton("Back")
			])
		]).setTitle("Form Widget Demo");
		
		login.activate = function() {
			joGesture.defaultEvent.capture(button.select, button);
		};
		
		login.deactivate = function() {
			joGesture.defaultEvent.release(button.select, button);
		};
		
//	was demoing how to disable a control, but decided having a "back"
// button was more important right now
//		cancelbutton.disable();
		cancelbutton.selectEvent.subscribe(back, this);
		
		// some arbitrary HTML shoved into a joHTML control
		var html = new joHTML('<h1>Disclaimer</h1><p>This is a disclaimer. For more information, you can check <a href="moreinfo.html">this <b>file</b></a> for more info, or try your luck with <a href="someotherfile.html">this file</a>.');
		var htmlgroup;
		
		page = new joCard([
			new joLabel("HTML Control"),
			htmlgroup = new joGroup(html),
			new joCaption("Note that the HTML control above is using another stylesheet without impacting our controls."),
			new joFooter([
				new joDivider(),
				backbutton = new joButton("Back")
			])
		]).setTitle("Success");
		
		htmlgroup.setStyle("htmlgroup");
		
		more = new joCard([
			new joGroup([
				new joCaption("Good job! This is more info. Not very informative, is it?"),
				new joCaption(urldata = new joDataSource(""))
			]),
			new joFooter([
				new joDivider(),
				moreback = new joButton("Back Again")
			])
		]).setTitle("URL Demo");

		list.selectEvent.subscribe(function(id) {
			if (id == "login")
				stack.push(login);
			else if (id == "instellingen")
				stack.push(instellingen);
			else if (id == "myCard")
				stack.push(myCard);
			else if (id == "popup")
				scn.alert("Hello!", "Is this the popup you were looking for? This is a very simple one; you can put much more in a popup if you were inclined.", function() { list.deselect(); });
			else if (id != "help")
				stack.push(joCache.get(id, 2, { fart: "nugget"}));
		}, this);
		
		// we can defer creating views until they're needed
		// using joCache
		joCache.set("test", function() {
			var back;

			joLog("creating test view on demand");

			var card = new joCard([
				new joGroup([
					new joCaption("This view was created on-demand using joCache.get('test'). From now on,"
					+ "this view will not be recreated, but pulled from the cache.")
				]),
				new joDivider(),
				back = new joButton("Back")
			]).setTitle("On-Demand View");

			back.selectEvent.subscribe(function() {
				stack.pop();
			});

			return card;
		}, this);
		
		joCache.set("textarea", function() {
			var back;

			var card = new joCard([
				new joLabel(),
				new joFlexrow(new joTextarea("Here is some sample text in a multiline joTextarea control."
				+ " As you type, it will grow, but stop at its max height.").setStyle({
					minHeight: "100px",
					maxHeight: "300px"
				})),
				new joDivider(),
				back = new joButton("Back")
			]).setTitle("Auto-sized Text Area");

			back.selectEvent.subscribe(function() {
				stack.pop();
			});

			return card;
		}, this);
		
		joCache.set("table", function(v, a, b) {
			joLog("v", v, "a", a, "b", b);
			var back;
			
			var card = new joCard([
				new joGroup(
					new joTable([
						["Name", "Phone", "Email"],
						["Bob", "555-1234", "bob@bob.not"],
						["Candy", "555-2345", "candy@candy.not"],
						["Doug", "555-3456", "doug@doug.not"],
						["Evan", "555-4567", "evan@evan.not"],
						["Frank", "555-5678", "frank@frank.not"]
					]).selectEvent.subscribe(function(index, table) {
						joLog("table cell:", table.getRow(), table.getCol());
					}, this).setStyle({width: "100%"})
				),
				new joDivider(),
				back = new joButton("Back")
			]).setTitle("Table Demo");

			back.selectEvent.subscribe(function() {
				stack.pop();
			});

			return card;
		});

		joCache.set("remote", function() {
			var container, firstbutton;
			
			var card = new joCard([
				container = new joFlexcol([
					new joFlexrow([
						firstbutton = new joButton("1"),
						new joButton("2"),
						new joButton("3")
					]),
					new joFlexrow([
						new joButton("4"),
						new joButton("5"),
						new joButton("6")
					]),
					new joFlexrow([
						new joButton("7"),
						new joButton("8"),
						new joButton("9")
					]),
					new joFlexrow([
						new joButton("."),
						new joButton("0").setStyle("double")
					])
				]).setStyle("remote"),
				new joDivider(),
				new joButton("Back").selectEvent.subscribe(function() {
					stack.pop();
				}, this)
			]).setTitle("Remote Example");

			// yeah, we did this -- should be in your app's own CSS, but hey
			var x = new joCSSRule("joflexcol.remote jobutton { -webkit-box-shadow: 0 1px 5px rgba(0, 0, 0, .6); width: 33%; margin-right: 0; } joflexcol.remote jobutton.focus { -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, .8); } joflexcol.remote jobutton:last-child {margin-right: 10px;} joflexcol.remote jobutton.double { width: 66%; } joflexcol.remote { margin-top: 10px; height: 100%; }");

			// we want our button font to scale, so we add this interesting bit
			adjustfont();
			card.activate = function() {
				joDefer(adjustfont, this, 500);
			};
			joEvent.on(window, "resize", card.activate, this);

			function adjustfont() {
				var c = firstbutton.container;
				var h = c.offsetHeight - 20;
				var w = c.offsetWidth - 20;
				
				var size = ((w > h) ? h : w) * .8;
				container.setStyle({
					lineHeight: h + "px",
					fontSize: size + "px"
				});

				// our card needs to adjust with the new window size
				// because we're doing a fixed-size card -- not the
				// best idea, this should be a subclass of joCard in
				// the framework.
				card.setStyle({
					height: "100%"
				});
			}

			return card;
		});


		moreback.selectEvent.subscribe(function() { stack.pop(); }, this);
		button.selectEvent.subscribe(click.bind(this));
		backbutton.selectEvent.subscribe(back, this);
		html.selectEvent.subscribe(link, this);
		
		stack.pushEvent.subscribe(blip, this);
		stack.popEvent.subscribe(bloop, this);
		
		joGesture.forwardEvent.subscribe(stack.forward, stack);
		joGesture.backEvent.subscribe(stack.pop, stack);
		
		document.body.addEventListener('touchmove', function(e) {
		    e.preventDefault();
			joEvent.stop(e);
		}, false);

//		stack.push(menu);
	}
	
	function blip() {
//		blipsound.play();
	}
	
	function bloop() {
//		bloopsound.play();
	}
	
	function link(href) {
		joLog("HTML link clicked: " + href);
		urldata.setData(href);
		stack.push(more);
	}
	
	function click() {
		stack.push(page);
	}
	
	function back() {
		stack.pop();
	}

	function initDatabases()
	 { //deze functie regelt dat er lokaal de juiste SQL-databases zijn

           db = OpenDatabaseConnectie('taxiDB');

	   StuurQuery('create table if not exists instellingen(veld string, waarde string)',db);

           var gevonden = new Array();
	   var velden   = new Array('pasnummer','pwd','email','terugbelnummer','notifyme');
           db.transaction(function (tx) {
             tx.executeSql('SELECT * FROM instellingen', [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                       gevonden[i] = results.rows.item(i).veld;
                    }

		    len = velden.length;
                    for (i = 0; i < len; i++)
		     {
		       if (!in_array(velden[i],gevonden))
		        { //record niet gevonden: toevoegen dus
			  StuurQuery('insert into instellingen (veld,waarde) values ("'+velden[i]+'","")',db);
			}
                     }

                  }, null);
           });		
	   
//	   StuurQuery('delete from instellingen',db);
//	   StuurQuery('insert into instellingen (veld,waarde) values ("pasnummer","1234")',db);
//	   StuurQuery('insert into instellingen (veld,waarde) values ("pwd","test")',db);
//	   StuurQuery('insert into instellingen (veld,waarde) values ("email","1234")',db);
//	   StuurQuery('insert into instellingen (veld,waarde) values ("terugbelnummer","06-1234")',db);
//	   StuurQuery('insert into instellingen (veld,waarde) values ("notifyme","1")',db);

/**	   
           db.transaction(function (tx) {  
             tx.executeSql('create table if not exists instellingen(veld string, waarde string)');
//             tx.executeSql('insert into instellingen (veld,waarde) values ("testje A","waarde A")');
//             tx.executeSql('insert into instellingen (veld,waarde) values ("testje B","waarde B")');
           });

           db.transaction(function (tx) {
             tx.executeSql('SELECT * FROM instellingen', [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i;
                    msg = "<p>Found rows: " + len + "</p>";
                    //document.querySelector('#status').innerHTML +=  msg;
                    for (i = 0; i < len; i++){
                       alert(results.rows.item(i).veld );
                    }
                  }, null);
           });		
**/

	   //tabel voor ritten
	   //....
		
	 }
      //  initDatabases();
	//laadInstellingen();	

        function laadInstellingen()
	 {
	   var tst
           db.transaction(function (tx) {
             tx.executeSql('SELECT * FROM instellingen', [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i;
                    msg = "<p>Found rows: " + len + "</p>";
                    //document.querySelector('#status').innerHTML +=  msg;
                    for (i = 0; i < len; i++)
		     {
		       instelrecord.setProperty(results.rows.item(i).veld,results.rows.item(i).waarde);
                     }
                  }, null);
           });			   
	 }

	
	function OpenDatabaseConnectie(naam)
	 { 
	   var dbconn = openDatabase(naam, '1.0', 'Test DB', 2 * 1024 * 1024);
	   return(dbconn)
	 }

	function StuurQuery(query,db)
	 { //resultaat wordt verwerkt in db
           db.transaction(function (tx) {  
             tx.executeSql(query);
           });
	 }

	function StuurSelectQuery(query,db,resultaten)
	 { //resultaat wordt verwerkt in db. Return array met resultaten
           db.transaction(function (tx) {  
             tx.executeSql(query, [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                       //alert(results.rows.item(i) );
		       resultaten[i] = results.rows.item(i);
                    }
                  }, null);
           });
	 }
	 
/***	
        //Test met aanmaak/lezen database
        var db = new joDatabase().open("myDB", 1048576);
	var ds = new joSQLDataSource(db);
        var dl = new joSQLDataSource(db);
        ds.execute("create table if not exists books(id integer, author string, title string)",[]);
        //ds.execute("insert into books (id, author, title) values (?,?,?);",[1, "author A", "book A"]);	

        dl.changeEvent.subscribe(function(data) {
           myList.setData(data);
        });

        myCard = new joCard([ myList = new joList(),
                            ]).setTitle("Books");
        myCard.activate = function() {
                                       dl.execute("select * from books;");
                                     };
	myList.setDefault("No books have been saved.");

        myList.formatItem = function(data, index) {

              display = data.title + ' by ' + data.author;
              return joList.prototype.formatItem.call(this, display, index);
         };	
*****/	

        function in_array(needle, haystack)
	 {
           for(var i in haystack) {
             if(haystack[i] == needle) return true;
            }
           return false;
         }

        function AjaxCall(url)
         {
           var xhReq = new XMLHttpRequest();
           xhReq.open("GET", url, false);
           xhReq.send(null);
           var serverResponse = xhReq.responseText;
           return(serverResponse)
         }
 	 
	// public stuff
	return {
		init: init,
		getData: function() { return testds; },
		getStack: function() { return stack; },
		getButton: function() { return button; },
		getSelect: function() { return select; },
		getOption: function() { return option; },
		getRecord: function() { return testds; }
	}
}());

}


