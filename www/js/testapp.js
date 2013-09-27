/*
	NOTE:
	What follows is a mishmash of coding techniques put together as a rough
	test for the library. It it not intended as a "best practice" coding exmaple,
	but reather shows off some of the many approaches you can use to interact
	with the Jo framework.
*/
function PGinit()
 {
   document.addEventListener("deviceready", deviceReady, true);
   //delete init;
 }
 
function deviceReady() {
	
	//Hieronder de app plakken
//alert("start app");	






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
	var cancelbutton;
	var testds;
        
        var nieuwerit;
        var instelrecord; //hierin de instellingen opslaan
        var instellingen; //hierin de kaart voor het instellingenformulier
        var resetbutton;

        var vertrekarray = new Array();
	var aankomstarray = new Array();
	
	var db   = openDatabase('undefined', '1.0', 'Test DB', 2 * 1024 * 1024);  //database voor kale instellingen
        var jodb = new joDatabase().open("taxiDB", 1048576); //jodatabase voor vullen van pulldowns enzo
	var jods = new joSQLDataSource(jodb); //data source voor jolist queries etc
	
	function init()
         {		
	   cssnode = joDOM.applyCSS(".htmlgroup { background: #fff; }");
	   var toolbar;
	   var nav;
		
	   // hack for webOS touchpad browser event issue
	   if (jo.matchPlatform("hpwos") && typeof PalmSystem === 'undefined') joEvent.touchy = false;
           
//////////////////////////////////////////////////////////
/////// INSTELLINGEN /////////////////////////////////////
//////////////////////////////////////////////////////////
           
           //eerst de instellingen definieren
	   instelrecord = new joRecord({ pasnummer:      "",
			                pwd:            "",
			                email:          "",
			                terugbelnummer: "",
			                notifyme:       0,
					userhash:       ""
		                      }).setAutoSave(false);

           instelrecord.save = function ()
		                { //some code here to save it to local database
			 	  StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("pasnummer")+'" where veld="pasnummer"',db);
		 		  StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("pwd")+'" where veld="pwd"',db);
				  StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("email")+'" where veld="email"',db);
				  StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("terugbelnummer")+'" where veld="terugbelnummer"',db);
				  StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("notifyme")+'" where veld="notifyme"',db);
				  StuurQuery('update instellingen set waarde="'+instelrecord.getProperty("userhash")+'" where veld="userhash"',db);
			        }
                               
           menu = new joCard([ list = new joMenu([
				           { title: "<img src='/images/icons/Plus.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Nieuwe rit boeken",      id: "nieuwerit"    },
                    			   { title: "<img src='/images/icons/Doc.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Geboekte ritten", id: "geboekt" },
 				           //{ title: "testlijst", id: "myCard" },
//				           { title: "Ritoverzicht",           id: "ritoverzicht" },
                    			   { title: "<img src='/images/icons/Tools.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Mijn gegevens", id: "instellingen" },
				           { title: "<img src='/images/icons/Info.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Over deze app",          id: "infoscherm" }
 				           //{ title: "testlijst", id: "myCard" },
			                         ])
		             ]).setTitle("<img src='/images/icons/Home.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Hoofdmenu");
	   menu.activate = function() { // maybe this should be built into joMenu...
			                list.deselect();
		                      };

           // chaining is supported on constructors and any setters		
	   scn = new joScreen(
			new joContainer([
				new joFlexcol([
					nav = new joNavbar(),
					stack = new joStackScroller().push(menu),
					toolbar = new joToolbar("<img src='/images/bottomlogo-dvg.png'>")
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

//infologo-dvg.png	   
           // Informatie scherm
	   infoscherm = new joCard([
			   new joGroup([
			      new joHTML('<div style="text-align:center;"><img style="width:300px;" src="/images/infologo-dvg.png"></div><h1>Zittend ZiekenVervoer App</h1>Met deze app kunt u ritten boeken voor zittend ziekenvervoer zolang u een geldige machtiging hiervoor heeft. Deze ritten worden vergoed door de volgende ziektekostenverzekeraars:<ul><li>Verzekeraar X</li><li>Andere verzekeraar</li><li>Derde verzekeraar</li></ul>')
				       ]),
			          new joFooter([
				     new joDivider(),
				     button = new joButton("OK").selectEvent.subscribe(function()
					       {
						    stack.pop();
					       })
			                       ])
		               ]).setTitle("<img src='/images/icons/Info.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Over deze app");


           // Instellingen scherm
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
				        new joLabel("Wilt u herinneringen ontvangen?").setStyle("left"),
				        new joToggle(instelrecord.link("notifyme")).setLabels(["Nee", "Ja"])
				     ])
				  ]),
			          new joFooter([
				     new joDivider(),
				     button = new joButton("OK").selectEvent.subscribe(function()
					       {
						 var response = AjaxCall('http://tcrcentrale.netshaped.net/10/login/check/'+instelrecord.getProperty("pasnummer")+'/'+instelrecord.getProperty("pwd"))
						 var jsObject = JSON.parse(response);
						 if (jsObject.status==1)
						  {
				                    instelrecord.setProperty("userhash",jsObject.userhash);
  				                    StuurQuery('update instellingen set waarde="'+jsObject.userhash+'" where veld="userhash"',db);
						    stack.pop();
						  }
						 else
						  {
	  					    alert("De combinatie van pasnummer en wachtwoord is niet correct!");							
						  }
						  
					       }),
				     resetbutton = new joButton("Wis gegevens").selectEvent.subscribe(function()
					       {
						 instelrecord.setProperty('userhash',"");
						 instelrecord.setProperty('pasnummer',"");
						 instelrecord.setProperty('pwd',"");
						 instelrecord.setProperty('email',"");
						 instelrecord.setProperty('terugbelnummer',"");
						 instelrecord.setProperty('notifyme',"");
					       })
			          ])
		               ]).setTitle("<img src='/images/icons/Tools.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Mijn gegevens");

		instellingen.activate = function() {
			instelrecord.setAutoSave(true); //zodra deze card geactiveerd wordt de autosave aanzetten. Vooraf is e.e.a. ingeladen vanuit database
			joGesture.defaultEvent.capture(button.select, button);
		};
		
		instellingen.deactivate = function() {
			joGesture.defaultEvent.release(button.select, button);
		};
			       







