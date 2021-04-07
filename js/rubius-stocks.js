window.addEventListener('DOMContentLoaded', (event) => {

  //   API Calls
  // Get snapshot and prepare data
//   var apiKey = jsonData[0].key;
  let apiKey = "S_Z5wqYZOglnJCXkswa3azp5Wj9YRNFF";
  let dayData,weekData,monthData,yearData;

	getSnapshot(apiKey);
	dayData = getTrade(apiKey, 'day');
	weekData = getTrade(apiKey, 'week');
	monthData = getTrade(apiKey, 'month');
	yearData = getTrade(apiKey, 'year');

  setInterval(function(){ 
	  getSnapshot(apiKey);
	   dayData = getTrade(apiKey, 'day');
	   weekData = getTrade(apiKey, 'week');
	   monthData = getTrade(apiKey, 'month');
	   yearData = getTrade(apiKey, 'year');
	   syncToInterval(selectedView);
  }, 3000);

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
  			// setLastBarText(selectedView);
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
		rightOffset: 12,
		fixLeftEdge: true,
		lockVisibleTimeRangeOnResize: true,
		rightBarStaysOnScroll: true,
		borderVisible: false,
		borderColor: '#fff000',
		visible: true,
		timeVisible: true,
		secondsVisible: false,
		tickMarkFormatter: (time, tickMarkType, locale) => {
            const newTime = LightweightCharts.isBusinessDay(time) ? time : moment.unix(time).format('HH:mm');
            return String(newTime);
		},
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
	// console.log(data);	
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

	chart.timeScale().fitContent();
	if(interval == '1D' || interval == '1W'){
		chart.applyOptions({
			timeScale: {
				rightOffset: 12,
				tickMarkFormatter: (time, tickMarkType, locale) => {
					const newTime = LightweightCharts.isBusinessDay(time) ? time : moment.unix(time).format('HH:mm');
					return String(newTime);
				},
			},
		});
	}else if(interval == '1M'){
		chart.applyOptions({
			timeScale: {
				rightOffset: 1,
				tickMarkFormatter: (time) => {
					const date = new Date(time.year, time.month, time.day);
					return date.getMonth() + '/' + date.getDate();
				},
			},
		});
	}else if(interval == '1Y'){
		chart.applyOptions({
			timeScale: {
				rightOffset: 1,
				tickMarkFormatter: (time) => {
					const date = new Date(time.year, time.month, time.day);
					return date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
				},
			},
		});
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
			var dateTest = moment(param.time);
			if(dateTest._i['day']){
				// console.log(dateTest._i);
				var dateStr = param.time.month+'/'+param.time.day+'/'+param.time.year;
			}else{
				var dateStr = moment.unix(param.time).format('MM/DD/YY HH:mm');
			}
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

		let currentPrice = 0;
		let todayOpen = 0;
		let todaysChange = 0;
		let todaysChangePercent = 0;

		//CHECK MARKET STATUS
		//GET CURRENT PRICE/ASK-PRICE
		fetch('https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/RUBY?&apiKey='+apiKey)
		.then(
			response => response.json()
		).then(
			data => {
				let tickerSnapshot = data.ticker;
				let tickerLastQuote = tickerSnapshot.lastQuote;
				let tickerDay = tickerSnapshot.day;
				let tickerPrevDay = tickerSnapshot.prevDay;
				let tickerTodayChange = tickerSnapshot.todaysChange;
				let tickerTodayChangePercent = tickerSnapshot.todaysChangePerc;
				// console.log(tickerSnapshot);
				// manipulate the DOM
				document.querySelector('.rubius-stock-price_price').innerHTML = "$"+tickerLastQuote["P"];
				document.querySelector('.rubius-stock-details_col-value_open').innerHTML = tickerDay.o?tickerDay.o:'N/A';
				document.querySelector('.rubius-stock-details_col-value_high').innerHTML = tickerDay.h?tickerDay.h:'N/A';
				document.querySelector('.rubius-stock-details_col-value_low').innerHTML = tickerDay.l?tickerDay.l:'N/A';
				document.querySelector('.rubius-stock-details_col-value_volume').innerHTML = tickerDay.v?tickerDay.v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):'N/A';

				document.querySelector('.rubius-stock-details_col-value_prev-close').innerHTML = tickerPrevDay.c?tickerPrevDay.c:'N/A';

				if(tickerTodayChange > 0){
					document.querySelector('.rubius-stock-price_change').classList.add('green');
					document.querySelector('.rubius-stock-price_change').innerHTML = "+" + tickerTodayChange + " " + "(+" + tickerTodayChangePercent  + "%)";
				}else{
					document.querySelector('.rubius-stock-price_change').classList.add('red');
					document.querySelector('.rubius-stock-price_change').innerHTML = tickerTodayChange + " " + "(" + tickerTodayChangePercent  + "%)";
				}
			}
		);


		


		//GET PRE DAY SNAPSHOT
		// preDay = moment().subtract(1, 'days').format("YYYY-MM-DD");
		// fetch('https://api.polygon.io/v2/aggs/ticker/RUBY/prev?unadjusted=true&apiKey='+apiKey)
		// .then(
		// 	response => response.json()
		// ).then(
		// 	data => {
		// 		let tickerSnapshot = data.results[0];
		// 		console.log(tickerSnapshot);
		// 		// manipulate the DOM
		// 		// document.querySelector('.rubius-stock-details_col-value_prev-open').innerHTML = tickerSnapshot.o?tickerSnapshot.o:'N/A';
		// 		// document.querySelector('.rubius-stock-details_col-value_prev-high').innerHTML = tickerSnapshot.h?tickerSnapshot.h:'N/A';
		// 		// document.querySelector('.rubius-stock-details_col-value_prev-low').innerHTML = tickerSnapshot.l?tickerSnapshot.l:'N/A';
				
		// 		// document.querySelector('.rubius-stock-details_col-value_prev-volume').innerHTML = tickerSnapshot.v?tickerSnapshot.v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):'N/A';
		// 	}
		// );

		
		

				
				
	}


	// Get historical data based on chart type (day, week, month, year)
	function getTrade (apiKey, chartType) {
		let dayDataResult = [];
		let timeSpan ,day_to, day_from;
		if(chartType == 'day'){
			multiplier = 5;
			timeSpan = 'minute';
			day_from = moment().subtract(0, 'days').format("YYYY-MM-DD");
		}else if(chartType == 'week'){
			multiplier = 30;
			timeSpan = 'minute';
			day_from = moment().subtract(5, 'days').format("YYYY-MM-DD");
		}else if(chartType == 'month'){
			multiplier = 1;
			timeSpan = 'day';
			day_from = moment().subtract(30, 'days').format("YYYY-MM-DD");
		}else if(chartType == 'year'){
			multiplier = 1;
			timeSpan = 'day';
			day_from = moment().subtract(360, 'days').format("YYYY-MM-DD");
		}
		day_to = moment().format("YYYY-MM-DD");
		return fetch('https://api.polygon.io/v2/aggs/ticker/RUBY/range/'+multiplier+'/'+timeSpan+'/'+day_from+'/'+day_to+'?unadjusted=true&sort=asc&limit=50000&apiKey='+apiKey)
		.then(
			response => response.json()
		).then(
			data => {
				let results = data.results;
				results.forEach(result => {
					// console.log(moment.unix(result.t/1000).format('YYYY-MM-DD HH:mm'));
					if(chartType == 'month' || chartType == 'year'){
						dayDataResult.push(
							{ time: moment.unix(result.t/1000).format('YYYY-MM-DD'), value: result.c }
						);
					}else{
						dayDataResult.push(
							{ time: result.t/1000, value: result.c }
						);
					}
				});
				// console.log(dayDataResult);

				return dayDataResult;
			}
		)
		
	}
});