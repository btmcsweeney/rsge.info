var graph, curGraph=0, graphName, mode='main', savedGraphs;
var d=new Date();
var items=new Array();

function makeGraph(title){
    graph=new Highcharts.Chart({
	chart: {
	    renderTo: 'graph',
	    type: 'spline',
	    reflow: false,
	    height: $(window).height()-$('header').outerHeight()-$('footer').outerHeight()-$('#top-ad').outerHeight()-$('nav').outerHeight()-$('.inner-header').outerHeight()
	},
	title: {
	    text: title
	},
	xAxis: {
	    type: 'datetime',
	    dateTimeLabelFormats: {
		month: '%e. %b',
		year: '%b'
	    },
	    maxPadding: .03
	},
	yAxis: {
	    title: 'Price',
	},
	tooltip: {
	    formatter: function() {
		return '<b>'+ this.series.name +'</b><br/>'+
		Highcharts.dateFormat('%e. %b', this.x) +': '+ addCommas(this.y) +' gp';
	    }
	}
    });
    $(".highcharts-container text:contains('Highcharts')").remove();
}

function checkForUpdate()  {
    $.get('ajax/checkupdate.ajax.php', function(result) {
	$('#update-times').html(result);
    });
    setTimeout("checkForUpdate();", 15000);
}