//////////////////////////////////////////////////////////
/////// NIEUWE RIT   /////////////////////////////////////
//////////////////////////////////////////////////////////
		

           // Nieuwe rit scherm
	   var inittime = new Date();
	   var day       = inittime.getDate(); if (day<10){ day="0"+day; }
	   var month     = inittime.getMonth()+1; if (month<10){ month="0"+month; }
	   var year      = inittime.getFullYear();
		
	   ritrecord = new joRecord({ vertrekadres :      "vertrekadres",             //weergave in ritverzamelscherm
				      vertrekid    :      "",                         //leeg=niets -1=los adres
			              aankomstadres:      "aankomstadres",            //weergave in ritverzamelscherm
			              aankomstid   :      "",                         //leeg=niets -1=los adres
			              tijdstip:           day+"-"+month+"-"+year+" 09:00",
			              aantalpersonen:     0,
				      rolstoel:           0,
			              hulpmiddelen:       0,
				      terugbelnummer:     "",
				      ritdatum:           inittime.getDay()+"-"+inittime.getMonth()+"-"+inittime.getFullYear(),
				      rituur:             3,
				      ritminuut:          0,
				      vertrekstraat:      "", //opslag van het geselecteerde adres voor vertrek
				      vertrekhuisnummer:  "",
				      vertrektoevoeging:  "",
				      vertrekpostcode:    "",
				      vertrekplaats:      "",
				      aankomststraat:     "", //en aankomst
				      aankomsthuisnummer: "",
				      aankomsttoevoeging: "",
				      aankomstpostcode:   "",
				      aankomstplaats:     ""
		}).setAutoSave(true);

	   ritrecord.save = function ()
		                     { //some code here to save it to local database
				       var tempuur = 6+1*ritrecord.getProperty("rituur");
				       if (tempuur<10) { tempuur="0"+1*tempuur; }
				       var tempminuut = ritrecord.getProperty("ritminuut")*5;
				       if (tempminuut<10) { tempminuut="0"+tempminuut; }
				       ritrecord.tijdstip = tempuur+":"+tempminuut;
				       ritrecord.setProperty("tijdstip",ritrecord.getProperty("ritdatum")+" "+tempuur+":"+tempminuut);
				     }

	   ritrecord.activate = function() {
		  //laad de pulldowns in voor de machtigingen bijv
		  updateAdresPulldowns()
		};
				     
           //ondersteunend record voor het vertrekadres qua los in te vullen adres (de velden zelf)
	   vertrekrecord = new joRecord({ postcode :  "",
			                  huisnummer: "",
			                  toevoeging: "",
			                  straat:     "",
			                  plaats:     ""
		                        }).setAutoSave(true);
           vertrekrecord.save = function ()
	       { //some code here to save it to local database
		 var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/ph2sp/"+vertrekrecord.getProperty("postcode")+"/"+vertrekrecord.getProperty("huisnummer"))
	         var jsObject = JSON.parse(response);
		 if (jsObject.status==1)
		  { //gevonden!
	   	    vertrekrecord.setAutoSave(false); //even uitzetten anders wordt dit driedubbel aangeroepen
		    vertrekrecord.setProperty("straat",jsObject.straat)
		    vertrekrecord.setProperty("plaats",jsObject.plaats)
	   	    vertrekrecord.setAutoSave(true); //en weer aan
		  }
		 //Verwerk het huidige vertrekadres in het hoofdoverzicht ritrecord
		 ritrecord.setProperty("vertrekadres",vertrekrecord.getProperty("straat")+" "+vertrekrecord.getProperty("huisnummer")+vertrekrecord.getProperty("toevoeging")+" "+vertrekrecord.getProperty("postcode")+" "+vertrekrecord.getProperty("plaats"))
	       }			       

           //ondersteunend record voor het aankomstadres qua los in te vullen adres (de velden zelf)
	   aankomstrecord = new joRecord({ postcode :  "",
			                  huisnummer: "",
			                  toevoeging: "",
			                  straat:     "",
			                  plaats:     ""
		                        }).setAutoSave(true);
           aankomstrecord.save = function ()
	       { //some code here to save it to local database
		 var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/ph2sp/"+vertrekrecord.getProperty("postcode")+"/"+vertrekrecord.getProperty("huisnummer"))
	         var jsObject = JSON.parse(response);
		 if (jsObject.status==1)
		  { //gevonden!
	   	    aankomstrecord.setAutoSave(false); //even uitzetten anders wordt dit driedubbel aangeroepen
		    aankomstrecord.setProperty("straat",jsObject.straat)
		    aankomstrecord.setProperty("plaats",jsObject.plaats)
	   	    aankomstrecord.setAutoSave(true); //en weer aan
		  }
		 //Verwerk het huidige aankomstadres in het hoofdoverzicht ritrecord
		 ritrecord.setProperty("aankomstadres",aankomstrecord.getProperty("straat")+" "+aankomstrecord.getProperty("huisnummer")+aankomstrecord.getProperty("toevoeging")+" "+aankomstrecord.getProperty("postcode")+" "+aankomstrecord.getProperty("plaats"))
	       }			       
             
	   var vertrekbutton;
	   var aankomstbutton;
	   var tijdstipbutton;
	   var aantalpersonenbutton;
	   var hulpmiddelbutton;
	   nieuwerit = new joCard([
		          new joGroup([
                                new joHTML('<div id="progress" style="z-index:1000;display:none;"><div style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;width:100%;height:100%;background-color:black;z-index:900;filter:alpha(opacity=60);opacity:.6;"></div><img src="/images/loader.png" class="loadingimage"></div>'),
                                new joLabel("Vertrek adres"),
				vertrekbutton = new joButton(ritrecord.link("vertrekadres")).selectEvent.subscribe(function()
				     {
					stack.push(vertrekadresselect)
				     }),
				new joLabel("Aankomst adres <img src='/images/icons/Redo.png' style='height:20px;vertical-align:middle;position:absolute;left:50%;margin-top:-5px;margin-left:10px;'>"),
				aankomstbutton = new joButton(ritrecord.link("aankomstadres")).selectEvent.subscribe(function()
				     {
					stack.push(aankomstadresselect)
				     }),
				new joLabel("Tijdstip"),
				tijdstipbutton = new joButton(ritrecord.link("tijdstip")).selectEvent.subscribe(function()
					       { stack.push(tijdstipselect)
					       }),
				new joLabel("Aantal personen"),
				hulpmiddelbutton = new joSelect([
					"1", "2", "3"
				     ], ritrecord.link("aantalpersonen")),
				new joLabel("Rolstoel"),
				rolstoelbutton = new joSelect([
					"geen", "duwrolstoel", "elektrisch", "scootmobiel", "opvouwbaar"
				     ], ritrecord.link("rolstoel")),
				new joLabel("Hulpmiddelen"),
				hulpmiddelbutton = new joSelect([
					"geen", "rollator", "blindegeleide/sociale hond", "opvouwbare kinderwagen", "eigen stoelverhoger/zitje"
				     ], ritrecord.link("hulpmiddelen")),
				new joLabel("Terugbelnummer"),
				new joFlexrow(nameinput = new joInput(ritrecord.link("terugbelnummer")))
				  ]),
			        new joFooter([
				     new joDivider(),
				     button = new joButton("OK").selectEvent.subscribe(function()
				      {  joDOM.get("progress").style.display="block";
					 var msg = VerstuurRit();
                                      }),
				     backbutton = new joButton("Annuleren").selectEvent.subscribe(function()
					             {
							stack.pop();
                                                     })
				     ])
				]).setTitle("<img src='/images/icons/Plus.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Nieuwe rit boeken");

		nieuwerit.activate = function() {
//			ritrecord.setAutoSave(true); //zodra deze card geactiveerd wordt de autosave aanzetten. Vooraf is e.e.a. ingeladen vanuit database
//			joGesture.defaultEvent.capture(button.select, button);
			sorteerAdresPulldowns()
                 };
		
		nieuwerit.deactivate = function() {
			joGesture.defaultEvent.release(button.select, button);
		};
			       




