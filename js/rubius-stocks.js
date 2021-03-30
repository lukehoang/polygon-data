window.addEventListener('DOMContentLoaded', (event) => {

  //   API Calls
  // Get snapshot and prepare data
//   var apiKey = jsonData[0].key;
  var apiKey = "S_Z5wqYZOglnJCXkswa3azp5Wj9YRNFF";
  getSnapshot(apiKey);
  let dayData = getTrade(apiKey, 'day');
  let weekData = getTrade(apiKey, 'week');
  let monthData = getTrade(apiKey, 'month');
  let yearData = getTrade(apiKey, 'year');

  selectedView = "1D";

  function createSimpleSwitcher(items, activeItem, activeItemChangedCallback) {
  	let switcherElement = document.createElement('div');
  	switcherElement.classList.add('switcher');
  
  	let intervalElements = items.map(function(item) {
  		let itemEl = document.createElement('button');
  		itemEl.innerText = item;
  		itemEl.classList.add('switcher-item');
  		itemEl.classList.toggle('switcher-active-item', item === activeItem);
  		itemEl.addEventListener('click', function() {
  			onItemClicked(item);
  			selectedView = item;
  			setLastBarText(selectedView);
  		});
  		switcherElement.appendChild(itemEl);
  		return itemEl;
  	});
  
  	function onItemClicked(item) {
  		if (item === activeItem) {
  			return;
  		}
  
  		intervalElements.forEach(function(element, index) {
  			element.classList.toggle('switcher-active-item', items[index] === item);
  		});
  
  		activeItem = item;
  
  		activeItemChangedCallback(item);
  	}
  
  	return switcherElement;
  }
  
  let intervals = ['1D', '1W', '1M', '1Y'];

  let seriesesData = new Map([
    ['1D', dayData ],
    ['1W', weekData ],
    ['1M', monthData ],
    ['1Y', yearData ],
  ]);
  
  let switcherElement = createSimpleSwitcher(intervals, intervals[0], syncToInterval);
    
  let chartElement = document.createElement('div');
  chartElement.classList.add('stock-chart_ins');
  
  let width = 900;
  let height = 400;
  
  let chart = LightweightCharts.createChart(chartElement, {
  	width: width,
  	height: height,
  	priceScale: {
      position: 'right',
      mode: 2,
      autoScale: true,
      invertScale: false,
      alignLabels: false,
      borderVisible: false,
      borderColor: '#555ffd',
      scaleMargins: {
          top: 0.30,
          bottom: 0.25,
      },
    },
  	timeScale: {
		rightOffset: 50,
		fixLeftEdge: true,
		lockVisibleTimeRangeOnResize: true,
		rightBarStaysOnScroll: true,
		borderVisible: true,
		borderColor: '#fff000',
		visible: true,
		timeVisible: true,
		secondsVisible: true,
  		// tickMarkFormatter: (time) => {
  		// 	const date = new Date(time.year, time.month, time.day);
  		// 	return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
  		// },
  	},
  	grid: {
  		horzLines: {
  			color: '#eee',
        visible: false,
  		},
  		vertLines: {
  			color: '#ffffff',
  		},
  	},
    crosshair: {
  		horzLine: {
      	visible: false,
        labelVisible: false
      },
      vertLine: {
      	visible: true,
        style: 0,
        width: 2,
        color: 'rgba(32, 38, 46, 0.1)',
        labelVisible: false,
      }
    },
  });
  
  document.getElementById('rubius-stock-chart').appendChild(chartElement);
  chartElement.appendChild(switcherElement);
        
  let areaSeries = null;
  
  async function syncToInterval(interval) {
  	if (areaSeries) {
  		chart.removeSeries(areaSeries);
  		areaSeries = null;
  	}
  	
  	// Compare Last Two Prices to Set Colors
	let data = await seriesesData.get(interval);  
	console.log(data);	
  	let secLatestPrice = data[data.length - 2].value;
  	let latestPrice = data[data.length - 1].value;
  	
  	let topColor;
  	let bottomColor;
  	let lineColor;
  	
  	if (latestPrice > secLatestPrice) {
    	topColor = 'rgba(132, 189, 0, 0.4)';
    	bottomColor = 'rgba(234, 247, 204, 0.0)';
    	lineColor = 'rgba(132, 189, 0, 1.0)'; 
  	} else {
    	topColor = 'rgba(196, 33, 45, 0.4)';
    	bottomColor = 'rgba(228, 194, 196, 0.0)';
    	lineColor = 'rgba(196, 33, 45, 1.0)';
  	}
  	
  	areaSeries = chart.addAreaSeries({
      topColor: topColor,	
      bottomColor: bottomColor,
    	lineColor: lineColor,
    	lineWidth: 3
  	});
  	areaSeries.setData(data);
  }
  
  syncToInterval(intervals[0]);
        
  function businessDayToString(businessDay) {
  	return new Date(Date.UTC(businessDay.year, businessDay.month - 1, businessDay.day, 0, 0, 0)).toLocaleDateString();
  }
  
  var toolTipWidth = 80;
  var toolTipHeight = 80;
  var toolTipMargin = 15;
  
  var toolTip = document.createElement('div');
  toolTip.className = 'floating-tooltip-2';
  chartElement.appendChild(toolTip);
  
  // update tooltip
  chart.subscribeCrosshairMove(function(param) {
  		if (param.point === undefined || !param.time || param.point.x < 0 || param.point.x > chartElement.clientWidth || param.point.y < 0 || param.point.y > chartElement.clientHeight) {
  			toolTip.style.display = 'none';
  		} else {
  			const dateStr = businessDayToString(param.time);
  			toolTip.style.display = 'block';
  			let price = param.seriesPrices.get(areaSeries);
  			toolTip.innerHTML = '<div style="color: #c4212d">Rubius Therapeutics Inc.</div><div style="font-size: 24px; margin: 4px 0px; color: #21384d">' + Math.round(100 * price) / 100 + '</div><div style="color: #21384d">' + dateStr + '</div>';
  			var coordinate = param.seriesPrices.get(areaSeries);
  			var shiftedCoordinate = param.point.x - 50;
  			if (coordinate === null) {
  				return;
  			}
  			shiftedCoordinate = Math.max(0, Math.min(chartElement.clientWidth - toolTipWidth, shiftedCoordinate));
  			var coordinateY = coordinate - toolTipHeight - toolTipMargin > 0 ? coordinate - toolTipHeight - toolTipMargin : Math.max(0, Math.min(chartElement.clientHeight - toolTipHeight - toolTipMargin, coordinate + toolTipMargin));
  			toolTip.style.left = shiftedCoordinate + 'px';
  			toolTip.style.top = coordinateY + 'px';
  		}
  });
      
/*
  let toolTipMargin = 10;
  let priceScaleWidth = 50;
  let toolTip = document.createElement('div');
  toolTip.className = 'three-line-legend';
  chartElement.appendChild(toolTip);
  toolTip.style.display = 'block';
  toolTip.style.left = 3 + 'px';
  toolTip.style.top = 3 + 'px';
  
  function setLastBarText() {
    let data = seriesesData.get(selectedView);
  	let dateStr = data[data.length - 1].time.year + '/' + data[data.length - 1].time.month + '/' + 	data[data.length - 1].time.day;
  	 toolTip.innerHTML =	'<div style="font-size: 24px; margin: 4px 0px; color: #20262E"> RUBY</div>'+ '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' + (Math.round(data[data.length-1].value * 100) / 100).toFixed(2)+ '</div>' +
  		'<div>' + dateStr + '</div>';
  }
  
  setLastBarText(); 
  
  chart.subscribeCrosshairMove(function(param) {
    if ( param === undefined || param.time === undefined || param.point.x < 0 || param.point.x > width || param.point.y < 0 || param.point.y > height ) {
  	setLastBarText();   
    } else {
    	dateStr = param.time.year +'/'+ param.time.month + '/' + param.time.day;
    	let price = param.seriesPrices.get(areaSeries);
    	toolTip.innerHTML =	'<div style="font-size: 24px; margin: 4px 0px; color: #20262E"> RUBY</div>'+ '<div style="font-size: 22px; margin: 4px 0px; color: #20262E">' + (Math.round(price * 100) / 100).toFixed(2) + '</div>' + '<div>' + dateStr + '</div>';
    }
  });
*/
  
  // Resize chart
  function resize() {
    let width = document.querySelector('.stock-chart_ins').offsetWidth;
    let height = document.querySelector('.stock-chart_ins').offsetHeight;
    chart.applyOptions({ width: width})
  }
  
  window.addEventListener('load', resize);
  window.addEventListener('resize', resize);
	





  //Get SnapShot of a ticker (RUBY)
	function getSnapshot (apiKey) {
		fetch('https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/RUBY?&apiKey='+apiKey)
		.then(
			response => response.json()
		).then(
			data => {
				let tickerSnapshot = data.ticker;
				// console.log(tickerSnapshot);

				// manipulate the DOM
				document.querySelector('.rubius-stock-price_ticker').innerHTML = tickerSnapshot.ticker;

				document.querySelector('.rubius-stock-price_price').innerHTML = "$"+tickerSnapshot.lastQuote['P'];

				document.querySelector('.rubius-stock-price_change').innerHTML = tickerSnapshot.todaysChange;

				
				if(tickerSnapshot.todaysChange >= 0){
					document.querySelector('.rubius-stock-price_change').classList.add('green');
					document.querySelector('.rubius-stock-price_change').innerHTML = "+" + tickerSnapshot.todaysChange + " " + "(+" + tickerSnapshot.todaysChangePerc  + "%)";
				}else{
					document.querySelector('.rubius-stock-price_change').classList.add('red');
					document.querySelector('.rubius-stock-price_change').innerHTML = "-" + tickerSnapshot.todaysChange + " " + "(-" + tickerSnapshot.todaysChangePerc  + "%)";
				}

				document.querySelector('.rubius-stock-details_col-value_open').innerHTML = tickerSnapshot.day['o'];
				document.querySelector('.rubius-stock-details_col-value_prev-open').innerHTML = tickerSnapshot.prevDay['o'];

				document.querySelector('.rubius-stock-details_col-value_high').innerHTML = tickerSnapshot.day['h'];
				document.querySelector('.rubius-stock-details_col-value_prev-high').innerHTML = tickerSnapshot.prevDay['h'];
				
				document.querySelector('.rubius-stock-details_col-value_low').innerHTML = tickerSnapshot.day['l'];
				document.querySelector('.rubius-stock-details_col-value_prev-low').innerHTML = tickerSnapshot.prevDay['l'];
				

				document.querySelector('.rubius-stock-details_col-value_close').innerHTML = tickerSnapshot.day['c'];
				document.querySelector('.rubius-stock-details_col-value_prev-close').innerHTML = tickerSnapshot.prevDay['c'];

				document.querySelector('.rubius-stock-details_col-value_volume').innerHTML = tickerSnapshot.day['v'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				document.querySelector('.rubius-stock-details_col-value_prev-volume').innerHTML = tickerSnapshot.prevDay['v'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
		);
	}


	// Get historical data based on chart type (day, week, month, year)
	function getTrade (apiKey, chartType) {
		let dayDataResult = [];
		let timeSpan ,day_to, day_from;
		if(chartType == 'day'){
			multiplier = 5;
			timeSpan = 'minute';
			day_from = moment().subtract(5, 'days').format("YYYY-MM-DD");
		}else if(chartType == 'week'){
			multiplier = 30;
			timeSpan = 'minute';
			day_from = moment().subtract(4, 'weeks').format("YYYY-MM-DD");
		}else if(chartType == 'month'){
			multiplier = 1;
			timeSpan = 'day';
			day_from = moment().subtract(6, 'months').format("YYYY-MM-DD");
		}else if(chartType == 'year'){
			multiplier = 1;
			timeSpan = 'day';
			day_from = moment().subtract(2, 'years').format("YYYY-MM-DD");
		}
		day_to = moment().format("YYYY-MM-DD");
		return fetch('https://api.polygon.io/v2/aggs/ticker/RUBY/range/'+multiplier+'/'+timeSpan+'/'+day_from+'/'+day_to+'?unadjusted=true&sort=asc&limit=50000&apiKey='+apiKey)
		.then(
			response => response.json()
		).then(
			data => {
				let results = data.results;
				results.forEach(result => {
					dayDataResult.push(
						{ time: result.t/1000, value: result.c }
					);
				});
				return dayDataResult;
			}
		)
		
	}
});