function addCommas(nStr)
{
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
	x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function setHeight() {
    var mainHeight=$(window).height()-$('header').outerHeight()-$('footer').outerHeight()-$('#top-ad').outerHeight()-$('nav').outerHeight();
    $('#main-container').height(mainHeight);
    $('aside').height($(window).height()-$('header').outerHeight()-$('nav').outerHeight());
    graph.setSize($(window).width()-144, mainHeight-$('.inner-header').outerHeight());
}

function addItem(id, minTime) {
    curGraph=id;
    while (graph.series.length) {
	graph.series[0].remove(false);
    }
    $.post('ajax/getprices.ajax.php', {"id": id, "mintime": minTime}, function(result) {
	if (result!="") {
	    var series={data: []};
	    var values=result.split(';');
	    $.each(values, function(valNum, val){
		if (valNum===0){
		    series.name=val;
		    graphName=val;
		} else {
		    var point=new Array();
		    var points=val.split(',');
		    $.each(points, function(pointNum, pointVal){
			point.push(pointVal*1);
		    });
		    series.data.push(point);
		}
	    });
	    if (graph==null) { makeGraph(graphName); }
	    graph.addSeries(series);
	    $('#addItemInput').val('');
	    if ($('.savedGraphButton[value='+id+']').length>0) {
		$('#saveGraphButton').html('Unsave');
	    } else {
		$('#saveGraphButton').html('Save');
	    }
	}
    });
    $('#graph').html('<img src="img/loader.gif">');
    graph=null;
}

function getSavedGraphs() {
    if ($.cookie('items')!=null) {
	savedGraphs=$.cookie('items').split('-');
	for (var saved in savedGraphs) {
	    var i=savedGraphs[saved].split('_');
	    $('#userGraphs').append('<button class="savedGraphButton" value="'+i[0]+'">'+i[1]+'</button>');
	}
    }
}

function saveGraph(id) {
    if ($('#saveGraphButton').html()=='Unsave') {
	savedGraphs=$.cookie('items').split('-');
	$.cookie('items', null);
	for (saved in savedGraphs) {
	    i=savedGraphs[saved].split('_');
	    if (i[0]!=id) {
		if (saved!=0) {
		    $.cookie('items', ($.cookie('items')+'-'+i[0]+'_'+i[1]), { expires: 500});
		} else {
		    $.cookie('items', i[0]+'_'+i[1], { expires: 500});
		}
	    }
	}
	$('.savedGraphButton[value='+id+']').hide();
    } else {
	if ($.cookie('items')!=null) {
	    $.cookie('items', ($.cookie('items')+'-'+curGraph+'_'+graphName), { expires: 500});
	} else {
	    $.cookie('items', curGraph+'_'+graphName, { expires: 500});
	}
	$('#userGraphs').append('<button class="savedGraphButton" value="'+curGraph+'">'+graphName+'</button>');
	$('.savedGraphButton').click(function(){
	    addItem($(this).val(), $('#timeRangeSelect').val()*60*60*24);
	});
	$('#saveGraphButton').html('Unsave');
    }
}

function unsaveGraph(id) {
    savedGraphs=$.cookie('items').split('-');
    for (saved in savedGraphs) {
	i=savedGraphs[saved].split('_');
	if (i[0]!=id) {
	    if (saved!=0) {
		$.cookie('items', ($.cookie('items')+'-'+curGraph+'_'+graphName), { expires: 500});
	    } else {
		$.cookie('items', curGraph+'_'+graphName, { expires: 500});
	    }
	}
    }
}

function loadGraphMode() {
    //$.post('inc/graph.inc.php', function(result){
	//$('#main-container').html(result);
	makeGraph(null);
	$('.chzn-select').chosen();
	$('#removeItemSelect_chzn').css('width','148px').children('.chzn-drop').css('width','146px');
	$('#timeRangeSelect_chzn').css('width','88px').children('.chzn-drop').css('width','86px');
	$('.itemSearch').autocomplete({
	    source: 'ajax/itemsearch.ajax.php',
	    minLength: 2,
	    select: function(event,ui){
		$.post('ajax/searchcount.ajax.php', {"id": ui.item.id});
		addItem(ui.item.id, $('#timeRangeSelect').val()*60*60*24);
		items.push(ui.item.id);
	}
	}).data( 'autocomplete' )._renderItem = function( ul, item ) {
	    return $( '<li></li>' )
	    .data( 'item.autocomplete', item )
	    .append( '<a><span class="asPrice">' + item.label + '</span></a><hr>' )
	    .appendTo( ul );
	};
    
	$('#addItem').submit(function(event) {
	    event.preventDefault();
	});
	
	$('#removeItemSelect').change(function(event,ui) {
	    var seriesNum=$('#removeItemSelect').val();
	    items.splice(seriesNum,1);
	    graph.series[seriesNum].remove();
	    var newOptions='<option value=""></option>';
	    for (x in graph.series){
		newOptions+='<option value="'+x+'">'+graph.series[x].name+'</option>';
	    }
	    $('#removeItemSelect').empty().html(newOptions).trigger('liszt:updated');
	});
	
	$('#timeRangeSelect').change(function(event,ui) {
	    var seconds=$('#timeRangeSelect').val()*60*60*24;
	    while (graph.series.length) {
		graph.series[0].remove(false);
	    }
	    $('#removeItemSelect').empty().html('<option value=""></option>').trigger('liszt:updated');
	    addItem(curGraph, seconds);
	    graph.redraw();
	});
	
	$('#saveGraphButton').click(function(){
	    saveGraph(curGraph);
	});
	
	$('#deleteGraphButton').click(function(){
	    deleteGraph(curGraph);
	});
	mode='graph';
    //});
}

function loadCalculatorMode() {
    $.post('inc/calculator.inc.php', function(result){
	$('#main-container').html(result);
    });
    $('#newCalcButton').click(function(){
	$('#newCalcDialog').dialog('open');
    });
    
    $('#switchMode').html('Switch to Graph');
    mode='calculator';
}


//Call on load
$(function(){
    loadGraphMode();
    setHeight();
    //$.cookie('items', null);
    getSavedGraphs();
    //checkForUpdate();
    
    $('#signUpButton').click(function(){
	$('#signUpForm').dialog('open');
    });
    $('#signUpForm').dialog({
	autoOpen: false,
	width: 250,
	resizable: false,
	modal: true,
	buttons: {
	    'Create Account': function() {
		    $(this).submit();
		},
	    'Cancel': function() {
		$(this).dialog('close');
	    }
	},
	close: function() {
	    $('#signUpForm input').val('');
	    $('#signUpStatus').html('');
	}
    })
    .submit(function(event) {
	event.preventDefault();
	$('.ui-dialog-buttonset button').attr('disabled','disabled');
	$('#signUpStatus').html("Please wait, processing...");
	$.post('ajax/signup.ajax.php', $('#signUpForm').serialize(), function(result) {
	    if (result=='ok') {
		$('.ui-dialog-buttonpane').detach();
		$('#signUpStatus').html("You must activate your account before you can log in. An activation email has been sent to the supplied address.");
	    } else {
		$('#signUpStatus').html(result);
		$('.ui-dialog-buttonset button').removeAttr('disabled');
	    }
	});
    });
    
    $('#loginForm').submit(function(event) {
	event.preventDefault();
	$.post('ajax/login.ajax.php', $('#loginForm').serialize(), function(result) {
	    if (result=='ok') {
		location.reload();
	    } else {
		$('#loginError').html(result);
	    }
	});
    });
    
    $('.savedGraphButton').click(function(){
	addItem($(this).val(), $('#timeRangeSelect').val()*60*60*24);
    });
    $('.savedCalcSetButton').click(function(){
	loadCalcSet($(this).val());
    });
    
    $('#saveAsDialog').dialog({
	autoOpen: false,
	resizable: false,
	modal: true,
	buttons: {
	    'Save Graph': function() {
		saveGraphAs($('#saveGraphTitle').val());
		$(this).dialog('close');
	    }
	}
    });
    
    $('#newCalcDialog').dialog({
	autoOpen: false,
	modal: true,
	width: 300
    });
    $('#newCalcDialog button').click(function(){
	$('#newCalcDialog').dialog({title: 'New '+$(this).html()+' Calculator'});
	$.post('ajax/calctypes.ajax.php', {'type': $(this).val()}, function(result){
	    $('#newCalcDialog').html(result);
	});
    });
    
    $('#calcSyntaxDialog').dialog({
	autoOpen: false,
	width: 800
    });
    
    $(window).resize(function(){setHeight();});
});