//////////////////////////////////////////////////////////
/////// KIES EEN VERTREKADRES   //////////////////////////
//////////////////////////////////////////////////////////

		var vertrekadresselect
		var vvadressel

		//Nu de schermen voor de ritselecties maken
		vertrekadresselect = new joCard([
		   new joGroup([
		      new joLabel("Gebruik een adres uit uw machtiging(en) of eerdere rit"),
		      vvadressel = new joList([],ritrecord.link("vertrekid")).selectEvent.subscribe(function(dat) { gebruikAdresPulldowns("vertrek",dat);stack.pop();  }),
					      ]),
		   new joGroup([
		      new joLabel("Of vul hieronder een ander adres in"),
	   	      new joGroup([
			 new joLabel("Postcode"),
			 new joFlexrow(nameinput = new joInput(vertrekrecord.link("postcode"))),
			 new joLabel("Huisnummer"),
			 new joFlexrow(new joInput(vertrekrecord.link("huisnummer"))),
			 new joLabel("Toevoeging"),
			 new joFlexrow(new joInput(vertrekrecord.link("toevoeging"))),
			 new joLabel("Straat"),
			 new joFlexrow(nameinput = new joInput(vertrekrecord.link("straat"))),
			 new joLabel("Plaats"),
			 new joFlexrow(nameinput = new joInput(vertrekrecord.link("plaats"))),
			 usebutton = new joButton("gebruik dit adres").selectEvent.subscribe(function()
				{
				  //Zet het gekozen adres uit de lijst (vertrekid) op ""
				  ritrecord.setProperty("vertrekid","")

				  //Neem het ingevulde adres over in de nieuwe rit (ritrecord)
				  ritrecord.setProperty("vertrekstraat",vertrekrecord.getProperty("straat"))
				  ritrecord.setProperty("vertrekhuisnummer",vertrekrecord.getProperty("huisnummer"))
				  ritrecord.setProperty("vertrektoevoeging",vertrekrecord.getProperty("toevoeging"))
				  ritrecord.setProperty("vertrekpostcode",vertrekrecord.getProperty("postcode"))
				  ritrecord.setProperty("vertrekplaats",vertrekrecord.getProperty("plaats"))
	
				  //Verwerk het huidige vertrekadres in het hoofdoverzicht ritrecord qua weergave
				  ritrecord.setProperty("vertrekadres",vertrekrecord.getProperty("straat")+" "+vertrekrecord.getProperty("huisnummer")+vertrekrecord.getProperty("toevoeging")+" "+vertrekrecord.getProperty("postcode")+" "+vertrekrecord.getProperty("plaats"))

				  //Sluit het extra scherm
				  stack.pop();
			        })
			  ])
			]),
		   new joFooter([
		      new joDivider(),
		      button = new joButton("terug").selectEvent.subscribe(function()
					             {
							stack.pop();
                                                     })
				     ])
		               ]).setTitle("<img src='/images/icons/Magnifier.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Vertrekadres selecteren");

	        var nieuweritdl = new joSQLDataSource(jodb); //data source voor jolist queries etc
	        nieuweritdl.changeEvent.subscribe(function(data) { vvadressel.setData(data);  });
                vvadressel.formatItem = function(data, index)
	         {
                   display = data.combi; //hier evt velden combineren
                   return joList.prototype.formatItem.call(this, display, index);
                 }	   
		
                vertrekadresselect.activate = function ()
		 {
	           nieuweritdl.execute("select * from adrespulldown order by volgnr;");
		 }

                //de save-functie van het vertrekrecord wordt gebruikt om postcode-tabel-lookups te triggeren
                vertrekrecord.save = function ()
		                     { //some code here to save it to local database
				       var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/ph2sp/"+vertrekrecord.getProperty("postcode")+"/"+vertrekrecord.getProperty("huisnummer"))
	                               var jsObject = JSON.parse(response);
				       if (jsObject.status==1)
				        { //gevonden!
	   		                  vertrekrecord.setAutoSave(false); //even uitzetten anders wordt dit driedubbel aangeroepen
				          vertrekrecord.setProperty("straat",jsObject.straat)
				          vertrekrecord.setProperty("plaats",jsObject.plaats)
	   		                  vertrekrecord.setAutoSave(true); //en weer aan
					}
				     }			       
			  
			  
			  
			  
			  
			       
