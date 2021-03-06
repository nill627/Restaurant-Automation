// Authors: Raj Patel, Mit Patel, Dylan Herman, Moulindra Muchumari, Prabhjot Singh, Nill Patel
// Project Website: https://github.com/Mitbits/Software-Project
import {createChartSingleY} from './chart.js';
import {ArchivedReservations} from '../../imports/api/data/reservation.js'


Template.reservations.helpers({
	/**
	 *@function reservationBarChart
	 *@summary creats a bar chart of archived reservations
	 */
	reservationBarChart: function(){
		var reservationsData =[]

		ArchivedReservations.find({}).forEach(function (a){
			reservationsData.push(a);
		});
		console.log(reservationsData);	
		createChartSingleY({data: reservationsData,
				x:'Hour',
				y:'Count',
				selection:'#reservationChart'
		});

	
	
	}	


});
