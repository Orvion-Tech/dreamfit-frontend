/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@angular/router';
import { TokenService } from '../../../token.service';
import { Component, OnInit } from '@angular/core';
import { DateService } from '../../../date.service';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html',
  styleUrls: ['./trend.component.scss'],
})
export class TrendComponent implements OnInit {
  constructor(
    private dateService: DateService,
    private router: Router,
    private tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    if (this.tokenService.isTokenExpired()) {
      // Token has expired
      localStorage.removeItem('user_id');
      localStorage.removeItem('id_token');
      localStorage.removeItem('token_timestamp');
      this.router.navigate(['/login']);
    } else {
      this.getTrendData();
    }
  }
  async getTrendData() {
    try {
      const response = await fetch('http://192.168.1.103/api/trend/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify(data),
      });

      if (response.ok) {
        const homeData = await response.json();
        this.createChart(homeData);
        console.log(homeData);
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  public chart: unknown;
  public chart2: unknown;

  createChart(daily_data: any) {
    const daily_labels_30: any[] = [];
    const fat_percents_30: any[] = [];
    const weights_30: any[] = [];
    const poopoo_times_30: any[] = [];
    const daily_labels_90: any[] = [];
    const fat_percents_90: any[] = [];
    const weights_90: any[] = [];
    const poopoo_times_90: any[] = [];
    for (const data of daily_data.trend_30_day) {
      const date = this.dateService.formatDate(new Date(data.date_time), 'yyyy-MM-dd');
      daily_labels_30.push(date);
      fat_percents_30.push(data.body_fat);
      weights_30.push(data.weight);
      poopoo_times_30.push(data.poopoo_time);
    }
    for (const data of daily_data.trend_90_day) {
      const date = this.dateService.formatDate(new Date(data.date_time), 'yyyy-MM-dd');
      daily_labels_90.push(date);
      fat_percents_90.push(data.body_fat);
      weights_90.push(data.weight);
      poopoo_times_90.push(data.poopoo_time);
    }
    this.chart = new Chart('MyChart', {
      type: 'line', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: daily_labels_30,
        datasets: [
          {
            label: 'Fat %',
            data: fat_percents_30,
            backgroundColor: '#224DEB',
            borderColor: '#224DEB',
            yAxisID: 'y',
          },
          {
            label: 'Weight (kg)',
            data: weights_30,
            backgroundColor: '#ED7D31',
            borderColor: '#ED7D31',
            // yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },

        scales: {
          y: {
            type: 'linear',
            // display: true,
            position: 'left',
          },
          // y1: {
          //   type: 'linear',
          //   display: true,
          //   position: 'right',

          //   // grid line settings
          //   grid: {
          //     drawOnChartArea: false, // only want the grid lines for one axis to show up
          //   },
          // },
        },
      },
    });
    this.chart2 = new Chart('MyChart2', {
      type: 'line', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: daily_labels_90,
        datasets: [
          {
            label: 'Fat %',
            data: fat_percents_90,
            backgroundColor: '#224DEB',
            borderColor: '#224DEB',
            yAxisID: 'y',
          },
          {
            label: 'Weight (kg)',
            data: weights_90,
            backgroundColor: '#ED7D31',
            borderColor: '#ED7D31',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },

        scales: {
          y: {
            type: 'linear',
            // display: true,
            position: 'left',
          },
        },
      },
    });
  }
}
