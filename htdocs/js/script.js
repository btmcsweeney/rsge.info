var graph=0, curGraph = 0,
    graphName, savedGraphs;

function makeGraph(titleText, seriesData) {
    graph = new Highcharts.StockChart({
        chart: {
            renderTo: 'graph',
            type: 'spline',
            reflow: false,
            height: $(window).height() - $('header').outerHeight() - $('footer').outerHeight() - $('#top-ad').outerHeight() - $('nav').outerHeight() - $('.inner-header').outerHeight()
        },
        title: {
            text: titleText,
            style: {
                color: '#3E576F',
                fontSize: '24px',
                fontWeight: 'bold'
            }
        },
        rangeSelector: {
            buttons: [
                {
                    type: 'week',
                    count: 2,
                    text: '2w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 2,
                    text: '2m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }
            ],
            inputBoxStyle: {
                display: 'none'
            },
            selected: 1
        },
        xAxis: {
            dateTimeLabelFormats: {
                month: '%e. %b',
                year: '%b'
            }
        },
        yAxis: {
            title: 'Price'
        },
        series: [{
            title: titleText,
            marker: {
                enabled: true,
                radius: 4
            },
            data: seriesData
        }],
        tooltip: {
            formatter: function() {
                var s = Highcharts.dateFormat('%A, %b. %e', this.x) + '<br/>';
                $.each(this.points, function(i, point) {
                    s+= addCommas(point.y) + ' gp';
                });
                return s;
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
    if (graph) { graph.setSize($(window).width() - 166, mainHeight - $('.inner-header').outerHeight()); }
}

function graphItem(id) {
    curGraph = id;
    $('#graph').html('<img src="img/loader.gif">');
    graph = null;
    $('#saveGraphButton').addClass("hidden");
    $.post('ajax/getprices.ajax.php', { "id": id }, function(result) {
        if (result !== "") {
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
            makeGraph(graphName, series.data);
            
            $('#graphItemInput').val('');
            if ($('.savedGraphButton[value=' + id + ']').length > 0) {
                $('#saveGraphButton').html('Unsave');
            } else {
                $('#saveGraphButton').html('Save');
            }
            $('#saveGraphButton').removeClass("hidden");
            $('#graphItemInput').blur();
            window.location = '#' + id;
        }
    });
}

function getSavedGraphs() {
    if ($.cookie('items') !== null) {
        savedGraphs = $.cookie('items').split('|');
        for (var saved in savedGraphs) {
            var i = savedGraphs[saved].split('_');
            $('#userGraphs').append('<button class="savedGraphButton" value="' + i[0] + '">' + i[1] + '</button>');
        }
    }
}

function saveGraph(id) {
    if ($('#saveGraphButton').html() === 'Unsave') { // If we are unsaving the graph
        var savedGraphs = $.cookie('items').split('|');
        $.cookie('items', null);
        for (var saved in savedGraphs) {
            var i = savedGraphs[saved].split('_');
            if (i[0] != id) {
                if ($.cookie('items') !== null) {
                    $.cookie('items', ($.cookie('items') + '|' + i[0] + '_' + i[1]), {
                        expires: 500
                    });
                } else {
                    $.cookie('items', i[0] + '_' + i[1], {
                        expires: 500
                    });
                }
            }
        }
        $('.savedGraphButton[value=' + id + ']').remove();
        $('#saveGraphButton').html('Save');
    } else { // If we are saving the graph
        if ($.cookie('items') !== null) {
            $.cookie('items', ($.cookie('items') + '|' + curGraph + '_' + graphName), {expires: 500});
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

//Call on load
$(function() {
    setHeight();
    getSavedGraphs();
    
    $('.itemSearch').autocomplete({
        source: 'ajax/itemsearch.ajax.php',
        minLength: 2,
        delay: 200,
        select: function(event, ui) {
            $.post('ajax/searchcount.ajax.php', { "id": ui.item.id });
            window.location = '#' + ui.item.id;
        }
    }).data('autocomplete')._renderItem = function(ul, item) {
        return $('<li></li>').data('item.autocomplete', item).append('<a><span class="asPrice">' + item.label + '</span></a><hr>').appendTo(ul);
    };

    $('#graphItem').submit(function(event) {
        event.preventDefault();
    });
    
    $('input[placeholder], textarea[placeholder]').placeholder();

    $('.savedGraphButton').click(function() {
        window.location = '#' + $(this).val();
    });
    
    $('#saveGraphButton').click(function() {
        saveGraph(curGraph);
    });
    
    $(window).resize(function() {
        setHeight();
    }).on('hashchange', function() {
       graphItem(window.location.hash.substr(1));
    });
    
    if (window.location.hash) {
        graphItem(window.location.hash.substr(1));
    }
    
    checkForUpdate();
});