//////////////////////////////////////////////////////////
/////// KIES EEN AANKOMSTADRES   /////////////////////////
//////////////////////////////////////////////////////////

		var aankomstadresselect
		var toadressel

		//Nu de schermen voor de ritselecties maken
		aankomstadresselect = new joCard([
		   new joGroup([
		      new joLabel("Gebruik een adres uit uw machtiging(en) of eerdere rit"),
		      toadressel = new joList([],ritrecord.link("aankomstid")).selectEvent.subscribe(function(dat) { gebruikAdresPulldowns("aankomst",dat);stack.pop();  }),
					      ]),
		   new joGroup([
		      new joLabel("Of vul hieronder een ander adres in"),
	   	      new joGroup([
			 new joLabel("Postcode"),
			 new joFlexrow(nameinput = new joInput(aankomstrecord.link("postcode"))),
			 new joLabel("Huisnummer"),
			 new joFlexrow(new joInput(aankomstrecord.link("huisnummer"))),
			 new joLabel("Toevoeging"),
			 new joFlexrow(new joInput(aankomstrecord.link("toevoeging"))),
			 new joLabel("Straat"),
			 new joFlexrow(nameinput = new joInput(aankomstrecord.link("straat"))),
			 new joLabel("Plaats"),
			 new joFlexrow(nameinput = new joInput(aankomstrecord.link("plaats"))),
			 useabutton = new joButton("gebruik dit adres").selectEvent.subscribe(function()
				{
				  //Zet het gekozen adres uit de lijst (aankomstid) op ""
				  ritrecord.setProperty("aankomstid","")

				  //Neem het ingevulde adres over in de nieuwe rit (ritrecord)
				  ritrecord.setProperty("aankomststraat",aankomstrecord.getProperty("straat"))
				  ritrecord.setProperty("aankomsthuisnummer",aankomstrecord.getProperty("huisnummer"))
				  ritrecord.setProperty("aankomsttoevoeging",aankomstrecord.getProperty("toevoeging"))
				  ritrecord.setProperty("aankomstpostcode",aankomstrecord.getProperty("postcode"))
				  ritrecord.setProperty("aankomstplaats",aankomstrecord.getProperty("plaats"))
	
				  //Verwerk het huidige vertrekadres in het hoofdoverzicht ritrecord qua weergave
				  ritrecord.setProperty("aankomstadres",aankomstrecord.getProperty("straat")+" "+aankomstrecord.getProperty("huisnummer")+aankomstrecord.getProperty("toevoeging")+" "+aankomstrecord.getProperty("postcode")+" "+aankomstrecord.getProperty("plaats"))

				  //Sluit het extra scherm
				  stack.pop();
			        })
			  ])
			]),
		   new joFooter([
		      new joDivider(),
		      button = new joButton("terug").selectEvent.subscribe(function()
					             {
							stack.pop();
                                                     })
				     ])
		               ]).setTitle("<img src='/images/icons/Magnifier.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Aankomstadres selecteren");

	        var nieuweritadl = new joSQLDataSource(jodb); //data source voor jolist queries etc
	        nieuweritadl.changeEvent.subscribe(function(data) { toadressel.setData(data);  });
                toadressel.formatItem = function(data, index)
	         {
                   display = data.combi; //hier evt velden combineren
                   return joList.prototype.formatItem.call(this, display, index);
                 }	   
		
                aankomstadresselect.activate = function ()
		 {
	           nieuweritadl.execute("select * from adrespulldown order by volgnr;");
		 }

                //de save-functie van het aankomstrecord wordt gebruikt om postcode-tabel-lookups te triggeren
                aankomstrecord.save = function ()
		                     { //some code here to save it to local database
				       var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/ph2sp/"+vertrekrecord.getProperty("postcode")+"/"+vertrekrecord.getProperty("huisnummer"))
	                               var jsObject = JSON.parse(response);
				       if (jsObject.status==1)
				        { //gevonden!
	   		                  aankomstrecord.setAutoSave(false); //even uitzetten anders wordt dit driedubbel aangeroepen
				          aankomstrecord.setProperty("straat",jsObject.straat)
				          aankomstrecord.setProperty("plaats",jsObject.plaats)
	   		                  aankomstrecord.setAutoSave(true); //en weer aan
					}
				     }			       

				     
