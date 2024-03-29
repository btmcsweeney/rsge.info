var graph, curGraph = 0,
    graphName, mode = 'main',
    savedGraphs;
var items = [];

function makeGraph(title) {
    graph = new Highcharts.Chart({
        chart: {
            renderTo: 'graph',
            type: 'spline',
            reflow: false,
            height: $(window).height() - $('header').outerHeight() - $('footer').outerHeight() - $('#top-ad').outerHeight() - $('nav').outerHeight() - $('.inner-header').outerHeight()
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
            maxPadding: 0.03
        },
        yAxis: {
            title: 'Price'
        },
        tooltip: {
            formatter: function() {
                return Highcharts.dateFormat('%A, %b. %e', this.x) + '<br/>' + addCommas(this.y) + ' gp';
            }
        }
    });
    $(".highcharts-container text:contains('Highcharts')").remove();
}

function checkForUpdate() {
    $.get('ajax/checkupdate.ajax.php', function(result) {
        $('#update-times').html(result);
    });
    setTimeout("checkForUpdate();", 15000);
}

function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function setHeight() {
    var mainHeight = $(window).height() - $('header').outerHeight() - $('footer').outerHeight() - $('#top-ad').outerHeight() - $('nav').outerHeight();
    $('#main-container').height(mainHeight);
    $('aside').height($(window).height() - $('header').outerHeight() - $('nav').outerHeight());
    graph.setSize($(window).width() - 144, mainHeight - $('.inner-header').outerHeight());
}

function graphItem(id, minTime) {
    curGraph = id;
    while (graph.series.length) {
        graph.series[0].remove(false);
    }
    $.post('ajax/getprices.ajax.php', { "id": id, "mintime": minTime }, function(result) {
        if (result != "") {
            var series = {
                data: []
            };
            var values = result.split(';');
            $.each(values, function(valNum, val) {
                if (valNum === 0) {
                    series.name = val;
                    graphName = val;
                } else {
                    var point = [];
                    var points = val.split(',');
                    $.each(points, function(pointNum, pointVal) {
                        point.push(pointVal * 1);
                    });
                    series.data.push(point);
                }
            });
            if (graph == null) {
                makeGraph(graphName);
            }
            graph.addSeries(series);
            $('#graphItemInput').val('');
            if ($('.savedGraphButton[value=' + id + ']').length > 0) {
                $('#saveGraphButton').html('Unsave');
            } else {
                $('#saveGraphButton').html('Save');
            }
            $('#saveGraphButton').removeClass("hidden");
            //$('#timeRangeSelect').removeClass("hidden");
            $('#timeRangeSelect_chzn').removeClass("hidden");
        }
    });
    $('#graph').html('<img src="img/loader.gif">');
    graph = null;
    $('#saveGraphButton').addClass("hidden");
    //$('#timeRangeSelect').addClass("hidden");
    $('#timeRangeSelect_chzn').addClass("hidden");
}

function getSavedGraphs() {
    if ($.cookie('items') != null) {
        savedGraphs = $.cookie('items').split('-');
        for (var saved in savedGraphs) {
            var i = savedGraphs[saved].split('_');
            $('#userGraphs').append('<button class="savedGraphButton" value="' + i[0] + '">' + i[1] + '</button>');
        }
    }
}

function saveGraph(id) {
    if ($('#saveGraphButton').html() == 'Unsave') {
        savedGraphs = $.cookie('items').split('-');
        $.cookie('items', null);
        for (var saved in savedGraphs) {
            var i = savedGraphs[saved].split('_');
            if (i[0] != id) {
                if (saved != 0) {
                    $.cookie('items', ($.cookie('items') + '-' + i[0] + '_' + i[1]), {
                        expires: 500
                    });
                } else {
                    $.cookie('items', i[0] + '_' + i[1], {
                        expires: 500
                    });
                }
            }
        }
        $('.savedGraphButton[value=' + id + ']').hide();
    } else {
        if ($.cookie('items') != null) {
            $.cookie('items', ($.cookie('items') + '-' + curGraph + '_' + graphName), {expires: 500});
        } else {
            $.cookie('items', curGraph + '_' + graphName, {expires: 500});
        }
        $('#userGraphs').append('<button class="savedGraphButton" value="' + curGraph + '">' + graphName + '</button>');
        $('.savedGraphButton').click(function() {
            graphItem($(this).val(), $('#timeRangeSelect').val() * 60 * 60 * 24);
        });
        $('#saveGraphButton').html('Unsave');
    }
}

function loadGraphMode() {
    makeGraph(null);
    $('.chzn-select').chosen();
    $('#timeRangeSelect_chzn').addClass("hidden").css('width', '88px').children('.chzn-drop').css('width', '86px');
    $('.itemSearch').autocomplete({
        source: 'ajax/itemsearch.ajax.php',
        minLength: 2,
        select: function(event, ui) {
            $.post('ajax/searchcount.ajax.php', { "id": ui.item.id });
            graphItem(ui.item.id, $('#timeRangeSelect').val() * 60 * 60 * 24);
            items.push(ui.item.id);
        }
    }).data('autocomplete')._renderItem = function(ul, item) {
        return $('<li></li>').data('item.autocomplete', item).append('<a><span class="asPrice">' + item.label + '</span></a><hr>').appendTo(ul);
    };

    $('#graphItem').submit(function(event) {
        event.preventDefault();
    });

    $('#removeItemSelect').change(function(event, ui) {
        var seriesNum = $('#removeItemSelect').val();
        items.splice(seriesNum, 1);
        graph.series[seriesNum].remove();
        var newOptions = '<option value=""></option>';
        for (var x in graph.series) {
            newOptions += '<option value="' + x + '">' + graph.series[x].name + '</option>';
        }
        $('#removeItemSelect').empty().html(newOptions).trigger('liszt:updated');
    });

    $('#timeRangeSelect').change(function(event, ui) {
        var seconds = $('#timeRangeSelect').val() * 60 * 60 * 24;
        while (graph.series.length) {
            graph.series[0].remove(false);
        }
        $('#removeItemSelect').empty().html('<option value=""></option>').trigger('liszt:updated');
        graphItem(curGraph, seconds);
        graph.redraw();
    });

    $('#saveGraphButton').click(function() {
        saveGraph(curGraph);
    });

    $('#deleteGraphButton').click(function() {
        deleteGraph(curGraph);
    });
    mode = 'graph';
}


//Call on load
$(function() {
    loadGraphMode();
    setHeight();
    getSavedGraphs();
    checkForUpdate();

    $('.savedGraphButton').click(function() {
        graphItem($(this).val(), $('#timeRangeSelect').val() * 60 * 60 * 24);
    });
    
    $(window).resize(function() {
        setHeight();
    });
});