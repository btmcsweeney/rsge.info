var graph, curGraph=0, mode='main';
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
		Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y +' gp';
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

function setHeight() {
    var mainHeight=$(window).height()-$('header').outerHeight()-$('footer').outerHeight()-$('#top-ad').outerHeight()-$('nav').outerHeight();
    $('#main-container').height(mainHeight);
    $('aside').height($(window).height()-$('header').outerHeight()-$('nav').outerHeight());
    graph.setSize($(window).width()-144, mainHeight-$('.inner-header').outerHeight());
}

function addItem(id, minTime) {
    while (graph.series.length) {
	graph.series[0].remove(false);
    }
    $.post('ajax/getpricesmongo.ajax.php', {"id": id, "mintime": minTime}, function(result) {
	if (result!="") {
	    var series={data: []};
	    var values=result.split(';');
	    $.each(values, function(valNum, val){
		if (valNum===0){
		    series.name=val;
		} else {
		    var point=new Array();
		    var points=val.split(',');
		    $.each(points, function(pointNum, pointVal){
			point.push(pointVal*1);
		    });
		    series.data.push(point);
		}
	    });
	    if (graph==null) { makeGraph(null); }
	    graph.addSeries(series);
	    $('#addItemInput').val('');
	    $('#removeItemSelect').append('<option value="'+(graph.series.length-1)+'">'+series.name+'</option>');
	    $('#removeItemSelect').trigger('liszt:updated');
	}
    });
}

function loadGraph(id) {
    if (mode!='graph') { loadGraphMode(); }
    $.post('ajax/loadgraph.ajax.php', {'id': id}, function(result) {
	if (result!='') {
	    while (graph.series.length) {
		graph.series[0].remove(false);
	    }
	    items.splice(0,items.length);
	    $('#removeItemSelect').empty().html('<option value=""></option>').trigger('liszt:updated');
	    var values=result.split('|');
	    $.each(values, function(valNum, val) {
		if (valNum===0) {
		    var title={text: val};
		    graph.setTitle(title);
		} else {
		    addItem(val, $('#timeRangeSelect').val()*60*60*24);
		    items.push(val);
		}
	    });
	    graph.redraw();
	    curGraph=id;
	}
    });
}

function loadCalcSet(id) {
    if (mode!='calculator') { loadCalculatorMode(); }
    $.post('ajax/getcalcset.ajax.php', {'id': id}, function(result) {
	var calcs=$.parseJSON(result);
	for (x in calcs) {
	    var calcString='<div class="calculation"><h3>'+calcs[x].title+'</h3>'+calcs[x].display+' = ';
	    if (eval(calcs[x].code)) { calcString+=eval(calcs[x].code)+'</div>'; }
	    else { calcString+='Syntax Error.</div>'; }
	    $('#calculations').append(calcString);
	}
    });
}

function saveGraphAs(title) {
    var itemsText=items.join('|');
    $.post('ajax/savegraph.ajax.php', {'title': title, 'items': itemsText}, function(result) {
	$('#userGraphs').append('<button onclick="loadGraph(\''+result+'\')">'+title+'</button>');
    });
}

/*function saveGraph(id) {
    var itemsText=items.join('|');
    $.post('ajax/savegraph.ajax.php', {'id': id, 'items': itemsText});
}*/
function saveGraph(id) {
    document.cookie='items='+id+';expires=1893477600000;path=/';
}

function deleteGraph(id) {
    $.post('ajax/deletegraph.ajax.php', {'id': id});
    $('.savedGraphButton[value="'+id+'"]').remove();
    while (graph.series.length) {
	graph.series[0].remove(false);
    }
    graph.setTitle({text: ' '});
    graph.redraw();
}

function loadMainMode() {
    $.post('inc/main.inc.php', function(result){
	$('#main-container').html(result);
	$('.itemSearch').autocomplete({
	    source: 'ajax/itemsearch.ajax.php',
	    minLength: 2,
	    select: function(event,ui){
		loadGraphMode();
		$.post('ajax/searchcount.ajax.php', {"id": ui.item.id});
		addItem(ui.item.id);
	    }
	}).data( 'autocomplete' )._renderItem = function( ul, item ) {
	    return $( '<li></li>' )
	    .data( 'item.autocomplete', item )
	    .append( '<a>' + item.label + '<br><span class="asPrice">' + item.price + ' GP</span></a><hr>' )
	    .appendTo( ul );
	};
    });
    mode='main';
}

function loadGraphMode() {
    $.post('inc/graph.inc.php', function(result){
	$('#main-container').html(result);
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
	    .append( '<a>' + item.label + '<br><span class="asPrice">' + item.price + ' GP</span></a><hr>' )
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
	    for (item in items) {
		addItem(items[item], seconds);
	    }
	    graph.redraw();
	});
	
	$('#saveGraphButton').click(function(){
	    saveGraph(curGraph);
	});
	
	$('#deleteGraphButton').click(function(){
	    deleteGraph(curGraph);
	});
	mode='graph';
    });
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
    checkForUpdate();
    
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
	loadGraph($(this).val());
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