//////////////////////////////////////////////////////////
/////// KIES EEN TIJDSTIP  ///////////////////////////////
//////////////////////////////////////////////////////////
				     
		var d         = new Date();
		var ts        = d.valueOf();
		var curts;
		var rd        = new Date();
		var day       = d.getDate();
		var dayofweek = d.getDay();
		var month     = d.getMonth();
		var year      = d.getFullYear();
		var col;
                var startdag  = (dayofweek-1)*24*3600*1000; //bepaal delta tot start van deze week
		var datums    = new Array();
		var setdatums = new Array();
		var sel1
		var sel2

		for (var i=0; i<21; i++)
		 {
		   curts = ts-startdag + (i*24*3600*1000); //bepaal ts steeds dag verder
		   rd.setTime(curts); //stel rd-object op berekende tijd in
		   datums[i]=rd.getDate();//+' '+rd.getMonth();
		   day       = rd.getDate(); if (day<10) { day="0"+day; }
		   month     = rd.getMonth()+1; if (month<10) { month="0"+month; }
		   year      = rd.getFullYear(); 
		   setdatums[i]=day+"-"+month+"-"+year;
		 }
		
                tijdstipselect = new joCard([
				container = new joFlexcol([
				        new joLabel("deze week"),
					new joFlexrow([
						new joLabel("&nbsp;&nbsp;ma"),
						new joLabel("&nbsp;&nbsp;di"),
						new joLabel("&nbsp;&nbsp;wo"),
						new joLabel("&nbsp;&nbsp;do"),
						new joLabel("&nbsp;&nbsp;vr"),
						new joLabel("&nbsp;&nbsp;za"),
						new joLabel("&nbsp;&nbsp;zo")
					]),
					new joFlexrow([
						firstbutton = new joButton(datums[0]),
						new joButton(datums[1]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[1]) }),
						new joButton(datums[2]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[2]) }),
						new joButton(datums[3]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[3]) }),
						new joButton(datums[4]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[4]) }),
						new joButton(datums[5]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[5]) }),
						new joButton(datums[6]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[6]) })
					]),
				        new joLabel("volgende week"),
					new joFlexrow([
						new joLabel("&nbsp;&nbsp;ma"),
						new joLabel("&nbsp;&nbsp;di"),
						new joLabel("&nbsp;&nbsp;wo"),
						new joLabel("&nbsp;&nbsp;do"),
						new joLabel("&nbsp;&nbsp;vr"),
						new joLabel("&nbsp;&nbsp;za"),
						new joLabel("&nbsp;&nbsp;zo")
					]),
					new joFlexrow([
						firstbutton = new joButton(datums[7]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[7]) }),
						new joButton(datums[8]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[8]) }),
						new joButton(datums[9]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[9]) }),
						new joButton(datums[10]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[10]) }),
						new joButton(datums[11]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[11]) }),
						new joButton(datums[12]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[12]) }),
						new joButton(datums[13]).selectEvent.subscribe(function() { ritrecord.setProperty("ritdatum",setdatums[13]) })
					]),
				        new joLabel("tijdstip"),
				                sel1 = new joSelect(["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"], ritrecord.link("rituur")),
				                sel2 = new joSelect(["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"], ritrecord.link("ritminuut")),

				]).setStyle("remote"),
				new joDivider(),
				new joButton("Terug").selectEvent.subscribe(function() {
					stack.pop();
				}, this)
			]).setTitle("<img src='/images/icons/At.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Tijdstip selecteren");			       




//////////////////////////////////////////////////////////
/////// OVERZICHT GEBOEKTE RITTEN  ///////////////////////
//////////////////////////////////////////////////////////
                var geselecteerd = -1;
		geboekt = new joCard([
		    ritoverzichtsel = new joList([],geselecteerd).selectEvent.subscribe(function(dat) { alert(dat); }),
		    new joFooter([
		       new joDivider(),
		       backbutton = new joButton("terug").selectEvent.subscribe(function()
		         {
		   	   stack.pop();
                         })
		                 ])
                   ]).setTitle("<img src='/images/icons/Doc.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Geboekte ritten");

	        var overzichtritdl = new joSQLDataSource(jodb); //data source voor jolist queries etc
	        overzichtritdl.changeEvent.subscribe(function(data) { ritoverzichtsel.setData(data);  });

                ritoverzichtsel.formatItem = function(data, index)
	         {
                   display = data.aankomsttijdstip+"<br>"+data.vertrekstraat+" "+data.vertrekhuisnummer+" "+data.vertrekhuisnummertoevoeging+" "+data.vertrekpostcode+" "+data.vertrekplaats+"<br>"+data.aankomststraat+" "+data.aankomsthuisnummer+" "+data.aankomsthuisnummertoevoeging+" "+data.aankomstpostcode+" "+data.aankomstplaats; //hier evt velden combineren
                   return joList.prototype.formatItem.call(this, display, index);
                 }	   
		
                geboekt.activate = function ()
		 {
	           overzichtritdl.execute("select * from ritten;");
		 }


