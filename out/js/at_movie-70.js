function pageLoaded(){
	   document.all_search.search_term.focus();
	}
function checkinput()
	{ 
	     if ((document.all_search.search_term.value == "") || (document.all_search.search_term.value.length ==0))
	        {
        	       alert("�j�M�r�ꤣ�i�ťաI�I\n�Э��s��J�d�ߡI");
		       document.all_search.search_term.focus();
        	       return false;
        	}        
	}
function changepage(pid){
		document.getElementById(pid).style.color = "CCC";
		document.getElementById(pid).class = "current";
		}
function treemenu(myid){
	if( document.getElementById(myid).style.display == "none")
		document.getElementById(myid).style.display = "block";		
	else
		document.getElementById(myid).style.display = "none";
		}
function treemenu2(myid,active){
	if( active = 1 )
		document.getElementById(myid).style.display = "block";		
	elseif( active = 0 )
		document.getElementById(myid).style.display = "none";
		}
function changeSrc(treeID,iconID) {
  if( document.getElementById(treeID).style.display == "block")
      document.getElementById(iconID).src="/images/icon_open01.gif";	  
  else
	  document.getElementById(iconID).src="/images/icon_open01-.gif";
  }

function closeit(myid){
		document.getElementById(myid).style.display = "none";
		}
		
function openit(myid){
		document.getElementById(myid).style.display = "block";
		}
function MM_openBrWindow(theURL,winName,features) { //v2.0
  			window.open(theURL,winName,features);
		}