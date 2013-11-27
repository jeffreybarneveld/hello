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
        var begeleiding=0;
	
        var nieuwerit;
        var instelrecord; //hierin de instellingen opslaan
        var instellingen; //hierin de kaart voor het instellingenformulier
        var resetbutton;
	
	var myrittenArr;

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
                               
           menu = new joCard([ new joHTML('<br/>'),
					  list = new joMenu([
				           { title: "<img src='images/icons/Plus.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Nieuwe rit boeken",      id: "nieuwerit"    },
                    			   { title: "<img src='images/icons/Doc.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Geboekte ritten", id: "geboekt" },
                    			   { title: "<img src='images/icons/Doc.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Rithistorie", id: "rithistorie" },
 				           //{ title: "testlijst", id: "myCard" },
//				           { title: "Ritoverzicht",           id: "ritoverzicht" },
                    			   { title: "<img src='images/icons/Tools.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Mijn gegevens", id: "instellingen" },
				           { title: "<img src='images/icons/Info.png' style='height:40px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Over deze app",          id: "infoscherm" }
 				           //{ title: "testlijst", id: "myCard" },
			                         ])
		             ]).setTitle("<img src='images/icons/Home.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Hoofdmenu");
	   menu.activate = function() { // maybe this should be built into joMenu...
			                list.deselect();
		                      };

           // chaining is supported on constructors and any setters		
	   scn = new joScreen(
			new joContainer([
				new joFlexcol([
					nav = new joNavbar(),
					stack = new joStackScroller().push(menu),
					toolbar = new joToolbar("<img src='images/bottomlogo-dvg.png' height=40>")
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

           // Informatie scherm
	   infoscherm = new joCard([
			   new joGroup([			
			      new joHTML('<div style="text-align:center;"><img style="width:300px;" src="images/infologo-dvg.png"></div><h1>DVG Ziekenvervoer</h1><br/>Met deze app kunt u ritten boeken voor het zittend ziekenvervoer, indien u beschikt over een geldige machtiging van &eacute;&eacute;n van de onderstaande zorgverzekeraars: <ul><li>Univ&eacute;</li><li>Krijgsmacht</li><li>Zekur</li><li>Zorgzaam Verzekerd</li><li>VGZ</li><li>IZA Cura</li><li>Bewuzt</li><li>Plus</li><li>IAK</li><li>Caresco</li><li>VPZ</li><li>Aevitae-VGZ</li><li>IZZ</li><li>IZA</li><li>UMC</li><li>Aevitae-de Goudse</li></ul>')
				       ]),
			          new joFooter([
				     new joDivider(),
				     button = new joButton("OK").selectEvent.subscribe(function()
					       {
						    stack.pop();
					       })
			                       ])
		               ]).setTitle("<img src='images/icons/Info.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Over deze app");


           // Instellingen scherm
	   instellingen = new joCard([ new joHTML('<br/>'),
				       xtrabutton = new joButton("OK").selectEvent.subscribe(function()
					       {
				                 instelrecord.setProperty("userhash",""); //bij check meteen hash legen!
						 var response = AjaxCall('http://tcrcentrale.netshaped.net/10/login/check/'+instelrecord.getProperty("pasnummer")+'/'+instelrecord.getProperty("pwd"))
						 var jsObject = JSON.parse(response);
						 if (jsObject.status==1)
						  {
				                    instelrecord.setProperty("userhash",jsObject.userhash);
  				                    StuurQuery('update instellingen set waarde="'+jsObject.userhash+'" where veld="userhash"',db);
						    laadMachtigingen(instelrecord.getProperty("pasnummer"),jsObject.userhash);
						    laadRitten(instelrecord.getProperty("pasnummer"),jsObject.userhash);
						    updateAdresPulldowns();
						    stack.pop();
						  }
						 else
						  {
						    scn.alert("Reactie van centrale", "De combinatie van polisnummer en wachtwoord is niet correct", function() {  });
						  }
						  
					       }),
			          new joGroup([
				     new joLabel("Polisnummer"),
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
				                 instelrecord.setProperty("userhash",""); //bij check meteen hash legen!
						 var response = AjaxCall('http://tcrcentrale.netshaped.net/10/login/check/'+instelrecord.getProperty("pasnummer")+'/'+instelrecord.getProperty("pwd"))
						 var jsObject = JSON.parse(response);
						 if (jsObject.status==1)
						  {
				                    instelrecord.setProperty("userhash",jsObject.userhash);
  				                    StuurQuery('update instellingen set waarde="'+jsObject.userhash+'" where veld="userhash"',db);
						    laadMachtigingen(instelrecord.getProperty("pasnummer"),jsObject.userhash);
						    laadRitten(instelrecord.getProperty("pasnummer"),jsObject.userhash);
						    updateAdresPulldowns();
						    stack.pop();
						  }
						 else
						  {
						    scn.alert("Reactie van centrale", "De combinatie van pasnummer en wachtwoord is niet correct!", function() {  });
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
		               ]).setTitle("<img src='images/icons/Tools.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Mijn gegevens");

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
	   var hours     = inittime.getHours()+1; if (hours<10){ hours="0"+hours; }
	   var minutes   = 10*Math.round(inittime.getMinutes()/10);
	   if (minutes==0)    { minutes="00"; }
	   if (minutes>59)    { minutes="00"; }
	   if (hours>23)      { hours="00"; }
		
	   ritrecord = new joRecord({ vertrekadres :      "vertrekadres",             //weergave in ritverzamelscherm
				      vertrekid    :      "",                         //leeg=niets -1=los adres
			              aankomstadres:      "aankomstadres",            //weergave in ritverzamelscherm
			              aankomstid   :      "",                         //leeg=niets -1=los adres
			              tijdstip:           day+"-"+month+"-"+year+" "+hours+":"+minutes,
			              aankomsttijdstip:   day+"-"+month+"-"+year+" "+hours+":"+minutes,
			              aantalpersonen:     0,
				      rolstoel:           0,
			              hulpmiddelen:       0,
				      terugbelnummer:     "",
				      opmerkingen:        "",
				      ritdatum:           day+"-"+month+"-"+year,
				      rituur:             (hours-6), //aangezien we pas vanaf 06:00 boeken, en index begint bij 0
				      ritminuut:          (1*minutes)/5,
				      ritaankomstuur:     (hours-6), //aangezien we pas vanaf 06:00 boeken, en index begint bij 0
				      ritaankomstminuut:  (1*minutes)/5,
				      vertrekstraat:      "", //opslag van het geselecteerde adres voor vertrek
				      vertrekhuisnummer:  "",
				      vertrektoevoeging:  "",
				      vertrekpostcode:    "",
				      vertrekplaats:      "",
				      aankomststraat:     "", //en aankomst
				      aankomsthuisnummer: "",
				      aankomsttoevoeging: "",
				      aankomstpostcode:   "",
				      aankomstplaats:     "",
				      ritid:              0    //id van rit in het geval van aanpassingen
		}).setAutoSave(true);

	   ritrecord.save = function ()
		                     { //some code here to save it to local database
				       var tempuur = 6+1*ritrecord.getProperty("rituur");
				       if (tempuur<10) { tempuur="0"+1*tempuur; }
				       var tempminuut = ritrecord.getProperty("ritminuut")*5;
				       if (tempminuut<10) { tempminuut="0"+tempminuut; }
				       ritrecord.tijdstip = tempuur+":"+tempminuut;
				       ritrecord.setProperty("tijdstip",ritrecord.getProperty("ritdatum")+" "+tempuur+":"+tempminuut);

				       var tempuur = 6+1*ritrecord.getProperty("ritaankomstuur");
				       if (tempuur<10) { tempuur="0"+1*tempuur; }
				       var tempminuut = ritrecord.getProperty("ritaankomstminuut")*5;
				       if (tempminuut<10) { tempminuut="0"+tempminuut; }
				       ritrecord.tijdstip = tempuur+":"+tempminuut;
				       ritrecord.setProperty("aankomsttijdstip",ritrecord.getProperty("ritdatum")+" "+tempuur+":"+tempminuut);
				       
				       if ((ritrecord.getProperty("aantalpersonen")>0) && (begeleiding==0))
				        {
  	                                  scn.alert("Let op!", "Uw selecteert meer personen dan uw machtigingen toestaan. De rit zal niet worden geaccepteerd!", function() {  });
					}
				     }

				     
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
	   var aantalpersonenarray = new Array("1","2");
// <img src='images/icons/Redo.png' style='height:20px;vertical-align:middle;position:absolute;left:50%;margin-top:-5px;margin-left:10px;'>

	   nieuwerit = new joCard([
		          new joGroup([
                                new joHTML('<br/><div id="progress" style="z-index:1000;display:none;"><div style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;width:100%;height:100%;background-color:black;z-index:900;filter:alpha(opacity=60);opacity:.6;"></div><img src="images/loader.png" class="loadingimage"></div>'),
                                new joLabel("Vertrek adres"),
				vertrekbutton = new joButton(ritrecord.link("vertrekadres")).selectEvent.subscribe(function()
				     {
					stack.push(vertrekadresselect)
				     }),
				new joLabel("Aankomst adres"),
//				wisselbutton = new joButton("<img src='images/icons/Redo.png' style='height:20px;vertical-align:middle;position:absolute;left:50%;margin-top:-5px;margin-left:10px;'>").setStyle('border:0px;'),				
				aankomstbutton = new joButton(ritrecord.link("aankomstadres")).selectEvent.subscribe(function()
				     {
					stack.push(aankomstadresselect)
				     }),
				new joLabel("Vertrektijdstip"),
				tijdstipbutton = new joButton(ritrecord.link("tijdstip")).selectEvent.subscribe(function()
					       { stack.push(tijdstipselect)
					       }),
				new joLabel("Uiterst aankomsttijdstip"),
				tijdstipbutton = new joButton(ritrecord.link("aankomsttijdstip")).selectEvent.subscribe(function()
					       { stack.push(tijdstipselect)
					       }),
				new joLabel("Aantal personen"),
				aantalpersonenbutton = new joSelect(aantalpersonenarray, ritrecord.link("aantalpersonen")),
				new joLabel("Rolstoel"),
				rolstoelbutton = new joSelect([
					"geen", "duwrolstoel", "elektrisch", "scootmobiel", "opvouwbaar"
				     ], ritrecord.link("rolstoel")),
				new joLabel("Hulpmiddelen"),
				hulpmiddelbutton = new joSelect([
					"geen", "rollator", "blindegeleide/sociale hond", "opvouwbare kinderwagen", "eigen stoelverhoger/zitje"
				     ], ritrecord.link("hulpmiddelen")),
				new joLabel("Terugbelnummer"),
				new joFlexrow(nameinput = new joInput(ritrecord.link("terugbelnummer"))),

				new joLabel("Opmerkingen"),
				new joFlexrow(new joTextarea(ritrecord.link("opmerkingen")).setStyle({ minHeight: "20px",maxHeight: "300px" })),

				  ]),
			        new joFooter([
				     new joDivider(),
				     button = new joButton("OK").selectEvent.subscribe(function()
				      {  joDOM.get("progress").style.display="block";
					 var msg = VerstuurRit();
                                      }),
				     annuleerbutton = new joButton("Annuleer deze rit").selectEvent.subscribe(function()
					             {
							if (ritrecord.getProperty("ritid")>0)
							 { //echt annulering versturen naar server
	                                                   var response = AjaxCall("http://tcrcentrale.netshaped.net/10/ritten/annuleer/"+instelrecord.getProperty("userhash")+"/"+instelrecord.getProperty("pasnummer")+"/"+ritrecord.getProperty("ritid"));
	                                                   var jsObject = JSON.parse(response);
	                                                   if (jsObject.status==1)
	                                                    { //ritannulering in orde
  	                                                      scn.alert("Reactie van centrale", "De rit is geannuleerd!", function() {  });
                                                              laadRitten(instelrecord.getProperty("pasnummer"),instelrecord.getProperty("userhash")) //refresh ritten
	                                                      stack.pop();
                                                            }
                                                           else
	                                                    { //foutmelding vanaf server
  	                                                      scn.alert("Reactie van centrale", jsObject.error, function() {  });
    	                                                      joDOM.get("progress").style.display="none";
	                                                    }
							 }
							stack.pop();
                                                     }),
				     backbutton = new joButton("Terug naar vorig scherm").selectEvent.subscribe(function()
					             {
							stack.pop();
                                                     })

				     ])
				]).setTitle("<img src='images/icons/Plus.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Nieuwe rit boeken");

                vertrekbutton.setStyle("expandobutton");
                aankomstbutton.setStyle("expandobutton");
                tijdstipbutton.setStyle("expandobutton");
		nieuwerit.activate = function() {
//			ritrecord.setAutoSave(true); //zodra deze card geactiveerd wordt de autosave aanzetten. Vooraf is e.e.a. ingeladen vanuit database
//			joGesture.defaultEvent.capture(button.select, button);
                        ritrecord.setAutoSave(false);
		        if (ritrecord.getProperty("terugbelnummer")=="") { ritrecord.setProperty("terugbelnummer",instelrecord.getProperty("terugbelnummer")) } 
			updateAdresPulldowns();
			ritrecord.setAutoSave(true);
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
			 new joLabel("Plaats"),
			 vertrekplaatsinput = new joFlexrow(nameinput = new joInput(vertrekrecord.link("plaats"))),
			 new joLabel("Straat"),
			 new joFlexrow(nameinput = new joInput(vertrekrecord.link("straat"))),
			 new joLabel("Huisnummer"),
			 new joFlexrow(new joInput(vertrekrecord.link("huisnummer"))),
			 new joLabel("Toevoeging"),
			 new joFlexrow(new joInput(vertrekrecord.link("toevoeging"))),
			 new joLabel("Postcode"),
			 new joFlexrow(nameinput = new joInput(vertrekrecord.link("postcode"))),
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
		               ]).setTitle("<img src='images/icons/Magnifier.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Vertrekadres selecteren");

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
				       //var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/ph2sp/"+vertrekrecord.getProperty("postcode")+"/"+vertrekrecord.getProperty("huisnummer"))
				       var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/psh2p/"+vertrekrecord.getProperty("plaats")+"/"+vertrekrecord.getProperty("straat")+"/"+vertrekrecord.getProperty("huisnummer"))
	                               var jsObject = JSON.parse(response);
				       if (jsObject.status==1)
				        { //gevonden!
	   		                  vertrekrecord.setAutoSave(false); //even uitzetten anders wordt dit driedubbel aangeroepen
				          //vertrekrecord.setProperty("straat",jsObject.straat)
				          //vertrekrecord.setProperty("straat",jsObject.straat)
				          vertrekrecord.setProperty("postcode",jsObject.postcode)
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
			 new joLabel("Plaats"),
			 new joFlexrow(nameinput = new joInput(aankomstrecord.link("plaats"))),
			 new joLabel("Straat"),
			 new joFlexrow(nameinput = new joInput(aankomstrecord.link("straat"))),
			 new joLabel("Huisnummer"),
			 new joFlexrow(new joInput(aankomstrecord.link("huisnummer"))),
			 new joLabel("Toevoeging"),
			 new joFlexrow(new joInput(aankomstrecord.link("toevoeging"))),
			 new joLabel("Postcode"),
			 new joFlexrow(nameinput = new joInput(aankomstrecord.link("postcode"))),
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
		               ]).setTitle("<img src='images/icons/Magnifier.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Aankomstadres selecteren");

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
				       //var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/ph2sp/"+aankomstrecord.getProperty("postcode")+"/"+aankomstrecord.getProperty("huisnummer"))
				       var response = AjaxCall("http://tcrcentrale.netshaped.net/10/postcode/psh2p/"+aankomstrecord.getProperty("plaats")+"/"+aankomstrecord.getProperty("straat")+"/"+aankomstrecord.getProperty("huisnummer"))
	                               var jsObject = JSON.parse(response);
				       if (jsObject.status==1)
				        { //gevonden!
	   		                  aankomstrecord.setAutoSave(false); //even uitzetten anders wordt dit driedubbel aangeroepen
				          aankomstrecord.setProperty("postcode",jsObject.postcode)
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
				new joButton("of kies een andere datum").selectEvent.subscribe(function() {
					stack.push(agendaselect)
				}, this),
				new joDivider(),
				        new joLabel("vertrektijdstip"),
				                sel1 = new joSelect(["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"], ritrecord.link("rituur")),
				                sel2 = new joSelect(["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"], ritrecord.link("ritminuut")),
				        new joLabel("uiterst aankomsttijdstip"),
				                sel1 = new joSelect(["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"], ritrecord.link("ritaankomstuur")),
				                sel2 = new joSelect(["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"], ritrecord.link("ritaankomstminuut")),

				]).setStyle("remote"),
				new joDivider(),
				new joButton("OK").selectEvent.subscribe(function() {
					stack.pop();
				}, this)
			]).setTitle("<img src='images/icons/At.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Tijdstip selecteren");			       


//////////////////////////////////////////////////////////
/////// AGENDA  ///////////////////////
//////////////////////////////////////////////////////////

		var d         = new Date();
		var ts        = d.valueOf();
		var curts;
		var rd        = new Date();
		var day       = d.getDate();
		var dayofweek = d.getDay();
		var month     = d.getMonth()+1; //loopt van 0-11, vandaar +1
		var year      = d.getFullYear();
		var showmonths = new Array("","jan","feb","maa","apr","mei","jun","jul","aug","sep","okt","nov","dec");
                var setdatums = new Array();
                var startdag  = (dayofweek-1)*24*3600*1000; //bepaal delta tot start van deze week

                var container   = new Array(); //hierin de agenda verzamelen
	        var x           = 0;           //regelnummer van het gehele scherm

                var i=0;
		var aantalweken = 9;
		while (i<(aantalweken*7))
		 {
		   curts = ts-startdag + (i*24*3600*1000); //bepaal ts steeds dag verder
		   rd.setTime(curts); //stel rd-object op berekende tijd in
		   day       = rd.getDate(); if (day<10) { day="0"+day; }
		   month     = rd.getMonth()+1; if (month<10) { month="0"+month; }
		   year      = rd.getFullYear(); 
		   datums[i] = rd.getDate()+' '+showmonths[(rd.getMonth()+1)];
		   setdatums[i] = day+"-"+month+"-"+year;
		   i++
		 }

		//Nu de knoppen per regel genereren
		for (j=0; j<aantalweken; j++)
		 {
		   var idx = j*7;
		   var dagen = new Array();
		   for (i=0; i<7; i++)
		    { dagen[i]= new joButton(datums[(idx+i)]).selectEvent.subscribe(function(a)
										    {   var pieces = a.split(" ");
		                                                                        var d         = new Date();
		                                                                        var year      = d.getFullYear();
		                                                                        var month     = d.getMonth()+1; //loopt van 0-11, vandaar +1
										        switch (pieces[1])
											 { case "jan": var m=1; break;
											   case "feb": var m=2; break;	
											   case "maa": var m=3; break;	
											   case "apr": var m=4; break;	
											   case "mei": var m=5; break;	
											   case "jun": var m=6; break;	
											   case "jul": var m=7; break;	
											   case "aug": var m=8; break;	
											   case "sep": var m=9; break;	
											   case "okt": var m=10; break;	
											   case "nov": var m=11; break;	
											   case "dec": var m=12; break;	
											 }
											if ((m<month) && (12+m-month)<6) { year++ }
											if (m<10) { m="0"+m; }
											if (pieces[0]<10) { pieces[0]="0"+pieces[0]; }
											ritrecord.setProperty("ritdatum",pieces[0]+"-"+m+"-"+year);stack.pop();
										    });
                      x++; container[x]=new joFlexrow(dagen);
		    }
		 }

                x++; container[x]=new joDivider();
                x++; container[x]=new joButton('annuleren').selectEvent.subscribe(function() { stack.pop(); }, this);

                agendaselect = new joCard([ new joHTML('<br/>'),
				            container = new joFlexcol(container).setStyle("remote"),
				
			                  ]).setTitle("<img src='images/icons/At.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Datum selecteren");			       



//////////////////////////////////////////////////////////
/////// OVERZICHT GEBOEKTE RITTEN  ///////////////////////
//////////////////////////////////////////////////////////
                var geselecteerd = -1;
		geboekt = new joCard([ new joHTML('<br/>'),
		    ritoverzichtsel = new joList([],geselecteerd).selectEvent.subscribe(function(dat) { EditRit(dat); }),
		    new joFooter([
		       new joDivider(),
		       backbutton = new joButton("terug").selectEvent.subscribe(function()
		         {
		   	   stack.pop();
                         })
		                 ])
                   ]).setTitle("<img src='images/icons/Doc.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Geboekte ritten");

	        var overzichtritdl = new joSQLDataSource(jodb); //data source voor jolist queries etc
	        overzichtritdl.changeEvent.subscribe(function(data) { ritoverzichtsel.setData(data);  });

		var savetheindex = new Array();
                ritoverzichtsel.formatItem = function(data, index)
	         {
                   savetheindex[index]=data.id;
                   display = data.aankomsttijdstip.substring(8,10)+"-"+data.aankomsttijdstip.substring(5,7)+"-"+data.aankomsttijdstip.substring(0,4)+" "+data.vertrektijdstip.substring(11,16)+"u / "+data.aankomsttijdstip.substring(11,16)+"u<br>"+data.vertrekstraat+" "+data.vertrekhuisnummer+" "+data.vertrekhuisnummertoevoeging+" "+data.vertrekpostcode+" "+data.vertrekplaats+"<br>"+data.aankomststraat+" "+data.aankomsthuisnummer+" "+data.aankomsttoevoeging+" "+data.aankomstpostcode+" "+data.aankomstplaats; //hier evt velden combineren
                   return joList.prototype.formatItem.call(this, display, index);
                 }	   
		
                geboekt.activate = function ()
		 {
                   var d = new Date();
                   var curr_date = d.getDate(); if (curr_date<10) { curr_date="0"+curr_date; }
                   var curr_month   = d.getMonth() + 1; if (curr_month<10) { curr_month="0"+curr_month; }
                   var curr_year    = d.getFullYear();
                   var curr_hour    = d.getHours(); if (curr_hour<10) { curr_hour="0"+curr_hour; }
                   var curr_minutes = d.getMinutes(); if (curr_minutes<10) { curr_minutes="0"+curr_minutes; }
                   var ts = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minutes + ":00";
	           overzichtritdl.execute("select * from ritten where aankomsttijdstip >= '"+ts+"' order by aankomsttijdstip;");
		 }
			      
		function EditRit(nr)
		 {
                   for (var i=0; i<myrittenArr.length; i++)
	            { //hier 1 rit te pakken : splits velden
		      velden = myrittenArr[i].split("|");

		      if (velden[0]==savetheindex[nr])
		       { 
                         //init ritrecord met bestaande rit
	   		 ritrecord.setAutoSave(false); //even uitzetten

			 ritrecord.setProperty("ritid",velden[0]);
                         ritrecord.setProperty("vertrekid","");
                         ritrecord.setProperty("aankomstid","");

	   		 vertrekrecord.setAutoSave(false); //even uitzetten anders wordt dit tussendoor vaak aangeroepen
			 vertrekrecord.setProperty("straat",velden[4]);
			 vertrekrecord.setProperty("huisnummer",velden[5]);
			 vertrekrecord.setProperty("toevoeging",velden[6]);
			 vertrekrecord.setProperty("postcode",velden[7]);
			 vertrekrecord.setProperty("plaats",velden[8]);
	                 vertrekrecord.setAutoSave(true); //en weer aan
		         ritrecord.setProperty("vertrekadres",velden[4]+" "+velden[5]+velden[6]+" "+velden[8])

			 ritrecord.setProperty("vertrekstraat",velden[4]);
			 ritrecord.setProperty("vertrekhuisnummer",velden[5]);
			 ritrecord.setProperty("vertrektoevoeging",velden[6]);
			 ritrecord.setProperty("vertrekpostcode",velden[7]);
			 ritrecord.setProperty("vertrekplaats",velden[8]);

			 ritrecord.setProperty("aankomststraat",velden[11]);
			 ritrecord.setProperty("aankomsthuisnummer",velden[12]);
			 ritrecord.setProperty("aankomsttoevoeging",velden[13]);
			 ritrecord.setProperty("aankomstpostcode",velden[14]);
			 ritrecord.setProperty("aankomstplaats",velden[15]);
			 
	   		 aankomstrecord.setAutoSave(false); //even uitzetten anders wordt dit tussendoor vaak aangeroepen
			 aankomstrecord.setProperty("straat",velden[11]);
			 aankomstrecord.setProperty("huisnummer",velden[12]);
			 aankomstrecord.setProperty("toevoeging",velden[13]);
			 aankomstrecord.setProperty("postcode",velden[14]);
			 aankomstrecord.setProperty("plaats",velden[15]);
	                 aankomstrecord.setAutoSave(true); //en weer aan
		         ritrecord.setProperty("aankomstadres",velden[11]+" "+velden[12]+velden[13]+" "+velden[15])

                         ritrecord.setProperty("aantalpersonen",(velden[18]-1));
                         ritrecord.setProperty("terugbelnummer",velden[22]);
                         ritrecord.setProperty("opmerkingen",velden[20]);
			 
			 var datum  = velden[3].substring(8,10)+"-"+velden[3].substring(5,7)+"-"+velden[3].substring(0,4);
			 var uur    = velden[3].substring(11,13);
			 var minuut = velden[3].substring(14,16);

			 ritrecord.setProperty("ritdatum",datum);
			 ritrecord.setProperty("rituur",uur);
			 ritrecord.setProperty("ritminuut",minuut);
			 ritrecord.setProperty("tijdstip",datum+" "+uur+":"+minuut);

			 datum  = velden[10].substring(8,10)+"-"+velden[10].substring(5,7)+"-"+velden[10].substring(0,4);
			 uur    = velden[10].substring(11,13);
			 minuut = velden[10].substring(14,16);

			 ritrecord.setProperty("ritaankomstdatum",datum);
			 ritrecord.setProperty("ritaankomstuur",uur);
			 ritrecord.setProperty("ritaankomstminuut",minuut);
			 ritrecord.setProperty("aankomsttijdstip",datum+" "+uur+":"+minuut);
			 

			 switch (velden[16])
			  {
			    case "geen"       : velden[16]=0; break;
			    case "duwrolstoel": velden[16]=1; break;
			    case "elektrisch" : velden[16]=2; break;
			    case "scootmobiel": velden[16]=3; break;
			    case "opvouwbaar" : velden[16]=4; break;
			  }
			 ritrecord.setProperty("rolstoel",velden[16]);
			 switch (velden[19])
			  {
			    case "geen"                       : velden[19]=0; break;
			    case "rollator"                   : velden[19]=1; break;
			    case "blindegeleide/sociale hond" : velden[19]=2; break;
			    case "opvouwbare kinderwagen"     : velden[19]=3; break;
			    case "eigen stoelverhoger/zitje"  : velden[19]=4; break;
			  }
                         ritrecord.setProperty("hulpmiddelen",velden[19]);

                         ritrecord.setProperty("aantalpersonen",(velden[18]-1));

			 rolstoelbutton.setValue(velden[16]);
			 hulpmiddelbutton.setValue(velden[19]);
			 aantalpersonenbutton.setValue(velden[18]-1);


/**
					"geen", "duwrolstoel", "elektrisch", "scootmobiel", "opvouwbaar"
				     ], ritrecord.link("rolstoel")),
				new joLabel("Hulpmiddelen"),
				hulpmiddelbutton = new joSelect([
					"geen", "rollator", "blindegeleide/sociale hond", "opvouwbare kinderwagen", "eigen stoelverhoger/zitje"
**/


	   		 ritrecord.setAutoSave(true); //en weer aanzetten
			 
		         stack.push(nieuwerit);
		       }
	            }

		 }

			       
//////////////////////////////////////////////////////////
/////// OVERZICHT HISTORIE RITTEN  ///////////////////////
//////////////////////////////////////////////////////////
                var histgeselecteerd = -1;
		rithistorie = new joCard([ new joHTML('<br/>'),
		    historiesel = new joList([],histgeselecteerd).selectEvent.subscribe(function(dat) { /* alert(dat); */ }),
		    new joFooter([
		       new joDivider(),
		       backbutton = new joButton("terug").selectEvent.subscribe(function()
		         {
		   	   stack.pop();
                         })
		                 ])
                   ]).setTitle("<img src='images/icons/Doc.png' style='height:30px;vertical-align:middle'>&nbsp;&nbsp;&nbsp;Rithistorie");

	        var overzichthistoriedl = new joSQLDataSource(jodb); //data source voor jolist queries etc
	        overzichthistoriedl.changeEvent.subscribe(function(data) { historiesel.setData(data);  });

                historiesel.formatItem = function(data, index)
	         {
                   display = data.aankomsttijdstip.substring(8,10)+"-"+data.aankomsttijdstip.substring(5,7)+"-"+data.aankomsttijdstip.substring(0,4)+" "+data.vertrektijdstip.substring(11,16)+"u / "+data.aankomsttijdstip.substring(11,16)+"u<br>"+data.vertrekstraat+" "+data.vertrekhuisnummer+" "+data.vertrekhuisnummertoevoeging+" "+data.vertrekpostcode+" "+data.vertrekplaats+"<br>"+data.aankomststraat+" "+data.aankomsthuisnummer+" "+data.aankomsttoevoeging+" "+data.aankomstpostcode+" "+data.aankomstplaats; //hier evt velden combineren
                   return joList.prototype.formatItem.call(this, display, index);
                 }	   
		
                rithistorie.activate = function ()
		 {
                   var d = new Date();
                   var curr_date = d.getDate(); if (curr_date<10) { curr_date="0"+curr_date; }
                   var curr_month   = d.getMonth() + 1; if (curr_month<10) { curr_month="0"+curr_month; }
                   var curr_year    = d.getFullYear();
                   var curr_hour    = d.getHours(); if (curr_hour<10) { curr_hour="0"+curr_hour; }
                   var curr_minutes = d.getMinutes(); if (curr_minutes<10) { curr_minutes="0"+curr_minutes; }
                   var ts = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minutes + ":00";
	           overzichthistoriedl.execute("select * from ritten where aankomsttijdstip < '"+ts+"' order by aankomsttijdstip DESC;");
		   //console.log(overzichthistoriedl);
		 }



		
//	was demoing how to disable a control, but decided having a "back"
// button was more important right now
//		cancelbutton.disable();
//		cancelbutton.selectEvent.subscribe(back, this);
		
		
		////////////////HIER HET MENU - VIEW KOPPELEN
		list.selectEvent.subscribe(function(id) {
			if (id == "nieuwerit")
			 { if (instelrecord.getProperty('userhash')=="")
			    { //geen login
			      stack.push(instellingen);
			    }
			   else
			    { //je hebt een gecontroleerde login; open scherm
 			      InitNieuweRit();
			      stack.push(nieuwerit);
			    }
			 }
			else if (id == "instellingen")
				stack.push(instellingen);
			else if (id == "geboekt")
			 { if (instelrecord.getProperty('userhash')=="")
			    { //geen login
			      stack.push(instellingen);
			    }
			   else
			    { //je hebt een gecontroleerde login; open scherm
			      stack.push(geboekt);
			    }
			 }
			else if (id == "rithistorie")
			 { if (instelrecord.getProperty('userhash')=="")
			    { //geen login
			      stack.push(rithistorie);
			    }
			   else
			    { //je hebt een gecontroleerde login; open scherm
			      stack.push(rithistorie);
			    }
			 }
			else if (id == "myCard")
				stack.push(myCard);
			else if (id == "ritoverzicht")
			 { if (instelrecord.getProperty('userhash')=="")
			    { //geen login
			      stack.push(instellingen);
			    }
			   else
			    { //je hebt een gecontroleerde login; open scherm
			      stack.push(ritoverzicht);
			    }
			 }
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
					      
	      var mymachtArr = jsObject.machtigingen.split("^");
              var velden;
	      var q;
              if (mymachtArr=="")
	       {
  	         scn.alert("Reactie van centrale", "Geen actieve machtigingen! U zult geen nieuwe ritten kunnen boeken!", function() {  });
	       }
	      begeleiding=0;

              for (var i=0; i<mymachtArr.length; i++)
	       { //hier 1 rit te pakken : splits velden
		 velden = mymachtArr[i].split("|");
	       //  q='INSERT INTO machtigingen (id,vertrektitel,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rittentegoed,rittenverreden,datumingang,datumeinde,verrichting,rolstoelvervoer,begeleiding,ondernemerscode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
	         q='INSERT INTO machtigingen (id,vertrektitel,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rittentegoed,rittenverreden,datumingang,datumeinde,verrichting,rolstoelvervoer,begeleiding,ondernemerscode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
		 jods.execute(q,velden)
		 if (velden[19]=="J") { begeleiding=1; }
	       }
	    }
	   else
	    { //error
	      alert("Fout! :"+jsObject.error);
	    }
	 }

	function InitNieuweRit()
	 { //leeg even het instelrecord voor een nieuwe rit;
	   instelrecord.setAutoSave(false);
           var inittime = new Date();
	   var day       = inittime.getDate(); if (day<10){ day="0"+day; }
	   var month     = inittime.getMonth()+1; if (month<10){ month="0"+month; }
	   var year      = inittime.getFullYear();
	   var hours     = inittime.getHours()+1; if (hours<10){ hours="0"+hours; }
	   if (hours>23) { hours="00"; }
	   var minutes   = 10*Math.round(inittime.getMinutes()/10); if (minutes==0) { minutes="00"; }
	   if (minutes>59) { minutes="00"; }
	   ritrecord.setProperty("vertrekadres","vertrekadres");
	   ritrecord.setProperty("aankomstadres","aankomstadres");
           ritrecord.setProperty("tijdstip",day+"-"+month+"-"+year+" "+hours+":"+minutes);
	   ritrecord.setProperty("aantalpersonen",0);
	   ritrecord.setProperty("opmerkingen","");
           ritrecord.setProperty("ritdatum",day+"-"+month+"-"+year),
           ritrecord.setProperty("rituur",(hours-6)),
           ritrecord.setProperty("ritminuut",(1*minutes)/5)
           ritrecord.setProperty("ritid",0);
	   instelrecord.setAutoSave(true);
	 }
	 
	function laadRitten(pasnummer,userhash)
	 { //deze functie regelt dat de machtigingen en ritten in de joDB komen
           var ms = new Date().getTime();
           var response = AjaxCall('http://tcrcentrale.netshaped.net/10/ritten/lijst/'+pasnummer+'/'+userhash+'/'+ms)
           //alert('http://tcrcentrale.netshaped.net/10/ritten/lijst/'+pasnummer+'/'+userhash+'/'+ms)
           //alert(response);

	   var jsObject = JSON.parse(response);
	   if (jsObject.status==1)
	    { //gevonden!

              jods.execute('drop table ritten;',[]);
              jods.execute('create table if not exists ritten(id,reiziger_id,vertrektitel,vertrektijdstip,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttitel,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rolstoel,begeleider,aantalpersonen,hulpmiddelen,ritopmerking,ondernemerscode,terugbelnummer);',[]);
              jods.execute('delete from ritten;');
					      
	      if (jsObject.ritten!="")
	       {
	         myrittenArr = jsObject.ritten.split("^");
                 var velden;
	         var q;

                 for (var i=0; i<myrittenArr.length; i++)
	          { //hier 1 rit te pakken : splits velden
		    velden = myrittenArr[i].split("|");
	            q='INSERT INTO ritten (id,reiziger_id,vertrektitel,vertrektijdstip,vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomsttitel,aankomsttijdstip,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,rolstoel,begeleider,aantalpersonen,hulpmiddelen,ritopmerking,ondernemerscode,terugbelnummer) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
		    //console.log(velden)
		    jods.execute(q,velden)
	          }
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
             tx.executeSql('SELECT vertrekstraat,vertrekhuisnummer,vertrekhuisnummertoevoeging,vertrekpostcode,vertrekplaats,aankomststraat,aankomsthuisnummer,aankomsttoevoeging,aankomstpostcode,aankomstplaats,begeleiding FROM machtigingen', [],
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
		    sorteerAdresPulldowns(); //aan het eind sorteren!

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
	   if (ritrecord.getProperty("ritid")>0)
	    { //update rit
	      var response = AjaxCall("http://tcrcentrale.netshaped.net/10/ritten/update/"+instelrecord.getProperty("userhash")+"/"+instelrecord.getProperty("pasnummer")+"/"+ritrecord.getProperty("ritid")+"/"+ritrecord.getProperty("vertrekpostcode")+"/"+ritrecord.getProperty("vertrekhuisnummer")+"/"+ritrecord.getProperty("aankomstpostcode")+"/"+ritrecord.getProperty("aankomsthuisnummer")+"/"+ritrecord.getProperty("tijdstip")+"/"+ritrecord.getProperty("aankomsttijdstip")+"/"+ritrecord.getProperty("aantalpersonen")+"/"+ritrecord.getProperty("rolstoel")+"/"+ritrecord.getProperty("hulpmiddelen")+"/"+ritrecord.getProperty("terugbelnummer")+"/"+ritrecord.getProperty("vertrekplaats")+"/"+ritrecord.getProperty("aankomstplaats")+"/"+ritrecord.getProperty("vertrekstraat")+"/"+ritrecord.getProperty("aankomststraat")+"/"+ritrecord.getProperty("opmerkingen"));
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
	   else
	    { //nieuwe rit
	      var response = AjaxCall("http://tcrcentrale.netshaped.net/10/ritten/nieuw/"+instelrecord.getProperty("userhash")+"/"+instelrecord.getProperty("pasnummer")+"/"+ritrecord.getProperty("vertrekpostcode")+"/"+ritrecord.getProperty("vertrekhuisnummer")+"/"+ritrecord.getProperty("aankomstpostcode")+"/"+ritrecord.getProperty("aankomsthuisnummer")+"/"+ritrecord.getProperty("tijdstip")+"/"+ritrecord.getProperty("aankomsttijdstip")+"/"+ritrecord.getProperty("aantalpersonen")+"/"+ritrecord.getProperty("rolstoel")+"/"+ritrecord.getProperty("hulpmiddelen")+"/"+ritrecord.getProperty("terugbelnummer")+"/"+ritrecord.getProperty("vertrekplaats")+"/"+ritrecord.getProperty("aankomstplaats")+"/"+ritrecord.getProperty("vertrekstraat")+"/"+ritrecord.getProperty("aankomststraat")+"/"+ritrecord.getProperty("opmerkingen"));
	      var jsObject = JSON.parse(response);
	      //alert(jsObject);
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





















document.addEventListener("backbutton", backKeyDown, true);

function backKeyDown()
 {
   //alert("back key was pressed!");
   //alert(App);
   var stack = App.getStack();
   if (stack.index>0)
    {
      stack.pop();
    }
   else
    {
      if(confirm("DVG Ziekenvervoer sluiten?")){navigator.app.exitApp();}
    }
 }


/**
document.addEventListener("backbutton", function(e){
       if($.mobile.activePage.is('#homepage')){
           e.preventDefault();
           navigator.app.exitApp();
       }
       else {
           //navigator.app.backHistory()
	   alert("back!");
       }
    }, false);
**/


App.init();

}