//		    mytable = new joHTML('<table style="width:100%"><tr><th>tijdstip</th><td>15/09/2013</td><td>10:00u</td></tr><tr><th>van</th><td colspan=2>Johannes van Vlotenlaan 100 Deventer</td></tr><tr><th style="border-bottom:solid 1px black">naar</th><td colspan=2 style="border-bottom:solid 1px black">Dennenweg 9 Assen</td></tr><tr><th>tijdstip</th><td>16/09/2013</td><td>10:00u</td></tr><tr><th>van</th><td colspan=2>Johannes van Vlotenlaan 100 Deventer</td></tr><tr><th style="border-bottom:solid 1px black">naar</th><td colspan=2 style="border-bottom:solid 1px black">Dennenweg 9 Assen</td></tr><tr><th>tijdstip</th><td>17/09/2013</td><td>10:00u</td></tr><tr><th>van</th><td colspan=2>Johannes van Vlotenlaan 100 Deventer</td></tr><tr><th style="border-bottom:solid 1px black">naar</th><td colspan=2 style="border-bottom:solid 1px black">Dennenweg 9 Assen</td></tr></table>'), 








		////MIJN RITTEN
		var mytable;
		ritoverzicht = new joCard([
			mytable = new joHTML('<table style="width:100%"><tr><th>tijdstip</th><td>15/09/2013</td><td>10:00u</td></tr><tr><th>van</th><td colspan=2>Johannes van Vlotenlaan 100 Deventer</td></tr><tr><th style="border-bottom:solid 1px black">naar</th><td colspan=2 style="border-bottom:solid 1px black">Dennenweg 9 Assen</td></tr><tr><th>tijdstip</th><td>16/09/2013</td><td>10:00u</td></tr><tr><th>van</th><td colspan=2>Johannes van Vlotenlaan 100 Deventer</td></tr><tr><th style="border-bottom:solid 1px black">naar</th><td colspan=2 style="border-bottom:solid 1px black">Dennenweg 9 Assen</td></tr><tr><th>tijdstip</th><td>17/09/2013</td><td>10:00u</td></tr><tr><th>van</th><td colspan=2>Johannes van Vlotenlaan 100 Deventer</td></tr><tr><th style="border-bottom:solid 1px black">naar</th><td colspan=2 style="border-bottom:solid 1px black">Dennenweg 9 Assen</td></tr></table>'), 
			new joFooter([
				new joDivider(),
				backbutton = new joButton("terug").selectEvent.subscribe(function()
					             {
							stack.pop();
                                                     })
			])
		]).setTitle("Geboekte ritten");
			       






		
//	was demoing how to disable a control, but decided having a "back"
// button was more important right now
//		cancelbutton.disable();
//		cancelbutton.selectEvent.subscribe(back, this);
		
		
		////////////////HIER HET MENU - VIEW KOPPELEN
		list.selectEvent.subscribe(function(id) {
			if (id == "nieuwerit")
				stack.push(nieuwerit);
			else if (id == "instellingen")
				stack.push(instellingen);
			else if (id == "geboekt")
				stack.push(geboekt);
			else if (id == "myCard")
				stack.push(myCard);
			else if (id == "ritoverzicht")
				stack.push(ritoverzicht);
			else if (id == "infoscherm")
				stack.push(infoscherm);
			else if (id == "popup")
				scn.alert("Hello!", "Is this the popup you were looking for? This is a very simple one; you can put much more in a popup if you were inclined.", function() { list.deselect(); });
			else if (id != "help")
				stack.push(joCache.get(id, 2, { fart: "nugget"}));
		}, this);
		

//		moreback.selectEvent.subscribe(function() { stack.pop(); }, this);
		button.selectEvent.subscribe(click.bind(this));
		backbutton.selectEvent.subscribe(back, this);
//		html.selectEvent.subscribe(link, this);
//		stack.pushEvent.subscribe(blip, this);
//		stack.popEvent.subscribe(bloop, this);
		
		joGesture.forwardEvent.subscribe(stack.forward, stack);
		joGesture.backEvent.subscribe(stack.pop, stack);
		
		document.body.addEventListener('touchmove', function(e) {
		    e.preventDefault();
			joEvent.stop(e);
		}, false);

//		stack.push(menu);
                //starten na initialisatie met:
                initDatabases();
		laadInstellingen();	//zet de instellingen in het formulier
		stack.push(menu);
		stack.push(instellingen);
		

	}

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////   DATABASE FUNCTIES DIE DE LOKALE DATABASE VULLEN (ritten,machtigingen,pulldown)
///////////////////////////////////////////////////////////////////////////////////////////////

	function laadMachtigingen(pasnummer,userhash)
	 { //deze functie regelt dat de machtigingen en ritten in de joDB komen

           var response = AjaxCall('http://tcrcentrale.netshaped.net/10/machtigingen/lijst/'+pasnummer+'/'+userhash)
           //alert('http://tcrcentrale.netshaped.net/10/machtigingen/lijst/'+pasnummer+'/'+userhash)
           //alert(response);

	   var jsObject = JSON.parse(response);
	   if (jsObject.status==1)
	    { //gevonden!

              jods.execute('drop table machtigingen;',[]);
              jods.execute('create table if not exists machtigingen (id,vertrektitel,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rittentegoed,rittenverreden,datumingang,datumeinde,verrichting,rolstoelvervoer,begeleiding,ondernemerscode);',[]);
              //jods.execute('create table if not exists ritten(id,reiziger_id,vertrektitel,vertrektijdstip,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rolstoel,hulpmiddelen,aantalpersonen,ritopmerking,terugbelnummer,ondernemerscode);',[]);
              //ds.execute("insert into books (id, author, title) values (?,?,?);",[1, "author A", "book A"]);	
              jods.execute('delete from machtigingen;');
					      
	      var myrittenArr = jsObject.machtigingen.split("^");
              var velden;
	      var q;

              for (var i=0; i<myrittenArr.length; i++)
	       { //hier 1 rit te pakken : splits velden
		 velden = myrittenArr[i].split("|");
	       //  q='INSERT INTO machtigingen (id,vertrektitel,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rittentegoed,rittenverreden,datumingang,datumeinde,verrichting,rolstoelvervoer,begeleiding,ondernemerscode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
	         q='INSERT INTO machtigingen (id,vertrektitel,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rittentegoed,rittenverreden,datumingang,datumeinde,verrichting,rolstoelvervoer,begeleiding,ondernemerscode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
		 jods.execute(q,velden)
	       }
	    }
	   else
	    { //error
	      alert("Fout! :"+jsObject.error);
	    }
	 }

	function laadRitten(pasnummer,userhash)
	 { //deze functie regelt dat de machtigingen en ritten in de joDB komen

           var response = AjaxCall('http://tcrcentrale.netshaped.net/10/ritten/lijst/'+pasnummer+'/'+userhash)
           //alert('http://tcrcentrale.netshaped.net/10/ritten/lijst/'+pasnummer+'/'+userhash)
           //alert(response);

	   var jsObject = JSON.parse(response);
	   if (jsObject.status==1)
	    { //gevonden!

              jods.execute('drop table ritten;',[]);
              jods.execute('create table if not exists ritten(id,reiziger_id,vertrektitel,vertrektijdstip,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttitel,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rolstoel,begeleider,aantalpersonen,hulpmiddelen,ritopmerking,ondernemerscode,terugbelnummer);',[]);
              jods.execute('delete from ritten;');
					      
	      var myrittenArr = jsObject.ritten.split("^");
              var velden;
	      var q;

              for (var i=0; i<myrittenArr.length; i++)
	       { //hier 1 rit te pakken : splits velden
		 velden = myrittenArr[i].split("|");
	         q='INSERT INTO ritten (id,reiziger_id,vertrektitel,vertrektijdstip,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttitel,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rolstoel,begeleider,aantalpersonen,hulpmiddelen,ritopmerking,ondernemerscode,terugbelnummer) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
//		 console.log(velden)
		 jods.execute(q,velden)
	       }
	    }
	   else
	    { //error
	      alert("Fout! :"+jsObject.error);
	    }
	 }
	 
	function updateAdresPulldowns()
	 { //deze functie combineert de entries in ritten met die van machtigingen en het ingevulde adres.
	   //alles wordt dan weggeschreven in de speciale tabel "adrespulldown"
	   //deze wordt gekoppeld aan de joSelect-list voor de selectie van een adres

           jods.execute('create table if not exists adrespulldown (volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats);',[]);
           jods.execute('delete from adrespulldown;');

           var gevonden = new Array();

           //is er een maatwerk adres ingevuld? Dan hier alvast toevoegen
	   
	   //voeg een default entry toe om te kunnen selecteren
	   //StuurQuery('insert into vertrekadrespulldown (volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats) values (0,"selecteer vertrekadres","","","","","")',db);
	   //StuurQuery('insert into vertrekadrespulldown (volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats) values (3,"los adres invullen","","","","","")',db);
	   
           db.transaction(function (tx) {
             tx.executeSql('SELECT vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats FROM machtigingen', [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i, label, item, j;
                    for (i = 0; i < len; i++)
		     {
                       //verwerk het vertrekadres vanuit de machtiging
		       label = results.rows.item(i).vertrekpostcode+" "+results.rows.item(i).vertrekhuisnummer
		       if ((!in_array(label,gevonden)) && (label!=' '))
		        { //uniek label gevonden: toevoegen
			  j=gevonden.length;
		          gevonden[j] = label;
                         
                          //verwerk het unieke adres nu ook in de pulldowns
			  item = results.rows.item(i);
			  StuurQuery('insert into adrespulldown (volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats) values (2,"'+item.vertrekstraat+" "+item.vertrekhuisnummer+" "+item.vertrekhuisnummertoevoeging+" "+item.vertrekplaats+'","'+item.vertrekstraat+'","'+item.vertrekhuisnummer+'","'+item.vertrekhuisnummertoevoeging+'","'+item.vertrekpostcode+'","'+item.vertrekplaats+'")',db);
                        }

                       //verwerk het aankomstadres vanuit de machtiging
		       label = results.rows.item(i).aankomstpostcode+" "+results.rows.item(i).aankomsthuisnummer
		       if ((!in_array(label,gevonden)) && (label!=' '))
		        { //uniek label gevonden: toevoegen
		          gevonden[gevonden.length] = label;
                         
                          //verwerk het unieke adres nu ook in de pulldowns
			  item = results.rows.item(i);
			  StuurQuery('insert into adrespulldown (volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats) values (2,"'+item.aankomststraat+" "+item.aankomsthuisnummer+" "+item.aankomsttoevoeging+" "+item.aankomstplaats+'","'+item.aankomststraat+'","'+item.aankomsthuisnummer+'","'+item.vertrekhuisnummertoevoeging+'","'+item.aankomstpostcode+'","'+item.aankomstplaats+'")',db);
                        }

                     }

                  }, null);
           });		
					      
	 }
	
	function sorteerAdresPulldowns()
	 {
	   //sorteert de tabel voor pulldowns, en updatet het volgnummer 
           var gevonden = new Array();
           db.transaction(function (tx) {
             tx.executeSql('SELECT volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats FROM adrespulldown ORDER BY plaats,straat', [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i, label, item, j;
                    for (i = 0; i < len; i++)
		     {
                       //verwerk het volgnummer i nu in dit record
		       item = results.rows.item(i);
		       StuurQuery('update adrespulldown SET volgnr='+i+' WHERE combi="'+item.combi+'"',db);
                     }

                  }, null);
           });		
					      
	 }

	function gebruikAdresPulldowns(richting,id)
	 { //richting = vertrek | aankomst
	   //id = volgnummer van het geselecteerde adres
	   //deze functie zorgt dat het geselecteerde adres wordt opgezocht en verwerkt in het ritrecord
           var gevonden = new Array();
           db.transaction(function (tx) {
             tx.executeSql('SELECT volgnr,combi,straat,huisnummer,toevoeging,postcode,plaats FROM adrespulldown WHERE volgnr='+id, [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i, label, item, j;
                    for (i = 0; i < len; i++)
		     {
                       //verwerk het volgnummer i nu in dit record
		       item = results.rows.item(i);
//console.log(item);
		       ritrecord.setProperty(richting+"straat",item.straat);
		       ritrecord.setProperty(richting+"huisnummer",item.huisnummer);
		       ritrecord.setProperty(richting+"toevoeging",item.toevoeging);
		       ritrecord.setProperty(richting+"postcode",item.postcode);
		       ritrecord.setProperty(richting+"plaats",item.plaats);
		       
		       ritrecord.setProperty(richting+"adres",item.straat+" "+item.huisnummer+item.toevoeging+" "+item.plaats)
                     }

                  }, null);
           });		
					      
	 }
	 
///////////////////////////////////////////////////////////////////////////////////////////////


	

	
	function VerstuurRit()
	 { //gebruik de ingevulde gegevens; verstuur ze naar de gateway; wacht het antwoord af
	   var response = AjaxCall("http://tcrcentrale.netshaped.net/10/ritten/nieuw/"+instelrecord.getProperty("userhash")+"/"+instelrecord.getProperty("pasnummer")+"/"+ritrecord.getProperty("vertrekpostcode")+"/"+ritrecord.getProperty("vertrekhuisnummer")+"/"+ritrecord.getProperty("aankomstpostcode")+"/"+ritrecord.getProperty("aankomsthuisnummer")+"/"+ritrecord.getProperty("tijdstip")+"/"+ritrecord.getProperty("aantalpersonen")+"/"+ritrecord.getProperty("rolstoel")+"/"+ritrecord.getProperty("hulpmiddelen")+"/"+ritrecord.getProperty("terugbelnummer")+"/"+ritrecord.getProperty("vertrekplaats")+"/"+ritrecord.getProperty("aankomstplaats")+"/"+ritrecord.getProperty("vertrekstraat")+"/"+ritrecord.getProperty("aankomststraat"));
	   var jsObject = JSON.parse(response);
	   if (jsObject.status==1)
	    { //rit in orde
  	      scn.alert("Reactie van centrale", "De rit is geboekt!", function() {  });
              laadRitten(instelrecord.getProperty("pasnummer"),instelrecord.getProperty("userhash")) //refresh ritten
    	      joDOM.get("progress").style.display="none";
	      stack.pop();
           }
           else
	    { //foutmelding vanaf server
  	      scn.alert("Reactie van centrale", jsObject.error, function() {  });
    	      joDOM.get("progress").style.display="none";
	    }
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

           //db = OpenDatabaseConnectie('taxiDB');

	   //TABEL INSTELLINGEN
           //StuurQuery("delete from instellingen where veld=''",db);
	   StuurQuery('create table if not exists instellingen(veld string, waarde string)',db);
           var gevonden = new Array();
	   var velden   = new Array('pasnummer','pwd','email','terugbelnummer','notifyme','userhash');
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

/*
	   //TABEL RITTEN
           db.transaction(function (tx) {  
             tx.executeSql('drop table ritten');
	   });
	   StuurQuery('create table if not exists ritten(id integer,reiziger_id integer,vertrektitel string,vertrektijdstip string,vertrekstraat string,vertrekhuisnummer string,vertrekhuisnummertoevoeging string,vertrekpostcode string,vertrekplaats string,aankomsttijdstip string,aankomststraat string,aankomsthuisnummer string,aankomsttoevoeging string,aankomstpostcode string,aankomstplaats string,rolstoel string,hulpmiddelen string,aantalpersonen string,ritopmerking string,terugbelnummer string,ondernemerscode string)',db);
	   
	   //TABEL machtigingen
	   StuurQuery('create table if not exists machtigingen(id integer,vertrektitel string,vertrekstraat string,vertrekhuisnummer string,vertrekhuisnummertoevoeging string,vertrekpostcode string,vertrekplaats string,aankomsttijdstip string,aankomststraat string,aankomsthuisnummer string,aankomsttoevoeging string,aankomstpostcode string,aankomstplaats string,rittentegoed integer,rittenverreden integer,datumingang string,datumeinde string,verrichting string, rolstoelvervoer string, begeleiding string, ondernemerscode string)',db);
*/

	   
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
	




	 
        function laadInstellingen()
	 {
	   var tst
           db.transaction(function (tx) {
             tx.executeSql('SELECT * FROM instellingen', [],
		 function (tx, results)
		  {
                    var len = results.rows.length, i, pasgezien, hashgezien;
		    pasgezien = 0; hashgezien=0;
                    msg = "<p>Found rows: " + len + "</p>";
                    //document.querySelector('#status').innerHTML +=  msg;
                    for (i = 0; i < len; i++)
		     {
		       instelrecord.setProperty(results.rows.item(i).veld,results.rows.item(i).waarde);
		       //alert(results.rows.item(i).veld+" wordt "+results.rows.item(i).waarde);
		       if ((results.rows.item(i).veld == "userhash") && (results.rows.item(i).waarde == ""))
			{ //hash wordt met lege waarde gevuld! dan moeten we naar de instellingen
			}
		       
		       if (results.rows.item(i).veld == "userhash")  { hashgezien=results.rows.item(i).waarde; }
		       if (results.rows.item(i).veld == "pasnummer") { pasgezien=results.rows.item(i).waarde;  }
		        
                     }
		       if ((hashgezien!=0)&&(pasgezien!=0))
		        { //hash en pasnummer ingeladen. Kunnen we nu de ritten en machtigingen ophalen!
		          laadMachtigingen(pasgezien,hashgezien);
		          laadRitten(pasgezien,hashgezien);
			  updateAdresPulldowns();
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

	function StuurInsertQuery(query,db)
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












App.init();

}


